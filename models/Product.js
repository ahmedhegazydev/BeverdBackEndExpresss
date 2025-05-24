const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  size: String,
  color: String,
  price: Number,
  stock: Number,
  images: [String], // Array of image URLs for the variant
});

const productSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    brand: String,
    basePrice: Number,
    images: [String], // Array of image URLs for the variant
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    isFeatured: Boolean,
    variants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant' }],
  },
  { timestamps: true }
);

module.exports = {
  Product: mongoose.model('Product', productSchema),
  ProductVariant: mongoose.model('ProductVariant', productVariantSchema),
};
