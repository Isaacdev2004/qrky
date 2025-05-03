const express = require('express');
const router = express.Router();
const Experience = require('../models/Experience');
const auth = require('../middleware/auth');

// Record view
router.post('/view/:experienceId', async (req, res) => {
    try {
        const { experienceId } = req.params;
        const { deviceType } = req.body;
        
        const experience = await Experience.findById(experienceId);
        if (!experience) {
            return res.status(404).send({ error: 'Experience not found' });
        }
        
        experience.analytics.totalViews += 1;
        
        // Record view by date
        experience.analytics.viewsByDate.push({
            date: new Date(),
            count: 1
        });
        
        // Record device type
        if (deviceType) {
            const deviceTypeIndex = experience.analytics.deviceTypes.findIndex(d => d.type === deviceType);
            if (deviceTypeIndex >= 0) {
                experience.analytics.deviceTypes[deviceTypeIndex].count += 1;
            } else {
                experience.analytics.deviceTypes.push({ type: deviceType, count: 1 });
            }
        }
        
        await experience.save();
        res.send({ success: true });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Get analytics for user's experiences
router.get('/dashboard', auth, async (req, res) => {
    try {
        const experiences = await Experience.find({ userId: req.user._id });
        const analyticsData = experiences.map(exp => ({
            title: exp.title,
            analytics: exp.analytics
        }));
        
        res.send(analyticsData);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router; 