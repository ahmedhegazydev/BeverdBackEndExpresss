const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../MiddleWare/auth');
const Cart = require('../models/Cart');  // Corrected import path

// ===============================
// Cart CRUD Operations
// ===============================
router.get('/', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const carts = await Cart.find().populate('userId').populate('items.productId');
        res.json(carts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
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

router.post('/', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    const cart = new Cart(req.body);
    try {
        const newCart = await cart.save();
        res.status(201).json(newCart);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/:id', authenticateToken, async (req, res) => {
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

router.delete('/:id', authenticateToken, async (req, res) => {
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

module.exports = router;
