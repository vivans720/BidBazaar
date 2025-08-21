const express = require('express');
const { check } = require('express-validator');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getVendorProducts,
  reviewProduct,
  relistProduct,
  removeUnsoldProduct,
  getPriceRecommendation
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protect all routes after this middleware
router.use(protect);

// Vendor routes
router.get('/vendor/products', authorize('vendor'), getVendorProducts);
router.post(
  '/',
  authorize('vendor'),
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('startingPrice', 'Starting price must be a positive number').isFloat({ min: 0 }),
    check('duration', 'Duration must be between 1 and 168 hours').isFloat({ min: 1, max: 168 })
  ],
  createProduct
);

// Admin routes
router.put('/:id/review', authorize('admin'), reviewProduct);

// Vendor routes
router.put(
  '/:id',
  authorize('vendor'),
  [
    check('title', 'Title is required').optional().not().isEmpty(),
    check('description', 'Description is required').optional().not().isEmpty(),
    check('startingPrice', 'Starting price must be a positive number').optional().isFloat({ min: 0 }),
    check('duration', 'Duration must be between 1 and 168 hours').optional().isFloat({ min: 1, max: 168 })
  ],
  updateProduct
);

router.delete('/:id', authorize('vendor'), deleteProduct);

// Vendor routes for unsold products
router.get('/:id/price-recommendation', authorize('vendor'), getPriceRecommendation);
router.post('/:id/relist', authorize('vendor'), relistProduct);
router.delete('/:id/remove', authorize('vendor'), removeUnsoldProduct);

module.exports = router;