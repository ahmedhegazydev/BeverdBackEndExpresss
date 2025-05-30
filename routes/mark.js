const express = require('express');
const router = express.Router();
const Mark = require('../models/Mark');
const { authenticateToken } = require('../MiddleWare/auth'); // Import your authentication middleware
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

// GET all marks (might not require auth if marks are public)
router.get('/', authenticateToken , async (req, res) => {
    try {
        const marks = await Mark.find().populate('products'); // Populate products associated with each mark
        res.status(200).json(marks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET a single mark by ID (might not require auth if marks are public)
router.get('/:id', authenticateToken,async (req, res) => {
    try {
        const mark = await Mark.findById(req.params.id).populate('products');
        if (!mark) {
            return res.status(404).json({ message: 'Mark not found' });
        }
        res.status(200).json(mark);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE a new mark (requires authentication)
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
    const { name } = req.body;
    const image = req.file ? req.file.path : null; // Get the path of the uploaded image

    const newMark = new Mark({
        name,
        image
    });

    try {
        const savedMark = await newMark.save();
        res.status(201).json(savedMark);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE a mark by ID (requires authentication)
router.patch('/:id', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const mark = await Mark.findById(req.params.id);
        if (!mark) {
            return res.status(404).json({ message: 'Mark not found' });
        }

        if (req.body.name != null) {
            mark.name = req.body.name;
        }
        if (req.file) {
            mark.image = req.file.path; // Update image path if a new image is uploaded
        }

        const updatedMark = await mark.save();
        res.status(200).json(updatedMark);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a mark by ID (requires authentication)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const mark = await Mark.findById(req.params.id);
        if (!mark) {
            return res.status(404).json({ message: 'Mark not found' });
        }

        await Mark.deleteOne({ _id: req.params.id }); // Use deleteOne for Mongoose 6+
        res.status(200).json({ message: 'Mark deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
