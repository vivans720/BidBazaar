const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters']
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['handicrafts', 'paintings', 'decor', 'jewelry', 'furniture', 'other']
    },
    startingPrice: {
      type: Number,
      required: [true, 'Please add a starting price'],
      min: [0, 'Starting price cannot be negative']
    },
    currentPrice: {
      type: Number,
      default: function() {
        return this.startingPrice;
      }
    },
    duration: {
      type: Number,
      required: [true, 'Please specify auction duration in hours'],
      min: [1, 'Duration must be at least 1 hour'],
      max: [168, 'Duration cannot exceed 7 days']
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: {
      type: Date,
      required: true
    },
    images: [{
      url: {
        type: String,
        required: true
      },
      public_id: String
    }],
    status: {
      type: String,
      enum: ['pending', 'active', 'ended', 'rejected'],
      default: 'pending'
    },
    vendor: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    winner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    adminRemarks: {
      type: String,
      maxlength: [500, 'Admin remarks cannot exceed 500 characters']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add index for better query performance
productSchema.index({ category: 1, status: 1 });
productSchema.index({ vendor: 1, status: 1 });
productSchema.index({ endTime: 1, status: 1 });

module.exports = mongoose.model('Product', productSchema);