const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;

async function generateQRCode(experienceId, baseUrl, outputPath) {
    try {
        // Ensure baseUrl uses HTTPS
        const secureBaseUrl = baseUrl.replace('http://', 'https://');
        const experienceUrl = `${secureBaseUrl}/experience.html?id=${experienceId}`;
        
        // Generate QR code
        await QRCode.toFile(outputPath, experienceUrl, {
            errorCorrectionLevel: 'H',
            margin: 4,
            width: 512,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });

        return experienceUrl;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
}

module.exports = { generateQRCode }; 