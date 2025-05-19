
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../MiddleWare/auth');
const Review = require('../models/Review');  // Corrected import path

// ===============================
// Review CRUD Operations
// ===============================
router.get('/', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const reviews = await Review.find().populate('userId').populate('productId');
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
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

router.post('/', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    const review = new Review(req.body);
    try {
        const newReview = await review.save();
        res.status(201).json(newReview);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/:id', authenticateToken, async (req, res) => {
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

router.delete('/:id', authenticateToken, async (req, res) => {
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

module.exports = router;
