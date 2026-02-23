// server.js

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const blogRoutes = require('./routes/blogRoutes');

const app = express();

// Middleware
app.use(cors()); // Mengizinkan request dari Frontend
app.use(express.json()); // Agar bisa membaca body request berupa JSON
app.use(express.urlencoded({ extended: true }));

// Middleware untuk melayani file statis (gambar thumbnail dan cover blog)
app.use('/uploads/thumbnails', express.static(path.join(__dirname, '../public/uploads/thumbnails')));

// ==========================================
// GENERATOR SITEMAP OTOMATIS UNTUK GOOGLE
// ==========================================
app.get('/api/sitemap.xml', async (req, res) => {
    try {
        const baseUrl = 'https://abimantra.my.id'; // Domain utama kamu
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // 1. URL Halaman Statis (Beranda, Login, dll)
        const staticPages = ['', '/login', '/blogs']; // Tambahkan path lain jika ada
        staticPages.forEach(page => {
            xml += `  <url>\n    <loc>${baseUrl}${page}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
        });

        // 2. URL Halaman Dinamis (Ambil HANYA proyek yang di-Publish dari Database)
        // Periksa kembali apakah URL detail proyekmu di Vue menggunakan /project/slug atau format lain
        const [projects] = await db.execute('SELECT slug, created_at FROM projects WHERE is_published = true');
        
        projects.forEach(project => {
            // Ubah format tanggal menjadi YYYY-MM-DD
            const date = new Date(project.created_at).toISOString().split('T')[0];
            xml += `  <url>\n    <loc>${baseUrl}/project/${project.slug}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
        });

        xml += '</urlset>';

        // Set header agar browser dan Google mengenalinya sebagai file XML, bukan teks biasa
        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error("Gagal membuat sitemap:", error);
        res.status(500).send('Internal Server Error');
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/blogs', blogRoutes);

// Test Route Dasar
app.get('/', (req, res) => {
    res.json({ message: 'API Portofolio & Blog' });
});

// Jalankan Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});