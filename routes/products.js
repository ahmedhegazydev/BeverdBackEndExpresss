// routes/products.js
const express = require('express');
const router = express.Router();
const { Product, ProductVariant } = require('../models/Product');
const Category = require('../models/Category');
const { authenticateToken } = require('../MiddleWare/auth');
const multer = require('multer');
const path = require('path');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    },
});

const upload = multer({ storage: storage });

// ===============================================
// PRODUCT VARIANT CRUD Operations - MUST BE FIRST!
// ===============================================

// GET all variants
router.get('/variants', authenticateToken, async (req, res) => {
    try {
        // Populate productId to show product name in frontend table
        const variants = await ProductVariant.find().populate('productId');
        res.json(variants);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new product variant
router.post('/variants', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const { productId, size, color, price, stock } = req.body;
        let images = [];
         if (req.files && Array.isArray(req.files)) {
          // Ensure the path is correct for serving static files
          images = req.files.map(file => `uploads/${file.filename}`);
         }
        const newVariant = new ProductVariant({
            productId, size, color, price, stock, images
        });
        const savedVariant = await newVariant.save();
        res.status(201).json(savedVariant);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH/update a product variant
router.patch('/variants/:id', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const { productId, size, color, price, stock } = req.body;
        let images = [];
         if (req.files && Array.isArray(req.files)) {
          images = req.files.map(file => `uploads/${file.filename}`);
         }
        const updatedVariant = await ProductVariant.findByIdAndUpdate(
            req.params.id,
            { productId, size, color, price, stock, images }, // Update images
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

// DELETE a product variant
router.delete('/variants/:id', authenticateToken, async (req, res) => {
  try {
    const variant = await ProductVariant.findByIdAndDelete(req.params.id);
    if (!variant) {
      return res.status(404).json({ message: 'Variant not found' });
    }
    res.json({ message: 'Variant deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ===============================================
// PRODUCT CRUD Operations - MUST BE AFTER VARIANT ROUTES
// ===============================================

// GET all products
router.get('/',authenticateToken, async (req, res) => {
  try {
    const products = await Product.find().populate('category').populate('variants');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET product by ID (this now comes AFTER /variants to prevent conflict)
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category').populate('variants');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new product
router.post('/', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        let imageUrls = [];
        if (req.files && Array.isArray(req.files)) {
            imageUrls = req.files.map(file => `uploads/${file.filename}`);
        }

        const product = new Product({
            ...req.body,
            images: imageUrls,
        });

        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH/update a product
router.patch('/:id', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const productId = req.params.id;
        const updates = { ...req.body };
        let imageUrls = [];

        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            imageUrls = req.files.map(file => `uploads/${file.filename}`);
            updates.images = imageUrls;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(updatedProduct);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE a product
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;