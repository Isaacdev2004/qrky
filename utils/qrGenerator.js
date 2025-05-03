const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;

async function generateQRCode(experienceId, baseUrl, outputPath) {
    try {
        // Ensure baseUrl uses HTTPS
        const secureBaseUrl = baseUrl.replace('http://', 'https://');
        const experienceUrl = `${secureBaseUrl}/experience.html?id=${experienceId}`;
        
        await QRCode.toFile(outputPath, experienceUrl, {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: 400,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
}

module.exports = { generateQRCode }; 