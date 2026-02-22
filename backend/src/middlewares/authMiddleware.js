// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

// 1. Middleware untuk mengecek apakah user sudah login (punya token yang valid)
exports.verifyToken = (req, res, next) => {
    // Biasanya frontend mengirim token lewat header Authorization: "Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Akses ditolak. Token tidak ditemukan!' });
    }

    try {
        // Verifikasi token menggunakan secret key dari .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Simpan data user dari token ke dalam request agar bisa dipakai di controller
        req.user = decoded; 
        
        // Lanjut ke proses berikutnya (controller)
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token tidak valid atau sudah kedaluwarsa!' });
    }
};

// 2. Middleware khusus untuk mengecek apakah user adalah Admin
exports.isAdmin = (req, res, next) => {
    // req.user didapat dari middleware verifyToken di atas
    if (req.user && req.user.role === 'admin') {
        next(); // Lanjut, karena dia admin
    } else {
        return res.status(403).json({ message: 'Akses ditolak. Hanya Admin yang diizinkan!' });
    }
};