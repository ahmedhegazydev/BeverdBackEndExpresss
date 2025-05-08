const express = require('express');
const mongoose = require('mongoose');

const { Product, ProductVariant } = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');
const Category = require('./models/Category');
require('dotenv').config();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

const seedAllData = async () => {
  await connectDB();

  // Clean collections
  await Product.deleteMany();
  await ProductVariant.deleteMany();
  await User.deleteMany();
  await Order.deleteMany();
  await Category.deleteMany();

  // Seed Category
  const category = await Category.create({
    name: 'T-Shirts',
    slug: 't-shirts',
    description: 'Comfortable and casual t-shirts',
    image: 'https://example.com/cat.jpg',
    isActive: true,
  });

  // Seed User
  const user = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed-password',
    phone: '01012345678',
    addresses: [
      {
        label: 'Home',
        city: 'Cairo',
        street: 'Tahrir St.',
        zip: '12345',
        location: {
          lat: 30.0444,
          lng: 31.2357,
        },
      },
    ],
  });

  // Seed Product
  const product = await Product.create({
    name: 'Classic Cotton T-Shirt',
    description: '100% Cotton T-Shirt for daily wear',
    brand: 'Beverd',
    basePrice: 150,
    category: category._id,
    isFeatured: true,
    variants: [
      {
        size: 'M',
        color: 'White',
        price: 150,
        stock: 10,
        images: ['https://example.com/white-shirt.jpg'],
      },
      {
        size: 'L',
        color: 'Black',
        price: 150,
        stock: 7,
        images: ['https://example.com/black-shirt.jpg'],
      },
    ],
  });

  // Reference variant by index (embedded)
  const variant1 = product.variants[0];
  const variant2 = product.variants[1];

  // Seed Order
  await Order.create({
    userId: user._id,
    products: [
      {
        variantId: variant1._id,
        quantity: 2,
        price: 150,
      },
      {
        variantId: variant2._id,
        quantity: 1,
        price: 150,
      },
    ],
    totalPrice: 450,
    status: 'pending',
    paymentMethod: 'cash',
    shippingAddress: {
      city: 'Cairo',
      street: 'Tahrir St.',
      zip: '12345',
    },
  });

  console.log('âœ… All Dummy Data Seeded Successfully!');
  process.exit();
};

seedAllData();
