const cloudinary = require("cloudinary").v2;

// Configure Cloudinary with better security settings
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  force_version: false,
});

// Disable strict SSL for development if needed
if (process.env.NODE_ENV === "development") {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
}

// @desc    Upload single image
// @route   POST /api/upload
// @access  Private
exports.uploadImage = async (req, res) => {
  try {
    console.log("Upload request received:", {
      files: req.files,
      body: req.body,
    });

    if (!req.files || !req.files.image) {
      console.log("No image file found in request");
      return res.status(400).json({
        success: false,
        error: "Please upload an image",
      });
    }

    const file = req.files.image;
    console.log("Processing file:", {
      name: file.name,
      type: file.mimetype,
      size: file.size,
    });

    // Check file type
    if (!file.mimetype.startsWith("image")) {
      return res.status(400).json({
        success: false,
        error: "Please upload an image file",
      });
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: "Image size should be less than 5MB",
      });
    }

    console.log("Uploading to Cloudinary...");

    // Upload to Cloudinary with additional options and retry logic
    let result;
    try {
      result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "bidbazaar",
        width: 800,
        crop: "scale",
        secure: true,
        timeout: 120000, // Increased timeout
        use_filename: true,
        unique_filename: false,
        resource_type: "auto",
      });
    } catch (cloudinaryError) {
      console.error("Cloudinary upload failed:", cloudinaryError);

      // Fallback: try with insecure connection if TLS error
      if (
        cloudinaryError.message.includes("TLS") ||
        cloudinaryError.message.includes("CERT")
      ) {
        console.log("Attempting fallback upload without secure connection...");
        try {
          result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "bidbazaar",
            width: 800,
            crop: "scale",
            secure: false, // Fallback to HTTP
            timeout: 120000,
            use_filename: true,
            unique_filename: false,
            resource_type: "auto",
          });
        } catch (fallbackError) {
          throw new Error(
            "Upload failed even with fallback. Please check your network connection."
          );
        }
      } else {
        throw cloudinaryError;
      }
    }

    console.log("Cloudinary upload successful:", result);
    res.status(200).json({
      success: true,
      url: result.secure_url || result.url, // Fallback to non-secure URL if needed
      public_id: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", {
      error: error,
      message: error.message,
      stack: error.stack,
    });

    // Provide more specific error messages
    let errorMessage = "Error uploading image";
    if (error.message.includes("TLS") || error.message.includes("CERT")) {
      errorMessage =
        "Network connection error. Please check your internet connection and try again.";
    } else if (error.message.includes("timeout")) {
      errorMessage = "Upload timeout. Please try again with a smaller image.";
    } else if (error.message.includes("format")) {
      errorMessage = "Invalid image format. Please upload a valid image file.";
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Helper function to upload single file to Cloudinary
const uploadSingleFile = async (file) => {
  // Check file type
  if (!file.mimetype.startsWith("image")) {
    throw new Error("Please upload an image file");
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image size should be less than 5MB");
  }

  // Upload to Cloudinary with retry logic
  let result;
  try {
    result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "bidbazaar",
      width: 800,
      crop: "scale",
      secure: true,
      timeout: 120000,
      use_filename: true,
      unique_filename: false,
      resource_type: "auto",
    });
  } catch (cloudinaryError) {
    console.error("Cloudinary upload failed:", cloudinaryError);

    // Fallback: try with insecure connection if TLS error
    if (
      cloudinaryError.message.includes("TLS") ||
      cloudinaryError.message.includes("CERT")
    ) {
      console.log("Attempting fallback upload without secure connection...");
      try {
        result = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: "bidbazaar",
          width: 800,
          crop: "scale",
          secure: false,
          timeout: 120000,
          use_filename: true,
          unique_filename: false,
          resource_type: "auto",
        });
      } catch (fallbackError) {
        throw new Error(
          "Upload failed even with fallback. Please check your network connection."
        );
      }
    } else {
      throw cloudinaryError;
    }
  }

  return {
    url: result.secure_url || result.url,
    public_id: result.public_id,
  };
};

// @desc    Upload multiple images
// @route   POST /api/upload/multiple
// @access  Private
exports.uploadMultipleImages = async (req, res) => {
  try {
    console.log("Multiple upload request received:", {
      files: req.files,
      body: req.body,
    });

    if (!req.files || !req.files.images) {
      return res.status(400).json({
        success: false,
        error: "Please upload at least one image",
      });
    }

    let files = req.files.images;
    
    // If single file is uploaded, convert to array
    if (!Array.isArray(files)) {
      files = [files];
    }

    // Limit to maximum 5 images
    if (files.length > 5) {
      return res.status(400).json({
        success: false,
        error: "Maximum 5 images allowed per product",
      });
    }

    console.log(`Processing ${files.length} files...`);

    const uploadPromises = files.map(async (file, index) => {
      try {
        console.log(`Uploading file ${index + 1}:`, {
          name: file.name,
          type: file.mimetype,
          size: file.size,
        });
        
        const result = await uploadSingleFile(file);
        console.log(`File ${index + 1} uploaded successfully`);
        return result;
      } catch (error) {
        console.error(`Error uploading file ${index + 1}:`, error.message);
        throw new Error(`Failed to upload ${file.name}: ${error.message}`);
      }
    });

    const uploadedImages = await Promise.all(uploadPromises);
    
    console.log(`All ${uploadedImages.length} images uploaded successfully`);
    
    res.status(200).json({
      success: true,
      images: uploadedImages,
      count: uploadedImages.length,
    });
  } catch (error) {
    console.error("Multiple upload error:", {
      error: error,
      message: error.message,
      stack: error.stack,
    });

    // Provide more specific error messages
    let errorMessage = "Error uploading images";
    if (error.message.includes("TLS") || error.message.includes("CERT")) {
      errorMessage =
        "Network connection error. Please check your internet connection and try again.";
    } else if (error.message.includes("timeout")) {
      errorMessage = "Upload timeout. Please try again with smaller images.";
    } else if (error.message.includes("format")) {
      errorMessage = "Invalid image format. Please upload valid image files.";
    } else if (error.message.includes("Failed to upload")) {
      errorMessage = error.message;
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
