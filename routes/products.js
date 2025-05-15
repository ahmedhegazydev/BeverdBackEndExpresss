// routes/products.js
const express = require('express');
const router = express.Router();
const { Product, ProductVariant } = require('../models/Product');  // Corrected import path
const Category = require('../models/Category'); // Import the Category model

const { authenticateToken } = require('../MiddleWare/auth');


// ===============================
// Product CRUD Operations
// ===============================
router.get('/',authenticateToken, async (req, res) => {
  try {
    const products = await Product.find().populate('category');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/products/:id', authenticateToken , async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/products', authenticateToken, async (req, res) => {
  // Apply middleware to protect route
  const product = new Product(req.body);
  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/products/:id', authenticateToken, async (req, res) => {
  // Apply middleware to protect route
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/products/:id', authenticateToken, async (req, res) => {
  // Apply middleware to protect route
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ===============================
// Product Variant CRUD Operations
// ===============================
router.get('/variants', authenticateToken, async (req, res) => {
  try {
    const variants = await ProductVariant.find().populate('productId');
    res.json(variants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/variants/:id',authenticateToken, async (req, res) => {
  try {
    const variant = await ProductVariant.findById(req.params.id).populate(
      'productId'
    );
    if (!variant) {
      return res.status(404).json({ message: 'Variant not found' });
    }
    res.json(variant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/variants', authenticateToken, async (req, res) => {
  // Apply middleware to protect route
  const variant = new ProductVariant(req.body);
  try {
    const newVariant = await variant.save();
    res.status(201).json(newVariant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/variants/:id', authenticateToken, async (req, res) => {
  // Apply middleware to protect route
  try {
    const updatedVariant = await ProductVariant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedVariant) {
      return res.status(404).json({ message: 'Variant not found' });
    }
    res.json(updatedVariant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/variants/:id', authenticateToken, async (req, res) => {
  // Apply middleware to protect route
  try {
    const variant = await ProductVariant.findByIdAndDelete(req.params.id);
    if (!variant) {
      return res.status(404).json({ message: 'Variant not found' });
    }
    res.json({ message: 'Variant deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// export the router module so that server.js file can use it
module.exports = router;
