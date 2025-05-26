const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express'); // Import swagger-ui-express
const swaggerSpec = require('./swagger');  // Import the swagger specification
const cors = require('cors');
// Enable CORS for specific origins (recommended for development and production)
const corsOptions = {
  origin: 'http://localhost:4200', // Allow requests from your Angular app
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Specify allowed HTTP methods
  credentials: true, // If you need to handle cookies or authorization headers
  allowedHeaders: 'Content-Type, Authorization', // Specify allowed request headers
};

require('dotenv').config();

const app = express();

// Middleware to parse JSON bodies
app.use(cors(corsOptions));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// ONLY use these for routes that expect JSON or URL-encoded data.
// They should come AFTER static file serving, but BEFORE your routes.
// However, they should NOT interfere with multer-handled routes.
// The key is that multer's parser will consume the body BEFORE these general parsers.
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

app.get('/', (req, res) => {
  res.send('hello root node'); // this gets executed when you visit http://localhost:3000/
});
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Serve Swagger documentation


// Include route files
const usersRoute = require('./routes/users');
const productsRoute = require('./routes/products');
const authRoute = require('./routes/auth');
const orderRoute = require('./routes/order');
const categoryRoute = require('./routes/category');
const cartRoute = require('./routes/cart');
const reviewRoute = require('./routes/reviews');
const returnsRoute = require('./routes/returns');
const adminsRoute = require('./routes/admins');
const defaultImagesRoute = require('./routes/defaultImagesRoute'); // ADD THIS LINE

// Use routes
app.use('/users', usersRoute);
app.use('/products', productsRoute);
app.use('/orders', orderRoute);
app.use('/auth', authRoute);
app.use('/categories', categoryRoute);
app.use('/carts', cartRoute);
app.use('/reviews', reviewRoute);
app.use('/returns', returnsRoute);
app.use('/default-images', defaultImagesRoute);

//app.use('/admins', adminsRoute);

const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(err => {
    console.log(err);
    process.exit(1);
  });
