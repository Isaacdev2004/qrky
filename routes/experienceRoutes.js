const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { experienceStorage } = require('../utils/storage');
const { generateQRCode } = require('../utils/qrGenerator');
const auth = require('../middleware/auth');

// Configure multer for model uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Store in backend/uploads/models
        const uploadDir = path.join(__dirname, '../uploads/models');
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'model-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(glb|gltf)$/)) {
            return cb(new Error('Please upload a GLB/GLTF file'));
        }
        cb(null, true);
    }
});

// Create new experience
router.post('/', auth, upload.single('model'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ error: 'No model file uploaded' });
        }

        // Log upload information
        console.log('File upload details:', {
            originalName: req.file.originalname,
            savedAs: req.file.filename,
            path: req.file.path
        });

        const { title, description } = req.body;
        
        // Create experience with correct URL path
        const modelPath = `/uploads/models/${req.file.filename}`;
        const experience = await experienceStorage.save({
            userId: req.user.id,
            title,
            description,
            modelPath,
            settings: {
                scale: { x: 1, y: 1, z: 1 },
                rotation: { x: 0, y: 0, z: 0 },
                position: { x: 0, y: 0, z: 0 }
            }
        });

        // Generate QR code with proper port
        const port = process.env.PORT || 3000; // Get port from environment or use default
        const baseUrl = `https://${req.hostname}:${port}`;
        const qrCodeFileName = `qr-${experience.id}.png`;
        const qrCodePath = `/uploads/qr/${qrCodeFileName}`;
        const qrCodeFullPath = path.join(__dirname, '../uploads/qr', qrCodeFileName);

        // Generate QR code and get the URL
        const experienceUrl = await generateQRCode(experience.id, baseUrl, qrCodeFullPath);

        // Update experience with QR code path and URL
        const updatedExperience = await experienceStorage.update(experience.id, {
            qrCodePath,
            experienceUrl
        });

        res.status(201).send(updatedExperience);
    } catch (error) {
        console.error('Error creating experience:', error);
        res.status(400).send({ error: error.message });
    }
});

// Get all experiences for user
router.get('/', auth, async (req, res) => {
    try {
        const experiences = await experienceStorage.findByUserId(req.user.id);
        res.send(experiences);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Get single experience
router.get('/:id', async (req, res) => {
    try {
        const experience = await experienceStorage.findById(parseInt(req.params.id));
        if (!experience) {
            return res.status(404).send({ error: 'Experience not found' });
        }
        res.send(experience);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Add a test route to verify file serving
router.get('/test-file/:filename', async (req, res) => {
    const filePath = path.join(__dirname, '../uploads/models', req.params.filename);
    try {
        await fs.access(filePath);
        console.log('File exists at:', filePath);
        res.sendFile(filePath);
    } catch (error) {
        console.error('File not found:', filePath);
        res.status(404).send({ error: 'File not found', checkedPath: filePath });
    }
});

module.exports = router; 