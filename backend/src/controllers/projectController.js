// src/controllers/projectController.js
const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// 1. Tampilkan proyek (Bisa untuk Publik & Admin)
exports.getAllProjects = async (req, res) => {
    try {
        // Jika frontend mengirim query ?admin=true, ambil semua proyek (termasuk Draft)
        // Jika tidak, hanya ambil proyek yang is_published = true (Untuk pengunjung publik)
        const isAdminRequest = req.query.admin === 'true';
        
        let sqlQuery = 'SELECT id, title, slug, description, thumbnail_url, demo_url, is_published, category, created_at FROM projects';
        
        if (!isAdminRequest) {
            sqlQuery += ' WHERE is_published = true';
        }
        
        sqlQuery += ' ORDER BY created_at DESC'; // Urutkan dari yang terbaru

        const [projects] = await db.execute(sqlQuery);
        res.json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// 2. Tambah proyek baru (Khusus Admin)
exports.createProject = async (req, res) => {
    const { title, slug, description, demo_url, is_published, category } = req.body;
    
    let thumbnail_url = null;
    let file_path = null;

    if (req.files && req.files.thumbnail) {
        thumbnail_url = `/uploads/thumbnails/${req.files.thumbnail[0].filename}`;
    }

    if (req.files && req.files.project_file) {
        file_path = req.files.project_file[0].filename;
    }

    try {
        // Mengubah input teks dari form (true/false) menjadi tipe boolean sesungguhnya
        const publishedStatus = is_published === 'true' || is_published === '1' || is_published === true;

        await db.execute(
            'INSERT INTO projects (title, slug, description, thumbnail_url, demo_url, file_path, is_published, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, slug, description, thumbnail_url, demo_url, file_path, publishedStatus, category || 'Uncategorized']
        );
        
        res.status(201).json({ message: 'Proyek dan file berhasil diunggah!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menambah proyek ke database.' });
    }
};

// 3. Proses Download Aman (Khusus User Login)
exports.downloadProject = async (req, res) => {
    const projectId = req.params.id;
    const userId = req.user.id; 

    try {
        const [projects] = await db.execute('SELECT file_path, title FROM projects WHERE id = ?', [projectId]);
        
        if (projects.length === 0 || !projects[0].file_path) {
            return res.status(404).json({ message: 'File proyek tidak ditemukan.' });
        }

        const project = projects[0];

        await db.execute(
            'INSERT INTO download_logs (user_id, project_id) VALUES (?, ?)',
            [userId, projectId]
        );

        const absolutePath = path.join(__dirname, '../../public/uploads/projects/', project.file_path);

        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({ message: 'File fisik tidak ditemukan di server.' });
        }

        res.download(absolutePath, `${project.title}.zip`, (err) => {
            if (err) {
                console.error("Gagal mengirim file:", err);
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan saat memproses download.' });
    }
};

// 4. Detail Proyek berdasarkan Slug (Untuk Publik)
exports.getProjectBySlug = async (req, res) => {
    try {
        const [projects] = await db.execute(
            'SELECT id, title, slug, description, thumbnail_url, demo_url, is_published, category, created_at FROM projects WHERE slug = ?',
            [req.params.slug]
        );
        
        if (projects.length === 0) return res.status(404).json({ message: 'Proyek tidak ditemukan' });
        res.json(projects[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// 5. Update Proyek (Khusus Admin)
exports.updateProject = async (req, res) => {
    const { title, slug, description, demo_url, is_published, category } = req.body;
    const projectId = req.params.id;

    try {
        const [oldData] = await db.execute('SELECT thumbnail_url, file_path, category FROM projects WHERE id = ?', [projectId]);
        if (oldData.length === 0) return res.status(404).json({ message: 'Proyek tidak ditemukan' });

        let thumbnail_url = oldData[0].thumbnail_url;
        let file_path = oldData[0].file_path;
        
        // Memastikan tipe datanya boolean
        const publishedStatus = is_published === 'true' || is_published === '1' || is_published === true;

        if (req.files && req.files.thumbnail) {
            thumbnail_url = `/uploads/thumbnails/${req.files.thumbnail[0].filename}`;
        }
        if (req.files && req.files.project_file) {
            file_path = req.files.project_file[0].filename;
        }

        const finalCategory = category || oldData[0].category || 'Uncategorized';

        await db.execute(
            'UPDATE projects SET title=?, slug=?, description=?, thumbnail_url=?, demo_url=?, file_path=?, is_published=?, category=? WHERE id=?',
            [title, slug, description, thumbnail_url, demo_url, file_path, publishedStatus, finalCategory, projectId]
        );
        res.json({ message: 'Proyek berhasil diperbarui!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal memperbarui proyek.' });
    }
};

// 6. Hapus Proyek beserta file fisiknya (Khusus Admin)
exports.deleteProject = async (req, res) => {
    const projectId = req.params.id;
    try {
        const [projects] = await db.execute('SELECT thumbnail_url, file_path FROM projects WHERE id = ?', [projectId]);
        if (projects.length === 0) return res.status(404).json({ message: 'Proyek tidak ditemukan' });

        const project = projects[0];

        await db.execute('DELETE FROM projects WHERE id = ?', [projectId]);

        if (project.file_path) {
            const zipPath = path.join(__dirname, '../../public/uploads/projects/', project.file_path);
            if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
        }

        if (project.thumbnail_url) {
            const thumbName = project.thumbnail_url.split('/').pop();
            const thumbPath = path.join(__dirname, '../../public/uploads/thumbnails/', thumbName);
            if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
        }

        res.json({ message: 'Proyek dan file fisik berhasil dihapus!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menghapus proyek.' });
    }
};