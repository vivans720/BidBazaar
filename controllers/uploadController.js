const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Upload image
// @route   POST /api/upload
// @access  Private
exports.uploadImage = async (req, res) => {
  try {
    console.log('Upload request received:', {
      files: req.files,
      body: req.body
    });

    if (!req.files || !req.files.image) {
      console.log('No image file found in request');
      return res.status(400).json({
        success: false,
        error: 'Please upload an image'
      });
    }

    const file = req.files.image;
    console.log('Processing file:', {
      name: file.name,
      type: file.mimetype,
      size: file.size
    });

    // Check file type
    if (!file.mimetype.startsWith('image')) {
      return res.status(400).json({
        success: false,
        error: 'Please upload an image file'
      });
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: 'Image size should be less than 5MB'
      });
    }

    console.log('Uploading to Cloudinary...');
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'bidbazaar',
      width: 800,
      crop: 'scale'
    });

    console.log('Cloudinary upload successful:', result);
    res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error uploading image'
    });
  }
}; 