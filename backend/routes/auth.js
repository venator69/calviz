const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../server'); 
const router = express.Router();
const saltRounds = 10;

/**
 * @route   POST /api/auth/register
 * @description Register a new user and return a JWT token.
 */
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // 1. Check if user already exists
        const checkQuery = 'SELECT id FROM users WHERE email = $1';
        const existingUser = await pool.query(checkQuery, [email]);

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash Password
        const hashed = await bcrypt.hash(password, saltRounds);

        // Insert into database
        const insertQuery = `
            INSERT INTO users(name, email, password)
            VALUES($1, $2, $3) RETURNING id, name, email
        `;
        const result = await pool.query(insertQuery, [name, email, hashed]);

        // Create and return JWT Token
        const user = result.rows[0];
        const payload = { user: { id: user.id, name: user.name } };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
            }
        );

    } catch (err) {
        console.error('Registration error:', err.message);
        res.status(500).send('Server Error');
    }
});


/**
 * @route   POST /api/auth/login
 * @description Authenticate user & get token.
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check User in DB
        const userQuery = `SELECT * FROM users WHERE email = $1`;
        const result = await pool.query(userQuery, [email]);
        
        if (result.rows.length === 0) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        
        const user = result.rows[0];

        // Compare Passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Create and return JWT Token
        const payload = { user: { id: user.id, name: user.name } };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
            }
        );

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ msg: 'Internal server error' });
    }
});


/**
 * @route   GET /api/auth/user
 * @description Get authenticated user details (Protected Route Test).
 */
const authMiddleware = require('../middleware/auth');
router.get('/user', authMiddleware, async (req, res) => {
    try {
        // req.user is set by the auth middleware
        const userQuery = 'SELECT id, name, email FROM users WHERE id = $1';
        const userResult = await pool.query(userQuery, [req.user.id]);

        if (userResult.rows.length === 0) {
             return res.status(404).json({ msg: 'User not found' });
        }

        res.json(userResult.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;