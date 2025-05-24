// routes/products.js
const express = require('express');
const router = express.Router();
const { Product, ProductVariant } = require('../models/Product');  // Corrected import path
const Category = require('../models/Category'); // Import the Category model

const { authenticateToken } = require('../MiddleWare/auth');
const multer = require('multer');
const path = require('path');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Store files in the 'uploads' directory (create this folder)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension); // e.g., image-1678884323-1234567.jpg
    },
});

const upload = multer({ storage: storage });


// ===============================
// Product CRUD Operations
// ===============================
router.get('/',authenticateToken, async (req, res) => {
  try {
    const products = await Product.find().populate('category');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', authenticateToken , async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/*
Important: This code assumes your frontend sends the images in a field named "images" using FormData. The paths stored in the database (/uploads/${file.filename}) are relative to your server. You'll need to make sure these files are accessible to your frontend (e.g., by configuring Express to serve files from the uploads directory).
*/
// Use upload.array middleware to handle multiple image uploads
router.post('/', authenticateToken, upload.array('images', 5), async (req, res) => { // 'images' is the field name in the form, 5 is max number of files
    const { name, description, brand, basePrice, category, isFeatured } = req.body;
    let images = [];
     if (req.files && Array.isArray(req.files)) {
        images = req.files.map(file => `/uploads/${file.filename}`); // Store file paths
    }

    const product = new Product({
        name,
        description,
        brand,
        basePrice,
        category,
        isFeatured,
        images, // Save the array of image paths
    });

    try {
        const newProduct = await product.save();

        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});



router.patch('/:id', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, brand, basePrice, category, isFeatured } = req.body;

          let images = [];
        if (req.files && Array.isArray(req.files)) {
            images = req.files.map(file => `/uploads/${file.filename}`);
        }


        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { name, description, brand, basePrice, category, isFeatured, images }, // Also update images
            { new: true }
        );
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(updatedProduct);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.delete('/:id', authenticateToken, async (req, res) => {
  // Apply middleware to protect route
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ===============================
// Product Variant CRUD Operations
// ===============================
router.get('/variants', authenticateToken, async (req, res) => {
  try {
    const variants = await ProductVariant.find().populate('productId');
    res.json(variants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/variants/:id',authenticateToken, async (req, res) => {
  try {
    const variant = await ProductVariant.findById(req.params.id).populate(
      'productId'
    );
    if (!variant) {
      return res.status(404).json({ message: 'Variant not found' });
    }
    res.json(variant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Use upload.array for variant image uploads
router.post('/variants', authenticateToken, upload.array('images', 5), async (req, res) => {
    const { productId, size, color, price, stock } = req.body;

      let images = [];
      if (req.files && Array.isArray(req.files)) {
        images = req.files.map(file => `/uploads/${file.filename}`);
    }

    const variant = new ProductVariant({
        productId,
        size,
        color,
        price,
        stock,
        images, // Save image paths
    });
    try {
        const newVariant = await variant.save();
        res.status(201).json(newVariant);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/variants/:id', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const { productId, size, color, price, stock } = req.body;
        let images = [];
         if (req.files && Array.isArray(req.files)) {
          images = req.files.map(file => `/uploads/${file.filename}`);
         }
        const updatedVariant = await ProductVariant.findByIdAndUpdate(
            req.params.id,
            { productId, size, color, price, stock, images }, // Update images
            { new: true }
        );
        if (!updatedVariant) {
            return res.status(404).json({ message: 'Variant not found' });
        }
        res.json(updatedVariant);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/variants/:id', authenticateToken, async (req, res) => {
  // Apply middleware to protect route
  try {
    const variant = await ProductVariant.findByIdAndDelete(req.params.id);
    if (!variant) {
      return res.status(404).json({ message: 'Variant not found' });
    }
    res.json({ message: 'Variant deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// export the router module so that server.js file can use it
module.exports = router;
