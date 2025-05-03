const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;

async function generateQRCode(experienceId, baseUrl, outputPath) {
    try {
        // Ensure baseUrl uses HTTPS
        const secureBaseUrl = baseUrl.replace('http://', 'https://');
        const experienceUrl = `${secureBaseUrl}/experience.html?id=${experienceId}`;
        
        // Generate QR code with optimized settings for better scanning
        await QRCode.toFile(outputPath, experienceUrl, {
            errorCorrectionLevel: 'L', // Lower error correction for clearer pattern
            margin: 4, // Standard margin for better scanning
            width: 1024, // Larger size for better resolution
            color: {
                dark: '#000000',
                light: '#ffffff'
            },
            rendererOpts: {
                quality: 1.0,
                deflateLevel: 9,
                deflateStrategy: 3
            }
        });

        return experienceUrl;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
}

module.exports = { generateQRCode }; 