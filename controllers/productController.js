const Product = require('../models/productModel');
const { validationResult } = require('express-validator');

// @desc    Create new product listing
// @route   POST /api/products
// @access  Private/Vendor
exports.createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Add vendor to req.body
    req.body.vendor = req.user.id;
    
    // Calculate end time
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + req.body.duration * 60 * 60 * 1000);
    req.body.endTime = endTime;

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { category, status, sort, page = 1, limit = 10 } = req.query;
    const query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by status
    if (status) {
      query.status = status;
    } else {
      // By default, show only active products
      query.status = 'active';
    }

    // Sorting
    let sortQuery = {};
    if (sort) {
      switch (sort) {
        case 'price-asc':
          sortQuery = { currentPrice: 1 };
          break;
        case 'price-desc':
          sortQuery = { currentPrice: -1 };
          break;
        case 'ending-soon':
          sortQuery = { endTime: 1 };
          break;
        default:
          sortQuery = { createdAt: -1 };
      }
    }

    const products = await Product.find(query)
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('vendor', 'name');

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendor', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Vendor
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Make sure user is product vendor
    if (product.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this product'
      });
    }

    // Don't allow updating certain fields after product is active
    if (product.status !== 'pending') {
      const restrictedFields = ['startingPrice', 'duration', 'endTime'];
      const hasRestrictedFields = restrictedFields.some(field => req.body[field]);
      
      if (hasRestrictedFields) {
        return res.status(400).json({
          success: false,
          error: 'Cannot update price or duration once product is active'
        });
      }
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Vendor
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Make sure user is product vendor
    if (product.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this product'
      });
    }

    // Only allow deletion if product is pending or rejected
    if (!['pending', 'rejected'].includes(product.status)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete active or ended products'
      });
    }

    await product.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get vendor products
// @route   GET /api/products/vendor
// @access  Private/Vendor
exports.getVendorProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user.id });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Review product (approve/reject)
// @route   PUT /api/products/:id/review
// @access  Private/Admin
exports.reviewProduct = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;

    if (!['active', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    if (product.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Can only review pending products'
      });
    }

    product.status = status;
    product.adminRemarks = adminRemarks;
    await product.save();

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};