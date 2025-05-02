const express = require('express');
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
