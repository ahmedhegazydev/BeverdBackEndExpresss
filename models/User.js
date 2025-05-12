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
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    gender: { type: String, enum: ['male', 'female'] },
    birthDate: Date,
    isVerified: { type: Boolean, default: false },
    confirmationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    addresses: [addressSchema],
    favorites: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant' },
    ],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }], // ✅ added here

    // models/User.js
    otp: String,
    otpExpires: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
