const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const QRCode = require('qrcode');
const { generatePattern } = require('../../scripts/generate-pattern');

// Load experiences data
const experiencesPath = path.join(__dirname, '../../data/experiences.json');
const uploadsDir = path.join(__dirname, '../../frontend/public/uploads');
const qrDir = path.join(uploadsDir, 'qr');
const modelsDir = path.join(uploadsDir, 'models');
const patternsDir = path.join(uploadsDir, 'patterns');

// Ensure directories exist
[uploadsDir, qrDir, modelsDir, patternsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

async function loadExperiences() {
    try {
        const data = await fs.readFile(experiencesPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function saveExperiences(experiences) {
    await fs.writeFile(experiencesPath, JSON.stringify(experiences, null, 2));
}

// Get all experiences
router.get('/', async (req, res) => {
    const experiences = await loadExperiences();
    res.json(experiences);
});

// Get experience by ID
router.get('/:id', async (req, res) => {
    const experiences = await loadExperiences();
    const experience = experiences.find(e => e.id === parseInt(req.params.id));
    if (!experience) {
        return res.status(404).json({ error: 'Experience not found' });
    }
    res.json(experience);
});

// Create new experience
router.post('/', async (req, res) => {
    try {
        const experiences = await loadExperiences();
        const { userId, title, description, modelPath } = req.body;

        // Generate new experience ID
        const id = experiences.length > 0 ? Math.max(...experiences.map(e => e.id)) + 1 : 1;

        // Generate QR code
        const qrPath = `/uploads/qr/qr-${id}.png`;
        const fullQrPath = path.join(__dirname, '../../frontend/public', qrPath);
        const experienceUrl = `${req.protocol}://${req.get('host')}/experience.html?id=${id}`;
        await QRCode.toFile(fullQrPath, experienceUrl);

        // Generate pattern file from QR code
        const patternPath = `/uploads/patterns/pattern-${id}.patt`;
        const fullPatternPath = path.join(__dirname, '../../frontend/public', patternPath);
        await generatePattern(fullQrPath, path.dirname(fullPatternPath));

        const newExperience = {
            id,
            userId,
            title,
            description,
            modelPath,
            qrCodePath: qrPath,
            patternPath: patternPath,
            settings: {
                scale: { x: 1, y: 1, z: 1 },
                rotation: { x: 0, y: 0, z: 0 },
                position: { x: 0, y: 0, z: 0 }
            },
            createdAt: new Date().toISOString(),
            experienceUrl
        };

        experiences.push(newExperience);
        await saveExperiences(experiences);

        res.status(201).json(newExperience);
    } catch (error) {
        console.error('Error creating experience:', error);
        res.status(500).json({ error: 'Failed to create experience' });
    }
});

// Update experience settings
router.put('/:id/settings', async (req, res) => {
    try {
        const experiences = await loadExperiences();
        const index = experiences.findIndex(e => e.id === parseInt(req.params.id));
        
        if (index === -1) {
            return res.status(404).json({ error: 'Experience not found' });
        }

        experiences[index].settings = req.body;
        await saveExperiences(experiences);

        res.json(experiences[index]);
    } catch (error) {
        console.error('Error updating experience settings:', error);
        res.status(500).json({ error: 'Failed to update experience settings' });
    }
});

module.exports = router; 