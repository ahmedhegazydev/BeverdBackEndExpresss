// routes/defaultImages.js
const express = require('express');
const router = express.Router();
const DefaultImages = require('../models/DefaultImages'); // Import the DefaultImages model
const { authenticateToken } = require('../MiddleWare/auth'); // Assuming you have authentication middleware
const multer = require('multer');
const path = require('path');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Store files in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension); // e.g., image-1678884323-1234567.jpg
    },
});

const upload = multer({ storage: storage });

// ===============================
// DefaultImages CRUD Operations
// ===============================

// GET all default images
router.get('/', authenticateToken, async (req, res) => {
    try {
        const defaultImages = await DefaultImages.find();
        res.json(defaultImages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET a single default image by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const defaultImage = await DefaultImages.findById(req.params.id);
        if (!defaultImage) {
            return res.status(404).json({ message: 'Default image not found' });
        }
        res.json(defaultImage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new default image
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        let imageUrl = null;
        if (req.file) {
            // Save the relative file path (e.g., "uploads/image-12345.jpg")
            imageUrl = `uploads/${req.file.filename}`;
        }

        const defaultImage = new DefaultImages({
            name: req.body.name, // Assuming 'name' is sent in the body
            image: imageUrl,
        });

        const newDefaultImage = await defaultImage.save();
        res.status(201).json(newDefaultImage);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH/update a default image
router.patch('/:id', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const imageId = req.params.id;
        const updates = { ...req.body };
        let imageUrl = null;

        if (req.file) {
            imageUrl = `uploads/${req.file.filename}`;
            updates.image = imageUrl; // Update image path if new file is uploaded
        }

        const updatedDefaultImage = await DefaultImages.findByIdAndUpdate(
            imageId,
            updates,
            { new: true, runValidators: true } // Return the updated document and run schema validators
        );

        if (!updatedDefaultImage) {
            return res.status(404).json({ message: 'Default image not found' });
        }
        res.json(updatedDefaultImage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE a default image
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const defaultImage = await DefaultImages.findByIdAndDelete(req.params.id);
        if (!defaultImage) {
            return res.status(404).json({ message: 'Default image not found' });
        }
        res.json({ message: 'Default image deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;