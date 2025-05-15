const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Product, ProductVariant } = require('../models/Product');  // Corrected import path
const User = require('../models/User');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Cart = require('../models/Cart');
const Review = require('../models/Review');
const Return = require('../models/Return');
const Admin = require('../models/Admin'); // Import Admin model
const { authenticateToken } = require('./auth'); // Import the authentication middleware




// ===============================
// Category CRUD Operations
// ===============================
router.get('/categories', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/categories/:id', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/categories', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    const category = new Category(req.body);
    try {
        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/categories/:id', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(updatedCategory);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/categories/:id', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ===============================
// Cart CRUD Operations
// ===============================
router.get('/carts', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const carts = await Cart.find().populate('userId').populate('items.productId');
        res.json(carts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/carts/:id', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const cart = await Cart.findById(req.params.id).populate('userId').populate('items.productId');
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/carts', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    const cart = new Cart(req.body);
    try {
        const newCart = await cart.save();
        res.status(201).json(newCart);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/carts/:id', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const updatedCart = await Cart.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!updatedCart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        res.json(updatedCart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/carts/:id', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const cart = await Cart.findByIdAndDelete(req.params.id);
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        res.json({ message: 'Cart deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ===============================
// Review CRUD Operations
// ===============================
router.get('/reviews', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const reviews = await Review.find().populate('userId').populate('productId');
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/reviews/:id', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const review = await Review.findById(req.params.id).populate('userId').populate('productId');
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.json(review);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/reviews', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    const review = new Review(req.body);
    try {
        const newReview = await review.save();
        res.status(201).json(newReview);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/reviews/:id', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const updatedReview = await Review.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedReview) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.json(updatedReview);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/reviews/:id', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.json({ message: 'Review deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ===============================
// Return CRUD Operations
// ===============================
router.get('/returns', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const returns = await Return.find().populate('userId').populate('orderId').populate('product.variantId');
        res.json(returns);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/returns/:id', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const returnObj = await Return.findById(req.params.id).populate('userId').populate('orderId').populate('product.variantId');
        if (!returnObj) {
            return res.status(404).json({ message: 'Return not found' });
        }
        res.json(returnObj);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/returns', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    const returnObj = new Return(req.body);
    try {
        const newReturn = await returnObj.save();
        res.status(201).json(newReturn);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/returns/:id', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const updatedReturn = await Return.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedReturn) {
            return res.status(404).json({ message: 'Return not found' });
        }
        res.json(updatedReturn);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/returns/:id', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const returnObj = await Return.findByIdAndDelete(req.params.id);
        if (!returnObj) {
            return res.status(404).json({ message: 'Return not found' });
        }
        res.json({ message: 'Return deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ===============================
// Admin CRUD Operations
// ===============================
router.get('/admins', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const admins = await Admin.find();
        res.json(admins);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/admins/:id', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const admin = await Admin.findById(req.params.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json(admin);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/admins', async (req, res) => {
    //  No auth for admin creation
    const admin = new Admin(req.body);
    try {
        const newAdmin = await admin.save();
        res.status(201).json(newAdmin);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/admins/:id', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const updatedAdmin = await Admin.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedAdmin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json(updatedAdmin);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/admins/:id', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const admin = await Admin.findByIdAndDelete(req.params.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json({ message: 'Admin deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
