const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner'); // Assuming your Banner model is in ../models/Banner.js
const { authenticateToken } = require('../MiddleWare/auth'); // Assuming your auth middleware is here
const multer = require('multer');
const path = require('path');

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Images will be stored in the 'uploads/' directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    },
});

const upload = multer({ storage: storage });

// GET all banners
router.get('/', authenticateToken , async (req, res) => {
    try {
        // Populate the 'category' field to get category details
        const banners = await Banner.find().populate('category');
        res.status(200).json(banners);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET a single banner by ID
router.get('/:id',authenticateToken, async (req, res) => {
    try {
        // Populate the 'category' field to get category details
        const banner = await Banner.findById(req.params.id).populate('category');
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }
        res.status(200).json(banner);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE a new banner (with image upload, requires authentication)
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
    const { name, category, isMiddleBanner, isProductDetailsBanner } = req.body;
    const image = req.file ? req.file.path : null; // Get the path of the uploaded image

    const newBanner = new Banner({
        name,
        image,
        category, // category ID
        isMiddleBanner: isMiddleBanner === 'true', // Convert string to boolean
        isProductDetailsBanner: isProductDetailsBanner === 'true' // Convert string to boolean
    });

    try {
        const savedBanner = await newBanner.save();
        res.status(201).json(savedBanner);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE a banner by ID (with optional new image upload, requires authentication)
router.patch('/:id', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        if (req.body.name != null) {
            banner.name = req.body.name;
        }
        if (req.file) {
            banner.image = req.file.path; // Update image path if a new image is uploaded
        }
        if (req.body.category != null) {
            banner.category = req.body.category;
        }
        if (req.body.isMiddleBanner != null) {
            banner.isMiddleBanner = req.body.isMiddleBanner === 'true'; // Convert string to boolean
        }
        if (req.body.isProductDetailsBanner != null) {
            banner.isProductDetailsBanner = req.body.isProductDetailsBanner === 'true'; // Convert string to boolean
        }

        const updatedBanner = await banner.save();
        res.status(200).json(updatedBanner);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a banner by ID (requires authentication)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        await Banner.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Banner deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
