require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { initStorage } = require('./utils/storage');
const userRoutes = require('./routes/userRoutes');
const experienceRoutes = require('./routes/experienceRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const ensureDirectories = require('./utils/ensureDirectories');

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
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Development server running on port ${port}`);
    });
}

// Export for Vercel
module.exports = app; 