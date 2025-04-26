const express = require('express');
const { check } = require('express-validator');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getMe,
  updateProfile,
  updateProfileImage
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Routes for all authenticated users
router.get('/me', getMe);
router.put(
  '/updateprofile',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail()
  ],
  updateProfile
);
router.put('/updateprofileimage', updateProfileImage);

// Admin only routes
router.use(authorize('admin'));

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;