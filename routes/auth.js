
// routes/auth.js

const express = require('express');
const router = express.Router();
require('dotenv').config(); // Load environment variables from .env file
const bcrypt = require('bcrypt'); // Password hashing
const jwt = require('jsonwebtoken'); //JWT for authentication
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // Email sending
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs
const User = require('../models/User'); // Import the User model here
// Generate a 64-byte (512-bit) random key
//const secretKeyBuffer = crypto.randomBytes(64);
// Convert the buffer to a hexadecimal string
//const secretKey = secretKeyBuffer.toString('hex');

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
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}
async function sendOtpEmail(userEmail, otp) {
    const mailOptions = {
        from: 'willy.rohan9@ethereal.email',
        to: userEmail,
        subject: 'رمز التحقق من البريد الإلكتروني',
        text: `رمز التحقق الخاص بك هو: ${otp}`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('OTP email sent:', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send OTP email');
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


// Function to generate a new access token
const generateAccessToken = (user) => {
    return jwt.sign({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '5h', // Access token expires in 15 minutes
    });
};

// Function to generate a new refresh token
const generateRefreshToken = (user) => {
    return jwt.sign({ userId: user._id, email: user.email, role: user.role }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d', // Refresh token expires in 7 days
    });
};

// Register API
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, phone, gender, birthDate, role } = req.body;

        // Check if email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const confirmationToken = uuidv4();
        const otp = generateOTP();
        // Create new user
        const newUser = new User({
            email,
            name,
            password: hashedPassword,
            phone,
            gender,
            birthDate,
            confirmationToken,
            role,
            otp,
            otpExpires: Date.now() + 3600000//1 hour// Date.now() + 10 * 60 * 1000, // valid for 10 min
        });
        await newUser.save();

        // Send confirmation email
        await sendOtpEmail(email, otp);

        res.status(201).json({ message: 'User registered successfully. Please check your email to confirm your registration.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Registration failed: ' + error.message }); //Include the error message
    }
});

// Email confirmation API
router.get('/confirm/:otp', async (req, res) => {
    try {
        const { otp } = req.params;
        // Find user by confirmation token
        const user = await User.findOne({ otp: otp });
        if (!user) {
            return res.status(400).json({ message: 'Invalid confirmation otp' });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Expired OTP' });
        }
        // Update user status
        user.isVerified = true;
        //user.otp = undefined; // Clear the token
        await user.save();
        
        // Generate new access and refresh tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Add the new refresh token to the user's refreshTokens array
        user.refreshTokens.push(refreshToken);
        await user.save();
        res.status(200).json({ message: 'Login successfully', token: accessToken, refreshToken, user: user });
        //res.status(200).json({ message: 'Email confirmed successfully. You can now log in.', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Email confirmation failed' });
    }
});


// Refresh Token API
router.post('/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh Token is required' });
    }

    try {
        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        // Find the user by ID from the decoded token
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the refresh token exists in the user's stored tokens
        if (!user.refreshTokens.includes(refreshToken)) {
            // If the refresh token is not found, it might be a revoked token or an attack attempt
            // Optionally, you could revoke all refresh tokens for this user to mitigate
            user.refreshTokens = []; // Revoke all tokens for this user
            await user.save();
            return res.status(403).json({ message: 'Invalid or revoked refresh token. Please log in again.' });
        }

        // Generate a new access token
        const newAccessToken = generateAccessToken(user);

        // Optionally, implement refresh token rotation:
        // 1. Invalidate the old refresh token (remove it from the array)
        // 2. Generate a new refresh token and add it to the array
        // This makes refresh tokens single-use, improving security.
        // For simplicity, this example just issues a new access token without rotating the refresh token.
        // If you want rotation:
        // user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        // const newRefreshToken = generateRefreshToken(user);
        // user.refreshTokens.push(newRefreshToken);
        // await user.save();
        // res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });

        res.status(200).json({ token: newAccessToken }); // If not rotating refresh token

    } catch (error) {
        console.error('Refresh token error:', error);
        return res.status(403).json({ message: 'Invalid or expired refresh token. Please log in again.' });
    }
});
// Login API
router.post('/login', async (req, res) => {

    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email', isExist: false });
        }

        // // Check if user is verified
        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please confirm your email before logging in.', isVerified: user.isVerified });
        }

        const otp = generateOTP();
        //user.newEmail = newEmail;
        user.otp = otp;
        user.otpExpires = Date.now() + 3600000;//Date.now() + 10 * 60 * 1000, // valid for 10 min
        user.isVerified = false;

        await user.save();
        await sendOtpEmail(email, otp);

        res.status(200).json({ message: 'OTP Sent Successfully, please check your email for verification OTP.' });

        // // Check password
        // const isPasswordValid = await bcrypt.compare(password, user.password);
        // if (!isPasswordValid) {
        //     return res.status(400).json({ message: 'Invalid email or password' });
        // }

        // // Check if user is verified
        // if (!user.isVerified) {
        //     return res.status(400).json({ message: 'Please confirm your email before logging in.' });
        // }

        // // Generate JWT token
        // const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
        //     expiresIn: '5h',
        // });

        // res.status(200).json({ message: 'Login successfully', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Login failed' });
    }
});


// Login Admin API
router.post('/login-admin', async (req, res) => {

    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email', isExist: false });
        }

        // // Check if user is verified
        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please confirm your email before logging in.', isVerified: user.isVerified });
        }

        // // Check if user is admin
        if (user.role != "admin") {
            return res.status(400).json({ message: 'You are not authorized to login here', role: user.role });
        }

        // // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // // Generate JWT token
        const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '5h',
        });

        res.status(200).json({ message: 'Login successfully', token, user: user });
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


// Change Email API
router.post('/change-email', async (req, res) => {
    try {
        const { email, newEmail, password } = req.body;


        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const existingUserWithNewEmail = await User.findOne({ newEmail });
        if (existingUserWithNewEmail) {
            return res.status(400).json({ message: 'New Email is already registered' });
        }

        const otp = generateOTP();
        //user.newEmail = newEmail;
        user.otp = otp;
        user.otpExpires = Date.now() + 3600000;//Date.now() + 10 * 60 * 1000, // valid for 10 min
        user.isVerified = false;
        // Date.now() + 3600000; // 1 hour


        await user.save();
        await sendOtpEmail(newEmail, otp);

        res.status(200).json({ message: 'Email change request initiated.  Please check your new email for verification OTP.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to initiate email change: ' + error.message });
    }
});
//verify change email otp
router.post('/verify-change-email-otp', async (req, res) => {
    try {
        const { email, otp, newEmail } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        if (user.otp != otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Expired OTP' });
        }
        user.email = newEmail;
        user.newEmail = undefined;
        user.otp = undefined;
        user.otpExpires = undefined;
        user.isVerified = true;  //Reverify the user
        await user.save();
        // Generate JWT token
        const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '5h',
        });

        res.status(200).json({ message: 'Login successfully', token });
        // res.status(200).json({ message: 'Email changed successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to verify email change OTP: ' + error.message });
    }
});

// Resend OTP API
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const otp = generateOTP();
        user.otp = otp; // Reuse confirmationToken field
        user.otpExpires = Date.now() + 3600000;//Date.now() + 10 * 60 * 1000, // valid for 10 min
        user.isVerified = false;


        await user.save();
        await sendOtpEmail(email, otp);
        res.status(200).json({ message: 'OTP resent successfully.  Please check your email.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to resend OTP: ' + error.message });
    }
});

// export the router module so that server.js file can use it
module.exports = router;
