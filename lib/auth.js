const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) return res.status(401).json({ message: 'Access Denied. No token provided.' });

    try {
        const bearerToken = token.split(' ')[1];
        const verified = jwt.verify(bearerToken, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: 'Invalid Token' });
    }
};

module.exports = verifyToken;
