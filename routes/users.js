// routes/users.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../MiddleWare/auth');

// Middleware to check if the authenticated user matches the userId in the URL
const authorizeUser = (req, res, next) => {
    // Assuming authenticateToken sets req.user with the authenticated user's ID (e.g., req.user.id)
    if (!req.user || req.user.id !== req.params.userId) {
        return res.status(403).json({ message: 'Forbidden: You are not authorized to access this user\'s favorites.' });
    }
    next();
};

// ===============================
// User CRUD Operations
// ===============================
router.get('/', authenticateToken, async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.patch('/:id', authenticateToken, async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// GET a user's favorite products
// GET /users/:userId/favourites
router.get('/:userId/favourites', authenticateToken, authorizeUser, async (req, res) => {
    try {
        // Populate the 'favorites' field, which now refers to 'Product'
        const user = await User.findById(req.params.userId).populate('favorites');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.favorites);
    } catch (err) {
        console.error('Error fetching user favorites:', err);
        res.status(500).json({ message: err.message });
    }
});

// ADD a product to a user's favorites
// POST /users/:userId/favourites
router.post('/:userId/favourites', authenticateToken, authorizeUser, async (req, res) => {
    const { productId } = req.body; // Expect productId in the request body

    if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
    }

    try {
        // Check if the product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the product is already in favorites
        if (user.favorites.includes(productId)) {
            return res.status(409).json({ message: 'Product already in favorites' });
        }

        user.favorites.push(productId);
        await user.save();

        // Optionally, populate the added favorite to return its details
        const populatedUser = await User.findById(req.params.userId).populate('favorites');
        const addedFavorite = populatedUser.favorites.find(fav => fav._id.toString() === productId);

        res.status(201).json({ message: 'Product added to favorites', favorite: addedFavorite });
    } catch (err) {
        console.error('Error adding product to favorites:', err);
        res.status(500).json({ message: err.message });
    }
});

// REMOVE a product from a user's favorites
// DELETE /users/:userId/favourites/:productId
router.delete('/:userId/favourites/:productId', authenticateToken, authorizeUser, async (req, res) => {
    const { productId } = req.params; // Changed from variantId to productId

    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the product exists in favorites
        if (!user.favorites.includes(productId)) {
            return res.status(404).json({ message: 'Product not found in favorites' });
        }

        user.favorites = user.favorites.filter(
            (favId) => favId.toString() !== productId
        );
        await user.save();

        res.status(200).json({ message: 'Product removed from favorites' });
    } catch (err) {
        console.error('Error removing product from favorites:', err);
        res.status(500).json({ message: err.message });
    }
});

// export the router module so that server.js file can use it
module.exports = router;
