const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const { sendContactEmail } = require("../controllers/contactController");

/**
 * @route   POST /api/contact/send
 * @desc    Send contact form email
 * @access  Public
 */
router.post(
  "/send",
  [
    check(
      "name",
      "Name is required and must be at least 2 characters"
    ).isLength({ min: 2 }),
    check("email", "Please include a valid email").isEmail(),
    check(
      "subject",
      "Subject is required and must be at least 5 characters"
    ).isLength({ min: 5 }),
    check(
      "message",
      "Message is required and must be at least 10 characters"
    ).isLength({ min: 10 }),
    check("category", "Category is required").notEmpty(),
  ],
  sendContactEmail
);

module.exports = router;
