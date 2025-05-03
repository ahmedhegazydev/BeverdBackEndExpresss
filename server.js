const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.get('/', (req, res) => {
  res.send('hello root node'); // this gets executed when you visit http://localhost:3000/
});

// Include route files
const usersRoute = require('./routes/users');
const productsRoute = require('./routes/products');

// Use routes
app.use('/users', usersRoute);
app.use('/products', productsRoute);

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
