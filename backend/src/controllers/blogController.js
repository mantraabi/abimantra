// src/controllers/blogController.js
const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// 1. Dapatkan semua blog
exports.getAllBlogs = async (req, res) => {
    try {
        // PERBAIKAN: Tambahkan b.category di dalam SELECT
        const [blogs] = await db.execute(`
            SELECT b.id, b.title, b.slug, b.cover_image, b.is_published, b.category, b.created_at, u.name as author_name 
            FROM blogs b 
            LEFT JOIN users u ON b.author_id = u.id 
            WHERE b.is_published = true 
            ORDER BY b.created_at DESC
        `);
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: 'Kesalahan server.' });
    }
};

// 2. Dapatkan blog berdasarkan slug
exports.getBlogBySlug = async (req, res) => {
    try {
        // b.* otomatis akan mengambil semua kolom, termasuk 'category' yang baru kita buat di database
        const [blogs] = await db.execute(
            'SELECT b.*, u.name as author_name FROM blogs b LEFT JOIN users u ON b.author_id = u.id WHERE b.slug = ?',
            [req.params.slug]
        );
        if (blogs.length === 0) return res.status(404).json({ message: 'Artikel tidak ditemukan' });
        res.json(blogs[0]);
    } catch (error) {
        res.status(500).json({ message: 'Kesalahan server.' });
    }
};

// 3. Tambah blog baru
exports.createBlog = async (req, res) => {
    // PERBAIKAN: Tangkap category dari req.body
    const { title, slug, content, is_published, category } = req.body;
    const author_id = req.user.id; // Dari token login Admin
    let cover_image = null;

    if (req.file) {
        cover_image = `/uploads/thumbnails/${req.file.filename}`;
    }

    try {
        const publishedStatus = is_published === 'true' || is_published === '1';
        
        // PERBAIKAN: Tambahkan category ke query INSERT dan VALUES
        await db.execute(
            'INSERT INTO blogs (author_id, title, slug, content, cover_image, is_published, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [author_id, title, slug, content, cover_image, publishedStatus, category || 'Uncategorized']
        );
        res.status(201).json({ message: 'Artikel blog berhasil dibuat!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal membuat blog.' });
    }
};

// 4. Update blog
exports.updateBlog = async (req, res) => {
    // PERBAIKAN: Tangkap category dari req.body
    const { title, slug, content, is_published, category } = req.body;
    const blogId = req.params.id;

    try {
        // PERBAIKAN: Ambil category lama juga di SELECT
        const [oldData] = await db.execute('SELECT cover_image, category FROM blogs WHERE id = ?', [blogId]);
        if (oldData.length === 0) return res.status(404).json({ message: 'Artikel tidak ditemukan' });

        let cover_image = oldData[0].cover_image;
        const publishedStatus = is_published === 'true' || is_published === '1';

        if (req.file) {
            cover_image = `/uploads/thumbnails/${req.file.filename}`;
        }

        // PERBAIKAN: Tentukan finalCategory (kalau form kosong, pakai data lama)
        const finalCategory = category || oldData[0].category || 'Uncategorized';

        // PERBAIKAN: Tambahkan category=? di query UPDATE
        await db.execute(
            'UPDATE blogs SET title=?, slug=?, content=?, cover_image=?, is_published=?, category=? WHERE id=?',
            [title, slug, content, cover_image, publishedStatus, finalCategory, blogId]
        );
        res.json({ message: 'Artikel berhasil diperbarui!' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui blog.' });
    }
};

// 5. Hapus blog
exports.deleteBlog = async (req, res) => {
    const blogId = req.params.id;
    try {
        const [blogs] = await db.execute('SELECT cover_image FROM blogs WHERE id = ?', [blogId]);
        if (blogs.length === 0) return res.status(404).json({ message: 'Artikel tidak ditemukan' });

        await db.execute('DELETE FROM blogs WHERE id = ?', [blogId]);

        // Hapus gambar cover fisik
        if (blogs[0].cover_image) {
            const imageName = blogs[0].cover_image.split('/').pop();
            const imagePath = path.join(__dirname, '../../public/uploads/thumbnails/', imageName);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }

        res.json({ message: 'Artikel berhasil dihapus!' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus blog.' });
    }
};