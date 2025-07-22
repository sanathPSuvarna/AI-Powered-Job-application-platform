// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authController = {
    // User Registration
    register: async (req, res) => {
        try {
            const { email, password, userType } = req.body;

            // Check if user already exists
            const [existingUsers] = await db.query(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (existingUsers.length > 0) {
                return res.status(400).json({ message: 'Email already registered' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Insert new user
            const [result] = await db.query(
                'INSERT INTO users (email, password_hash, user_type) VALUES (?, ?, ?)',
                [email, hashedPassword, userType]
            );

            // Create JWT token
            const token = jwt.sign(
                { userId: result.insertId, userType },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                message: 'User registered successfully',
                token,
                userId: result.insertId
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Error registering user' });
        }
    },

    // User Login
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Find user
            const [users] = await db.query(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (users.length === 0) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const user = users[0];

            // Verify password
            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (!validPassword) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Create JWT token
            const token = jwt.sign(
                { userId: user.user_id, userType: user.user_type },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login successful',
                token,
                userId: user.user_id,
                userType: user.user_type
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Error during login' });
        }
    }
};

module.exports = authController;
