const fs = require('fs').promises;
const path = require('path');

async function ensureDirectories() {
    // Define directories relative to backend folder
    const directories = [
        'uploads',
        'uploads/models',
        'uploads/qr',
        'uploads/patterns'
    ];

    for (const dir of directories) {
        const fullPath = path.join(__dirname, '..', dir);
        try {
            await fs.access(fullPath);
            console.log(`Directory exists: ${fullPath}`);
        } catch {
            await fs.mkdir(fullPath, { recursive: true });
            console.log(`Created directory: ${fullPath}`);
        }
    }
}

module.exports = ensureDirectories; 