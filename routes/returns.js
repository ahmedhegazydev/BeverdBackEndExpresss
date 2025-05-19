
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../MiddleWare/auth');
const Return = require('../models/Return');  // Corrected import path


// ===============================
// Return CRUD Operations
// ===============================
router.get('/', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const returns = await Return.find().populate('userId').populate('orderId').populate('product.variantId');
        res.json(returns);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
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

router.post('/', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    const returnObj = new Return(req.body);
    try {
        const newReturn = await returnObj.save();
        res.status(201).json(newReturn);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/:id', authenticateToken, async (req, res) => {
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

router.delete('/:id', authenticateToken, async (req, res) => {
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


module.exports = router;
