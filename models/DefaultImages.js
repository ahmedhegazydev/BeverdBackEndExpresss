const mongoose = require('mongoose');

const defaultImagesSchema = new mongoose.Schema(
  {
    name: String,
    image: String,
  },
  { timestamps: true }

);

module.exports = mongoose.model('DefaultImages', defaultImagesSchema);
