const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

function generateCertificates() {
    // Create certificates directory if it doesn't exist
    const certDir = path.join(__dirname, '../certificates');
    if (!fs.existsSync(certDir)) {
        fs.mkdirSync(certDir);
    }

    // Generate self-signed certificate
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const pems = selfsigned.generate(attrs, {
        algorithm: 'sha256',
        days: 365,
        keySize: 2048,
        extensions: [
            {
                name: 'basicConstraints',
                cA: true
            },
            {
                name: 'keyUsage',
                keyCertSign: true,
                digitalSignature: true,
                nonRepudiation: true,
                keyEncipherment: true,
                dataEncipherment: true
            },
            {
                name: 'extKeyUsage',
                serverAuth: true,
                clientAuth: true
            },
            {
                name: 'subjectAltName',
                altNames: [
                    {
                        type: 2, // DNS
                        value: 'localhost'
                    },
                    {
                        type: 7, // IP
                        ip: '127.0.0.1'
                    }
                ]
            }
        ]
    });

    // Save the certificate files
    fs.writeFileSync(path.join(certDir, 'private.key'), pems.private);
    fs.writeFileSync(path.join(certDir, 'certificate.pem'), pems.cert);

    console.log('Certificates generated successfully!');
}

generateCertificates(); 