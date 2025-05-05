const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to generate pattern file from QR code
async function generatePattern(qrImagePath, outputDir) {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const baseName = path.basename(qrImagePath, '.png');
    const patternPath = path.join(outputDir, `${baseName}.patt`);

    // Command to generate pattern file
    const command = `node node_modules/ar.js/tools/artoolkit-pattern-generator/bin/pattern-marker-generator ${qrImagePath} -o ${patternPath}`;

    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Error generating pattern:', error);
                reject(error);
                return;
            }
            console.log('Pattern generated successfully:', patternPath);
            resolve(patternPath);
        });
    });
}

module.exports = { generatePattern }; 