const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 chars'],
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    { $match: { productId } },
    {
      $group: {
        _id: '$productId',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  await mongoose.model('Product').findByIdAndUpdate(productId, {
    ratingsQuantity: stats[0]?.nRating || 0,
    ratingsAverage: stats[0]?.avgRating || 4.5,
  });
};

// Update product ratings after saving
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.productId);
});

module.exports = mongoose.model('Review', reviewSchema);
