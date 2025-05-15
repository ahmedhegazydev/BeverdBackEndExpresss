const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables from .env file

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (token == null) return res.sendStatus(401); // No token, Unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification error:", err);
      return res.sendStatus(403); // Invalid token, Forbidden
    }
    req.user = user; // Store the user data in the request object
    next(); // Call the next middleware or route handler
  });
};

module.exports = { authenticateToken };
