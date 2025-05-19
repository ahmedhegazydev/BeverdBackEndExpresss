const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { authenticateToken } = require('../MiddleWare/auth');
const multer = require('multer');
const path = require('path');

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

/**
 * @swagger
 * /categories:
 * get:
 * summary: Retrieve a list of categories.
 * security:
 * - bearerAuth: []
 * tags: [Categories]
 * responses:
 * 200:
 * description: A list of categories.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Category'
 * 500:
 * description: Server error.
 */
router.get('/', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /categories/{id}:
 * get:
 * summary: Retrieve a single category by ID.
 * security:
 * - bearerAuth: []
 * tags: [Categories]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * description: The ID of the category to retrieve.
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Category found.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Category'
 * 404:
 * description: Category not found.
 * 500:
 * description: Server error.
 */
router.get('/:id', authenticateToken, async (req, res) => {
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

/**
 * @swagger
 * /categories:
 * post:
 * summary: Create a new category.
 * security:
 * - bearerAuth: []
 * tags: [Categories]
 * requestBody:
 * required: true
 * content:
 * multipart/form-data:
 * schema:
 * type: object
 * properties:
 * name:
 * type: string
 * image:
 * type: string
 * format: binary
 * responses:
 * 201:
 * description: Category created successfully.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Category'
 * 400:
 * description: Bad request.
 * 500:
 * description: Server error.
 */
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        let imageUrl = null;
        if (req.file) {
            imageUrl = req.file.path;  //  Save the file path (e.g., "uploads/image-12345.jpg")
        }

        const category = new Category({
            ...req.body,
            image: imageUrl,
        });

        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /categories/{id}:
 * patch:
 * summary: Update a category by ID.
 * security:
 * - bearerAuth: []
 * tags: [Categories]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * description: The ID of the category to update.
 * schema:
 * type: string
 * requestBody:
 * content:
 * multipart/form-data:
 * schema:
 * type: object
 * properties:
 * name:
 * type: string
 * image:
 * type: string
 * format: binary
 * responses:
 * 200:
 * description: Category updated successfully.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Category'
 * 404:
 * description: Category not found.
 * 500:
 * description: Server error.
 */
router.patch('/:id', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        let imageUrl = null;
        if (req.file) {
            imageUrl = req.file.path;
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                image: imageUrl,
            },
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

/**
 * @swagger
 * /categories/{id}:
 * delete:
 * summary: Delete a category by ID.
 * security:
 * - bearerAuth: []
 * tags: [Categories]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * description: The ID of the category to delete.
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Category deleted successfully.
 * 404:
 * description: Category not found.
 * 500:
 * description: Server error.
 */
router.delete('/:id', authenticateToken, async (req, res) => {
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

module.exports = router;