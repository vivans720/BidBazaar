const express = require("express");
const { check } = require("express-validator");
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getMe,
  updateProfile,
  updateProfileImage,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Routes for all authenticated users
router.get("/me", getMe);
router.put(
  "/updateprofile",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
  ],
  updateProfile
);
router.put("/updateprofileimage", updateProfileImage);

// Admin only routes
router.use(authorize("admin"));

router.get("/", getUsers);
router.get("/:id", getUser);
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
    check("role", "Role is required").not().isEmpty(),
  ],
  createUser
);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
