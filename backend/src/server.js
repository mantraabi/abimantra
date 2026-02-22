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