require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const https = require('https');
const http = require('http');
const fs = require('fs');
const { initStorage } = require('./utils/storage');
const userRoutes = require('./routes/userRoutes');
const experienceRoutes = require('./routes/experienceRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const ensureDirectories = require('./utils/ensureDirectories');

const app = express();
const port = process.env.PORT || 3000;
const httpPort = 80; // For redirecting HTTP to HTTPS

// Initialize storage
// initStorage(); // Already done in startServer

// SSL/HTTPS options
const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'certificates/private.key')),
    cert: fs.readFileSync(path.join(__dirname, 'certificates/certificate.pem'))
};

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, 'frontend/public')));

// Serve uploaded files from the backend/uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log the upload path for debugging
console.log('Upload directory path:', path.join(__dirname, 'uploads'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/analytics', analyticsRoutes);

// Get local IP address
function getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip internal (i.e. 127.0.0.1) and non-IPv4 addresses
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}

// Start server
async function startServer() {
    try {
        await ensureDirectories();
        
        // Create HTTPS server
        const httpsServer = https.createServer(httpsOptions, app);
        
        // Create HTTP server for redirect
        const httpServer = http.createServer((req, res) => {
            res.writeHead(301, { 
                Location: `https://${req.headers.host.split(':')[0]}:${port}${req.url}` 
            });
            res.end();
        });

        // Start both servers
        httpsServer.listen(port, () => {
            const localIP = getLocalIP();
            console.log(`\nServer running on:`);
            console.log(`Local: https://localhost:${port}`);
            console.log(`Network: https://${localIP}:${port}`);
            console.log(`\nFor mobile testing, use the Network URL`);
            console.log(`\nNote: You'll need to accept the self-signed certificate warning in your browser`);
        });

        httpServer.listen(httpPort, () => {
            console.log(`HTTP redirect server running on port ${httpPort}`);
        });
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer(); 