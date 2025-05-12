
// routes/auth.js

const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt'); // Password hashing
const jwt = require('jsonwebtoken'); //JWT for authentication
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // Email sending
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs
const User = require('../models/User'); // Import the User model here


// Email Transport (using ethereal for testing)
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'willy.rohan9@ethereal.email',
        pass: 'ck1Dekgz4Vu5cbrrva'
    }
});


// Helper function to send email
async function sendConfirmationEmail(userEmail, token) {
    const mailOptions = {
        from: 'willy.rohan9@ethereal.email',  // Replace
        to: userEmail,
        subject: 'Confirm your email',
        text: `Please click the following link to confirm your email: http://localhost:3000/auth/confirm/${token}`, //Adjust the link
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send confirmation email.'); //  Important:  Throw the error.
    }
}
// Helper function for password reset email
async function sendResetPasswordEmail(userEmail, token) {
    const mailOptions = {
        from: 'willy.rohan9@ethereal.email',  // Replace
        to: userEmail,
        subject: 'Reset Password',
        text: `Please click the following link to reset your password: http://localhost:3000/auth/reset-password/${token}`, //Adjust
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Reset password email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send reset password email.');
    }
}



// Register API
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, phone, gender  , birthDate} = req.body;

        // Check if email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const confirmationToken = uuidv4();

        // Create new user
        const newUser = new User({
            email,
            name,
            password: hashedPassword,
            phone,
            gender,
            birthDate,
            confirmationToken,
        });
        await newUser.save();

        // Send confirmation email
        await sendConfirmationEmail(email, confirmationToken);

        res.status(201).json({ message: 'User registered successfully. Please check your email to confirm your registration.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Registration failed: ' + error.message }); //Include the error message
    }
});

// Email confirmation API
router.get('/confirm/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Find user by confirmation token
        const user = await User.findOne({ confirmationToken: token });
        if (!user) {
            return res.status(400).json({ message: 'Invalid confirmation token' });
        }

        // Update user status
        user.isVerified = true;
        user.confirmationToken = undefined; // Clear the token
        await user.save();

        res.status(200).json({ message: 'Email confirmed successfully. You can now log in.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Email confirmation failed' });
    }
});

// Login API
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please confirm your email before logging in.' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id, email: user.email }, 'your-secret-key', { // Replace secret key
            expiresIn: '1h',
        });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Login failed' });
    }
});



// Forgot Password API
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: 'If this email exists, a reset password link has been sent.' }); //  Don't reveal if email exists
        }

        const resetPasswordToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
        await user.save();

        await sendResetPasswordEmail(email, resetPasswordToken);
        res.status(200).json({ message: 'If this email exists, a reset password link has been sent.' }); //  Consistent message

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Forgot password failed' });
    }
});

// Reset Password API
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset password token.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Password reset failed' });
    }
});


// export the router module so that server.js file can use it
module.exports = router;