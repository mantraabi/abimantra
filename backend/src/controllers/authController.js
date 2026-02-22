// src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// ==========================================
// KONFIGURASI PENGIRIM EMAIL (NODEMAILER)
// ==========================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ==========================================
// 1. FUNGSI REGISTER (Manual) - UPDATE OTP
// ==========================================
exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const [existingUsers] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) return res.status(400).json({ message: 'Email sudah terdaftar.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Buat 6 digit angka acak untuk OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Masukkan ke database, is_verified otomatis FALSE bawaan database
        await db.execute(
            'INSERT INTO users (name, email, password, role, otp_code) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, 'user', otpCode]
        );

        // Kirim Email OTP ke pendaftar
        const mailOptions = {
            from: `"OTP Abimantra" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Kode Verifikasi Pendaftaran',
            html: `<h3>Halo ${name},</h3>
                   <p>Terima kasih telah mendaftar. Berikut adalah kode verifikasi OTP Anda:</p>
                   <h1 style="color: #2563eb; letter-spacing: 5px;">${otpCode}</h1>
                   <p>Masukkan kode ini di halaman website untuk mengaktifkan akun Anda.</p>`
        };
        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'Registrasi berhasil! Silakan periksa email Anda untuk kode OTP.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// ==========================================
// 2. FUNGSI VERIFIKASI OTP (BARU)
// ==========================================
exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });

        const user = users[0];

        if (user.is_verified) return res.status(400).json({ message: 'Akun ini sudah terverifikasi.' });
        if (user.otp_code !== otp) return res.status(400).json({ message: 'Kode OTP salah.' });

        // Jika OTP benar, aktifkan akun dan hapus kode OTP dari database
        await db.execute('UPDATE users SET is_verified = TRUE, otp_code = NULL WHERE email = ?', [email]);

        res.json({ message: 'Verifikasi berhasil! Anda sekarang bisa login.' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// ==========================================
// 3. FUNGSI LOGIN (Manual) - UPDATE CEK VERIFIKASI
// ==========================================
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ message: 'Email atau password salah.' });

        const user = users[0];

        // CEK APAKAH AKUN SUDAH DIVERIFIKASI
        if (!user.is_verified) {
            return res.status(403).json({ 
                message: 'Akun belum diverifikasi.', 
                needsVerification: true // Flag ini akan dibaca oleh Vue untuk memunculkan form OTP
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Email atau password salah.' });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Fungsi Login / Register otomatis via Google
exports.googleLogin = async (req, res) => {
    const { credential } = req.body;
    if (!credential) {
        console.error("Data body yang diterima server:", req.body);
        return res.status(400).json({ message: 'Token Google kosong atau tidak diterima server.' });
    }
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    try {
        // 1. Verifikasi token ke server Google
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        // 2. Ambil data profil (email, nama, foto) dari Google
        const payload = ticket.getPayload();
        const email = payload.email;
        const name = payload.name;

        // 3. Cek apakah email ini sudah ada di database MySQL kita
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        let user;

        if (users.length === 0) {
            // JIKA BELUM ADA: Daftarkan otomatis (Auto-Register)
            // Buat password acak yang sangat panjang karena user Google tidak butuh password manual
            const randomPassword = crypto.randomBytes(16).toString('hex');
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            
            // Masukkan ke database dengan role 'user'
            const [result] = await db.execute(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [name, email, hashedPassword, 'user']
            );
            
            user = { id: result.insertId, name, email, role: 'user' };
        } else {
            // JIKA SUDAH ADA: Langsung ambil datanya
            user = users[0];
        }

        // 4. Buatkan Token JWT buatan aplikasi kita sendiri untuk sesi login
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 5. Kirim sukses ke Frontend
        res.json({
            message: 'Login Google berhasil!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Error Google Login:", error);
        res.status(401).json({ message: 'Gagal verifikasi token Google.' });
    }
};