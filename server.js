require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { initStorage } = require('./utils/storage');
const userRoutes = require('./routes/userRoutes');
const experienceRoutes = require('./routes/experienceRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const ensureDirectories = require('./utils/ensureDirectories');

// Set NODE_ENV to 'production' if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, 'frontend/public')));

// Serve uploaded files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log the upload path for debugging
console.log('Upload directory path:', path.join(__dirname, 'uploads'));
console.log('Environment:', process.env.NODE_ENV);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/analytics', analyticsRoutes);

// Initialize storage and ensure directories exist
async function initializeApp() {
    try {
        await ensureDirectories();
        console.log('Directories initialized successfully');
    } catch (error) {
        console.error('Failed to initialize directories:', error);
    }
}

// Initialize the app
initializeApp();

// For local development
if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Development server running on port ${port}`);
    });
} else {
    // Production
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Production server running on port ${port}`);
    });
}

module.exports = app; 