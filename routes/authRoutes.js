const express = require("express");
const { check } = require("express-validator");
const {
  register,
  login,
  logout,
  updatePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Debug route to test server connectivity
router.get("/debug", (req, res) => {
  res.json({
    success: true,
    message: "Server is working",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  register
);

router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  login
);

router.get("/logout", logout);

router.put(
  "/updatepassword",
  protect,
  [
    check("currentPassword", "Current password is required").exists(),
    check(
      "newPassword",
      "Please enter a new password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  updatePassword
);

module.exports = router;
