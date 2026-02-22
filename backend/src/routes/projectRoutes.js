// src/routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// ==========================================
// RUTE PUBLIK (Bisa diakses tanpa login)
// ==========================================

// 1. Dapatkan semua proyek
router.get('/', projectController.getAllProjects);

// 2. Dapatkan detail proyek berdasarkan slug
router.get('/:slug', projectController.getProjectBySlug);


// ==========================================
// RUTE TERPROTEKSI (Harus Login / Admin)
// ==========================================

// 3. Download proyek (Khusus user yang sudah login)
router.get('/:id/download', verifyToken, projectController.downloadProject);

// 4. Tambah proyek baru (Khusus Admin) -> INI YANG TADI KEMUNGKINAN HILANG (404)
router.post(
    '/', 
    verifyToken, 
    isAdmin, 
    upload.fields([
        { name: 'thumbnail', maxCount: 1 }, 
        { name: 'project_file', maxCount: 1 }
    ]), 
    projectController.createProject
);

// 5. Edit proyek (Khusus Admin)
router.put(
    '/:id', 
    verifyToken, 
    isAdmin, 
    upload.fields([
        { name: 'thumbnail', maxCount: 1 }, 
        { name: 'project_file', maxCount: 1 }
    ]), 
    projectController.updateProject
);

// 6. Hapus proyek (Khusus Admin)
router.delete('/:id', verifyToken, isAdmin, projectController.deleteProject);

module.exports = router;