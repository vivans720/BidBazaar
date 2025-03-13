const express = require('express');
const { check } = require('express-validator');
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getVendorProducts,
  reviewProduct
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes
router.use(protect);

// Vendor routes
router.post(
  '/',
  authorize('vendor'),
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('category', 'Valid category is required').isIn([
      'handicrafts',
      'paintings',
      'decor',
      'jewelry',
      'furniture',
      'other'
    ]),
    check('startingPrice', 'Starting price must be a positive number').isFloat({ min: 0 }),
    check('duration', 'Duration must be between 1 and 168 hours').isFloat({ min: 1, max: 168 }),
    check('images', 'At least one image is required').isArray({ min: 1 })
  ],
  createProduct
);

router.get('/vendor/products', authorize('vendor'), getVendorProducts);

router
  .route('/:id')
  .put(authorize('vendor'), updateProduct)
  .delete(authorize('vendor'), deleteProduct);

// Admin routes
router.put(
  '/:id/review',
  authorize('admin'),
  [
    check('status', 'Status is required').isIn(['active', 'rejected']),
    check('adminRemarks', 'Admin remarks cannot exceed 500 characters').optional().isLength({ max: 500 })
  ],
  reviewProduct
);

module.exports = router;