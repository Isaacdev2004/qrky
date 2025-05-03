const fs = require('fs').promises;
const path = require('path');

// Storage file paths
const STORAGE_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(STORAGE_DIR, 'users.json');
const EXPERIENCES_FILE = path.join(STORAGE_DIR, 'experiences.json');

// Ensure storage directory exists
async function initStorage() {
    try {
        await fs.mkdir(STORAGE_DIR, { recursive: true });
        
        // Initialize users.json if it doesn't exist
        try {
            await fs.access(USERS_FILE);
        } catch {
            await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2));
        }
        
        // Initialize experiences.json if it doesn't exist
        try {
            await fs.access(EXPERIENCES_FILE);
        } catch {
            await fs.writeFile(EXPERIENCES_FILE, JSON.stringify([], null, 2));
        }
    } catch (error) {
        console.error('Error initializing storage:', error);
    }
}

// User storage operations
const userStorage = {
    async findByEmail(email) {
        const users = JSON.parse(await fs.readFile(USERS_FILE, 'utf8'));
        return users.find(user => user.email === email);
    },
    
    async findById(id) {
        const users = JSON.parse(await fs.readFile(USERS_FILE, 'utf8'));
        return users.find(user => user.id === id);
    },
    
    async save(user) {
        const users = JSON.parse(await fs.readFile(USERS_FILE, 'utf8'));
        user.id = users.length + 1; // Simple ID generation
        users.push(user);
        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
        return user;
    }
};

// Experience storage operations
const experienceStorage = {
    async findById(id) {
        const experiences = JSON.parse(await fs.readFile(EXPERIENCES_FILE, 'utf8'));
        return experiences.find(exp => exp.id === id);
    },
    
    async findByUserId(userId) {
        const experiences = JSON.parse(await fs.readFile(EXPERIENCES_FILE, 'utf8'));
        return experiences.filter(exp => exp.userId === userId);
    },
    
    async save(experience) {
        const experiences = JSON.parse(await fs.readFile(EXPERIENCES_FILE, 'utf8'));
        experience.id = experiences.length + 1; // Simple ID generation
        experience.createdAt = new Date().toISOString();
        experiences.push(experience);
        await fs.writeFile(EXPERIENCES_FILE, JSON.stringify(experiences, null, 2));
        return experience;
    },
    
    async update(id, updates) {
        const experiences = JSON.parse(await fs.readFile(EXPERIENCES_FILE, 'utf8'));
        const index = experiences.findIndex(exp => exp.id === id);
        if (index !== -1) {
            experiences[index] = { ...experiences[index], ...updates };
            await fs.writeFile(EXPERIENCES_FILE, JSON.stringify(experiences, null, 2));
            return experiences[index];
        }
        return null;
    }
};

module.exports = {
    initStorage,
    userStorage,
    experienceStorage
}; 