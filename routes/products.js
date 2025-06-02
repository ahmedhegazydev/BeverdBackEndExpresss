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
        // Populate product to show product name in frontend table
        const variants = await ProductVariant.find().populate('product');
        res.json(variants);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new product variant
router.post('/variants', authenticateToken, upload.array('images', 5), async (req, res) => {
    const {
        product, size, color, price, stock,
        collection, designNumber, occasion, gender,
        pattern, closureType, upperMaterial, soleMaterial,
        liningMaterial, toeDesign
    } = req.body;
    const images = req.files ? req.files.map(file => file.path) : [];

    const newVariant = new ProductVariant({
        product, size, color, price, stock,
        collection, designNumber, occasion, gender,
        pattern, closureType, upperMaterial, soleMaterial,
        liningMaterial, toeDesign,
        images
    });

    try {
        const savedVariant = await newVariant.save();
        res.status(201).json(savedVariant);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH/update a product variant
router.patch('/variants/:id', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const variant = await ProductVariant.findById(req.params.id);
        if (!variant) {
            return res.status(404).json({ message: 'Product Variant not found' });
        }

        // Update fields if provided in the request body
        if (req.body.product != null) variant.product = req.body.product;
        if (req.body.size != null) variant.size = req.body.size;
        if (req.body.color != null) variant.color = req.body.color;
        if (req.body.price != null) variant.price = req.body.price;
        if (req.body.stock != null) variant.stock = req.body.stock;
        if (req.body.collection != null) variant.collection = req.body.collection;
        if (req.body.designNumber != null) variant.designNumber = req.body.designNumber;
        if (req.body.occasion != null) variant.occasion = req.body.occasion;
        if (req.body.gender != null) variant.gender = req.body.gender;
        if (req.body.pattern != null) variant.pattern = req.body.pattern;
        if (req.body.closureType != null) variant.closureType = req.body.closureType;
        if (req.body.upperMaterial != null) variant.upperMaterial = req.body.upperMaterial;
        if (req.body.soleMaterial != null) variant.soleMaterial = req.body.soleMaterial;
        if (req.body.liningMaterial != null) variant.liningMaterial = req.body.liningMaterial;
        if (req.body.toeDesign != null) variant.toeDesign = req.body.toeDesign;

        // Handle new images (if any)
        if (req.files && req.files.length > 0) {
            variant.images = req.files.map(file => file.path); // Replace existing images
        }

        const updatedVariant = await variant.save();
        res.status(200).json(updatedVariant);
    } catch (err) {
        res.status(400).json({ message: err.message });
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
router.get('/', authenticateToken, async (req, res) => {
    try {
        const products = await Product.find().populate('category').populate('variants').populate('mark');
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET product by ID (this now comes AFTER /variants to prevent conflict)
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category').populate('variants').populate('mark');
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
        const product = req.params.id;
        const updates = { ...req.body };
        let imageUrls = [];

        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            imageUrls = req.files.map(file => `uploads/${file.filename}`);
            updates.images = imageUrls;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            product,
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