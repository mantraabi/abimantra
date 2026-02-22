// src/middlewares/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Fungsi pembantu untuk memastikan folder ada, jika tidak, otomatis dibuatkan
const ensureDirectoryExistence = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Konfigurasi Penyimpanan (Storage)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dest = 'public/uploads/';
        
        // Pisahkan folder berdasarkan nama field (input) dari frontend
        if (file.fieldname === 'thumbnail' || file.fieldname === 'cover_image') { // <-- Tambahkan cover_image
            dest += 'thumbnails/'; 
        } else if (file.fieldname === 'project_file') {
            dest += 'projects/';
        }
        
        ensureDirectoryExistence(dest); // Pastikan foldernya sudah ada
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        // Buat nama file menjadi unik (Mencegah file dengan nama sama tertimpa)
        // Contoh: 1678901234-namafileasal.zip
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter File (Keamanan agar tidak sembarang file bisa diupload)
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'thumbnail' || file.fieldname === 'cover_image') {
        // Hanya izinkan gambar
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Format file tidak didukung! Thumbnail harus berupa gambar.'), false);
        }
    } else if (file.fieldname === 'project_file') {
        // Izinkan file zip atau rar
        if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed' || file.mimetype === 'application/vnd.rar') {
            cb(null, true);
        } else {
            cb(new Error('Format file tidak didukung! File proyek harus .zip atau .rar'), false);
        }
    } else {
        cb(null, true);
    }
};

// Inisialisasi Multer
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // Batas maksimal ukuran file: 50MB (bisa disesuaikan)
    }
});

module.exports = upload;