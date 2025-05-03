const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const productVariantSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  size: String,
  color: String,
  price: Number,
  stock: Number,
  images: [String],
});

const productSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    brand: String,
    basePrice: Number,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    isFeatured: Boolean,
  },
  { timestamps: true }
);

module.exports = {
  Product: mongoose.model('Product', productSchema),
  ProductVariant: mongoose.model('ProductVariant', productVariantSchema),
};
