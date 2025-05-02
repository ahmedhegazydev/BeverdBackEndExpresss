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

const uri =
  'mongodb+srv://engahmedhegazy2025:frb5N5iPBAnQZHdc@cluster0.mvid4sh.mongodb.net/all-data?retryWrites=true&w=majority&appName=Cluster0';
mongoose
  .connect(uri)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(err => console.log(err));
