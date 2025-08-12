const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");

// @desc    Send contact form email
// @route   POST /api/contact/send
// @access  Public
exports.sendContactEmail = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: "Please fill in all required fields",
      details: errors.array(),
    });
  }

  const { name, email, subject, message, category } = req.body;

  try {
    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS, // Your Gmail app password
      },
    });

    // Email content to you (the admin)
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: "bidbazaar00@gmail.com", // Your email where you want to receive messages
      subject: `BidBazaar Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
            New Contact Form Submission - BidBazaar
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Contact Details</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Category:</strong> ${
              category.charAt(0).toUpperCase() + category.slice(1)
            }</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #374151; margin-top: 0;">Message</h3>
            <p style="line-height: 1.6; color: #4b5563;">${message}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #dbeafe; border-radius: 8px;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              <strong>Note:</strong> This message was sent through the BidBazaar contact form. 
              Please reply directly to the sender's email: ${email}
            </p>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Sent from BidBazaar Contact Form | ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
    };

    // Confirmation email to the sender
    const confirmationMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank you for contacting BidBazaar!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
            Thank you for contacting BidBazaar!
          </h2>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Hi ${name},</p>
            <p>Thank you for reaching out to us! We have received your message and will get back to you within 24-48 hours.</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #374151; margin-top: 0;">Your Message Details:</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Category:</strong> ${
              category.charAt(0).toUpperCase() + category.slice(1)
            }</p>
            <p><strong>Your Message:</strong></p>
            <p style="background-color: #f8fafc; padding: 15px; border-radius: 4px; color: #4b5563;">${message}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #ecfdf5; border-radius: 8px;">
            <p style="margin: 0; color: #047857; font-size: 14px;">
              <strong>What's next?</strong> Our team will review your message and respond to you at this email address. 
              In the meantime, feel free to explore our platform and discover amazing auction deals!
            </p>
          </div>
          
          <div style="margin-top: 20px; text-align: center;">
            <p style="color: #6b7280;">Best regards,<br>The BidBazaar Team</p>
          </div>
        </div>
      `,
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(confirmationMailOptions),
    ]);

    res.status(200).json({
      success: true,
      message: "Message sent successfully! We will get back to you soon.",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send message. Please try again later.",
    });
  }
};
