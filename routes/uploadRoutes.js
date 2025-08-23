const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadImage, uploadMultipleImages } = require('../controllers/uploadController');

// Single image upload
router.post('/', protect, uploadImage);

// Multiple images upload
router.post('/multiple', protect, uploadMultipleImages);

module.exports = router;