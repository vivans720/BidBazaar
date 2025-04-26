const User = require('../models/userModel');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Create user object
    const userData = {
      name,
      email,
      password,
      role: role || 'buyer' // Default to buyer if role not specified
    };

    // Handle profile image upload if provided
    if (req.files && req.files.profileImage) {
      const file = req.files.profileImage;

      // Make sure the image is a photo
      if (!file.mimetype.startsWith('image')) {
        return res.status(400).json({
          success: false,
          error: 'Please upload an image file'
        });
      }

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: 'Image must be less than 5MB'
        });
      }

      // Create upload directory if it doesn't exist
      const uploadDir = './uploads/users';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Create custom filename
      const fileName = `user-${Date.now()}${path.parse(file.name).ext}`;
      
      // Move file to upload directory
      await file.mv(`${uploadDir}/${fileName}`);
      
      // Set profile image path with absolute URL
      const profileImageUrl = `${req.protocol}://${req.get('host')}/uploads/users/${fileName}`;
      userData.profileImage = profileImageUrl;
    }

    // Create user
    user = await User.create(userData);

    // Generate JWT token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    console.log('Login attempt with body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid input',
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    console.log('Password match:', isMatch ? 'Yes' : 'No');

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Create token
    const token = user.getSignedJwtToken();
    console.log('Token generated successfully');

    // Send response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      details: error.message
    });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {}
  });
};

// @desc    Change password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(req.body.currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};