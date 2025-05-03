const jwt = require('jsonwebtoken');
const { userStorage } = require('../utils/storage');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        const user = await userStorage.findById(decoded.id);
        
        if (!user) {
            throw new Error();
        }
        
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

module.exports = auth; 