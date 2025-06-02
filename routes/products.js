// routes/products.js
const express = require('express');
const router = express.Router();
const { Product, ProductVariant } = require('../models/Product');
const Category = require('../models/Category'); // Make sure Category is imported
const Mark = require('../models/Mark'); // Make sure Mark is imported
const Order = require('../models/Order'); //To Get NumOfOrders in (calculate-product-orders)
 
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
// PRODUCT VARIANT CRUD Operations
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
    const { product, size, color, price, stock, collection, designNumber, occasion, gender, pattern, closureType, upperMaterial, soleMaterial, liningMaterial, toeDesign } = req.body;
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
        // Optional: Add variant to its associated product's variants array
        if (product) {
            await Product.findByIdAndUpdate(product, { $push: { variants: savedVariant._id } });
        }
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

        // Store old product if it changes
        const oldProduct = variant.product;

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

        // If product changed, update product's variants array
        if (oldProduct && oldProduct.toString() !== updatedVariant.product.toString()) {
            await Product.findByIdAndUpdate(oldProduct, { $pull: { variants: variant._id } });
            await Product.findByIdAndUpdate(updatedVariant.product, { $push: { variants: updatedVariant._id } });
        } else if (!oldProduct && updatedVariant.product) { // If it was null and now has a product
             await Product.findByIdAndUpdate(updatedVariant.product, { $push: { variants: updatedVariant._id } });
        }


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
        // Remove variant from its associated product's variants array
        if (variant.product) {
            await Product.findByIdAndUpdate(variant.product, { $pull: { variants: variant._id } });
        }
        res.json({ message: 'Variant deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ===============================================
// PRODUCT CRUD Operations
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

// GET product by ID
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

        // === CRITICAL ADDITION: Link product to category ===
        if (newProduct.category) {
            await Category.findByIdAndUpdate(
                newProduct.category,
                { $push: { products: newProduct._id } },
                { new: true, useFindAndModify: false }
            );
        }
        // === CRITICAL ADDITION: Link product to mark ===
        if (newProduct.mark) {
            await Mark.findByIdAndUpdate( // Assuming Mark model is imported and available
                newProduct.mark,
                { $push: { products: newProduct._id } },
                { new: true, useFindAndModify: false }
            );
        }

        res.status(201).json(newProduct);
    } catch (err) {
        console.error('Error creating product:', err); // Log the full error
        res.status(400).json({ message: err.message });
    }
});

// PATCH/update a product
router.patch('/:id', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const productId = req.params.id;
        const updates = { ...req.body };
        let imageUrls = [];

        // Store old category and mark for unlinking if they change
        const oldProduct = await Product.findById(productId);
        const oldCategoryId = oldProduct ? oldProduct.category : null;
        const oldMarkId = oldProduct ? oldProduct.mark : null;

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

        // === CRITICAL ADDITION: Update category linkage ===
        const newCategoryId = updatedProduct.category;
        if (oldCategoryId && (!newCategoryId || oldCategoryId.toString() !== newCategoryId.toString())) {
            // Remove product from old category
            await Category.findByIdAndUpdate(oldCategoryId, { $pull: { products: updatedProduct._id } });
        }
        if (newCategoryId && (!oldCategoryId || oldCategoryId.toString() !== newCategoryId.toString())) {
            // Add product to new category
            await Category.findByIdAndUpdate(newCategoryId, { $push: { products: updatedProduct._id } });
        }

        // === CRITICAL ADDITION: Update mark linkage ===
        const newMarkId = updatedProduct.mark;
        if (oldMarkId && (!newMarkId || oldMarkId.toString() !== newMarkId.toString())) {
            // Remove product from old mark
            await Mark.findByIdAndUpdate(oldMarkId, { $pull: { products: updatedProduct._id } });
        }
        if (newMarkId && (!oldMarkId || oldMarkId.toString() !== newMarkId.toString())) {
            // Add product to new mark
            await Mark.findByIdAndUpdate(newMarkId, { $push: { products: updatedProduct._id } });
        }

        res.json(updatedProduct);
    } catch (err) {
        console.error('Error updating product:', err); // Log the full error
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

        // === CRITICAL ADDITION: Unlink product from category ===
        if (product.category) {
            await Category.findByIdAndUpdate(
                product.category,
                { $pull: { products: product._id } },
                { new: true, useFindAndModify: false }
            );
        }
        // === CRITICAL ADDITION: Unlink product from mark ===
        if (product.mark) {
            await Mark.findByIdAndUpdate(
                product.mark,
                { $pull: { products: product._id } },
                { new: true, useFindAndModify: false }
            );
        }
        // Optional: Delete associated variants as well
        // await ProductVariant.deleteMany({ productId: product._id });


        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Route to calculate and update numOfOrders for all products
// This route should ideally be protected and/or run as a scheduled task
router.post('/calculate-product-orders', authenticateToken, async (req, res) => {
    try {
        // Step 1: Aggregate orders to count occurrences of each productVariant
        const variantOrderCounts = await Order.aggregate([
            // Unwind productVariant array to handle multiple variants per order if applicable
            { $unwind: '$productVariant' },
            // Group by productVariant to count orders for each variant
            {
                $group: {
                    _id: '$productVariant',
                    orderCount: { $sum: 1 }
                }
            }
        ]);

        // Step 2: Map variant counts to their respective products
        const productOrderMap = new Map();

        for (const variantCount of variantOrderCounts) {
            const variantId = variantCount._id;
            const orderCount = variantCount.orderCount;

            // Find the ProductVariant to get its associated product
            const productVariant = await ProductVariant.findById(variantId).select('product');

            if (productVariant && productVariant.product) {
                const product = productVariant.product.toString();
                productOrderMap.set(product, (productOrderMap.get(product) || 0) + orderCount);
            }
        }

        // Step 3: Update numOfOrders for each product
        const updatePromises = [];
        for (const [product, totalOrders] of productOrderMap.entries()) {
            updatePromises.push(
                Product.findByIdAndUpdate(product, { numOfOrders: totalOrders }, { new: true })
            );
        }

        // Execute all update promises
        await Promise.all(updatePromises);

        // Optional: Set numOfOrders to 0 for products that had no orders
        await Product.updateMany(
            { _id: { $nin: Array.from(productOrderMap.keys()) } },
            { numOfOrders: 0 }
        );


        res.status(200).json({ message: 'numOfOrders updated successfully for all products.' });

    } catch (error) {
        console.error('Error calculating and updating product orders:', error);
        res.status(500).json({ message: 'Failed to calculate and update product orders', error: error.message });
    }
});

module.exports = router;
