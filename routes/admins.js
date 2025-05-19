
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../MiddleWare/auth');
const Admin = require('../models/Admin');  // Corrected import path

// ===============================
// Admin CRUD Operations
// ===============================
router.get('/', authenticateToken, async (req, res) => {
    // Apply middleware to protect route
    try {
        const admins = await Admin.find();
        res.json(admins);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
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

router.post('/', async (req, res) => {
    //  No auth for admin creation
    const admin = new Admin(req.body);
    try {
        const newAdmin = await admin.save();
        res.status(201).json(newAdmin);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/:id', authenticateToken, async (req, res) => {
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

router.delete('/:id', authenticateToken, async (req, res) => {
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