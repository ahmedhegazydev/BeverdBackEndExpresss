const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    name: String,
    image: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },

  },
  { timestamps: true }

);

module.exports = mongoose.model('Banner', markSchema);
