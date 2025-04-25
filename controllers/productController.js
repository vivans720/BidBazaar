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
    // First, update any expired auctions
    await updateExpiredAuctions();
    
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
      // By default, show only active products for public viewing
      if (!req.user || req.user.role !== 'admin') {
        query.status = 'active';
      }
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
    // Populate both vendor and winner fields for complete sale information
    const product = await Product.findById(req.params.id)
      .populate('vendor', 'name email')
      .populate('winner', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // Check if auction has expired and update status if needed
    const now = new Date();
    if (product.status === 'active' && new Date(product.endTime) < now) {
      product.status = 'ended';
      await product.save();
      console.log(`Updated product ${product._id} status to ended`);
    }

    // Allow viewing of all products regardless of status
    // This ensures users can view auction results
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
    const products = await Product.find({ vendor: req.user.id })
      .populate('winner', 'name email')
      .populate('vendor', 'name email');

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

// @desc    Review product (admin only)
// @route   PUT /api/products/:id/review
// @access  Private/Admin
exports.reviewProduct = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    
    if (!status || !['active', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid status (active or rejected)'
      });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // Only allow reviewing pending products
    if (product.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Cannot review ${product.status} products`
      });
    }
    
    product.status = status;
    if (adminRemarks) {
      product.adminRemarks = adminRemarks;
    }
    
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

// Utility function to check and update expired auctions
const updateExpiredAuctions = async (productsToCheck) => {
  const now = new Date();
  
  // If we received specific products to check
  if (productsToCheck && Array.isArray(productsToCheck)) {
    for (const product of productsToCheck) {
      if (product.status === 'active' && new Date(product.endTime) < now) {
        product.status = 'ended';
        await product.save();
        console.log(`Updated product ${product._id} status to ended`);
      }
    }
    return productsToCheck;
  }
  
  // If no specific products provided, update all expired active products in the database
  const expiredProducts = await Product.find({
    status: 'active',
    endTime: { $lt: now }
  });
  
  console.log(`Found ${expiredProducts.length} expired auctions to update`);
  
  for (const product of expiredProducts) {
    product.status = 'ended';
    await product.save();
    console.log(`Updated product ${product._id} status to ended`);
  }
  
  return expiredProducts;
};

module.exports = {
  createProduct: exports.createProduct,
  getProducts: exports.getProducts,
  getProduct: exports.getProduct,
  updateProduct: exports.updateProduct,
  deleteProduct: exports.deleteProduct,
  getVendorProducts: exports.getVendorProducts,
  reviewProduct: exports.reviewProduct
};