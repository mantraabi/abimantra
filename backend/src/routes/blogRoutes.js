// src/routes/blogRoutes.js
const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Publik
router.get('/', blogController.getAllBlogs);
router.get('/:slug', blogController.getBlogBySlug);

// Admin (Kita gunakan upload.single('cover_image') karena blog hanya butuh 1 gambar)
router.post('/', verifyToken, isAdmin, upload.single('cover_image'), blogController.createBlog);
router.put('/:id', verifyToken, isAdmin, upload.single('cover_image'), blogController.updateBlog);
router.delete('/:id', verifyToken, isAdmin, blogController.deleteBlog);

module.exports = router;