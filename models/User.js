const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  label: String,
  city: String,
  street: String,
  zip: String,
  location: {
    lat: Number,
    lng: Number,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    phone: String,
    gender: { type: String, enum: ['male', 'female'] },
    birthDate: Date,
    addresses: [addressSchema],
    favorites: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant' },
    ],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }], // ✅ added here
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
