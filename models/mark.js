const mongoose = require('mongoose');

const markSchema = new mongoose.Schema(
  {
    name: String,
    image: String,
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  },
  { timestamps: true }

);

module.exports = mongoose.model('Mark', markSchema);
