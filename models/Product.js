const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  size: String,
  color: String,
  price: Number,
  stock: Number,
  collection: String,
  designNumber: String,
  occasion: String,
  gender: String,
  pattern: String,
  closureType: String,
  upperMaterial: String,
  soleMaterial: String,
  liningMaterial: String,
  toeDesign: String,
  images: [String], // Array of image URLs
});

module.exports = mongoose.model('ProductVariant', productVariantSchema);

const productSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    brand: String,
    basePrice: Number,
    numOfOrders: Number,
    images: [String],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    mark: { type: mongoose.Schema.Types.ObjectId, ref: 'Mark' },
    isFeatured: Boolean,
    isOurOffersExciting: Boolean,
    variants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant' }],

    deliveryNote: {
      type: String,
      default: 'توصيل سريع - يوصل غدًا !',
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = {
  Product: mongoose.model('Product', productSchema),
  ProductVariant: mongoose.model('ProductVariant', productVariantSchema),
};
