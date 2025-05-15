

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../MiddleWare/auth');
const { Order } = require('../models/Order');  // Corrected import path


// ===============================
// Order CRUD Operations
// ===============================
router.get('/', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const orders = await Order.find().populate('userId').populate('productVariant');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/orders/:id', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const order = await Order.findById(req.params.id).populate('userId').populate('productVariant');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/orders', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    const order = new Order(req.body);
    try {
        const newOrder = await order.save();
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/orders/:id', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(updatedOrder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/orders/:id', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
