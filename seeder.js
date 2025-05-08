const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Models
const User = require('./models/User');
const Category = require('./models/Category');
const { Product, ProductVariant } = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');

const dropAllCollections = async () => {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    await mongoose.connection.collections[collectionName].deleteMany({});
  }
  console.log('✅ All collections cleared.');
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await dropAllCollections();

    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Cart.deleteMany();
    await Order.deleteMany();

    // Create category
    const category = await Category.create({
      name: 'Shirts',
      slug: 'shirts',
      description: 'Comfortable cotton shirts',
      image: 'https://example.com/category.jpg',
      isActive: true,
    });

    // Create user
    const hashedPassword = await bcrypt.hash('123456', 10);
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      phone: '01012345678',
      gender: 'male',
      birthDate: new Date('1995-01-01'),
      addresses: [
        {
          label: 'Home',
          city: 'Cairo',
          street: 'Tahrir St',
          zip: '12345',
          location: { lat: 30.0444, lng: 31.2357 },
        },
      ],
    });

    // 1. Define variant input
    const variantData = [
      {
        size: 'M',
        color: 'White',
        price: 100,
        stock: 10,
        images: ['https://example.com/white.jpg'],
      },
      {
        size: 'L',
        color: 'Black',
        price: 110,
        stock: 5,
        images: ['https://example.com/black.jpg'],
      },
    ];

    // 2. Create empty product first
    const product = await Product.create({
      name: 'Cotton Shirt',
      description: 'Breathable cotton for daily wear',
      brand: 'Beverd',
      basePrice: 100,
      category: category._id,
      isFeatured: true,
      variants: [], // temporary, we’ll fill in below
    });

    // 3. Create ProductVariant documents linked to this product
    const savedVariants = await Promise.all(
      variantData.map(variant =>
        ProductVariant.create({
          ...variant,
          productId: product._id,
        })
      )
    );

    // 4. Now update product to reference those variants
    product.variants = savedVariants.map(v => v._id); // use ObjectIds here
    await product.save();

    // Create cart
    await Cart.create({
      userId: user._id,
      items: [
        {
          productId: product._id,
          size: 'M',
          color: 'White',
          quantity: 2,
        },
        {
          productId: product._id,
          size: 'L',
          color: 'Black',
          quantity: 1,
        },
      ],
    });

    // 5. Create order with exact same variant IDs
    const order = await Order.create({
      userId: user._id,
      productVariant: savedVariants.map(v => v._id), // same variant IDs
      totalPrice: 310,
      discount: 0,
      paymentMethod: 'cash',
      shippingAddress: user.addresses[0],
    });

    // 6. Link order to user
    user.orders = [order._id];
    await user.save();

    console.log('✅ Dummy data seeded successfully.');
    process.exit();
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seed();
