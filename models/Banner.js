const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    name: String,
    image: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    isMiddleBanner: Boolean,
    isProductDetailsBanner: Boolean
  },
  { timestamps: true }

);

module.exports = mongoose.model('Banner', bannerSchema);
