const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    description: String,
    qrCodePath: { type: String, required: true },
    modelPath: { type: String, required: true },
    targetPath: { type: String, required: true },
    settings: {
        scale: {
            x: { type: Number, default: 1 },
            y: { type: Number, default: 1 },
            z: { type: Number, default: 1 }
        },
        rotation: {
            x: { type: Number, default: 0 },
            y: { type: Number, default: 0 },
            z: { type: Number, default: 0 }
        },
        position: {
            x: { type: Number, default: 0 },
            y: { type: Number, default: 0 },
            z: { type: Number, default: 0 }
        },
        customStyles: {
            backgroundColor: { type: String, default: "#000000" },
            loadingAnimation: { type: String, default: "default" },
            interfaceColor: { type: String, default: "#ffffff" }
        }
    },
    analytics: {
        totalViews: { type: Number, default: 0 },
        uniqueVisitors: { type: Number, default: 0 },
        averageViewTime: { type: Number, default: 0 },
        viewsByDate: [{
            date: Date,
            count: Number
        }],
        deviceTypes: [{
            type: String,
            count: Number
        }]
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Experience', experienceSchema); 