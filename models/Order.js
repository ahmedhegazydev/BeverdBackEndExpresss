const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    productVariant: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant' },
    ],

    totalPrice: Number,
    discount: Number,
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered'],
      default: 'pending',
    },
    paymentMethod: String,
    shippingAddress: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
