const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { userStorage } = require('../utils/storage');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        // Check if user exists
        const existingUser = await userStorage.findByEmail(email);
        if (existingUser) {
            return res.status(400).send({ error: 'Email already registered' });
        }
        
        // Create new user
        const hashedPassword = await bcrypt.hash(password, 8);
        const user = await userStorage.save({
            email,
            password: hashedPassword,
            name,
            createdAt: new Date().toISOString()
        });
        
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'default_secret');
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userStorage.findByEmail(email);
        
        if (!user || !await bcrypt.compare(password, user.password)) {
            throw new Error('Invalid login credentials');
        }
        
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'default_secret');
        res.send({ user, token });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Get profile
router.get('/profile', auth, async (req, res) => {
    res.send(req.user);
});

module.exports = router; 