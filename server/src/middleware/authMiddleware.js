const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // Look for the "Authorization: Bearer <TOKEN>" header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Access Denied: No token provided" });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Add the decoded user data (id, role) to the request
        next(); // Move to the next function (the controller)
    } catch (err) {
        res.status(403).json({ message: "Invalid or Expired Token" });
    }
};

module.exports = authenticateToken;