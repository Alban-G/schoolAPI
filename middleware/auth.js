// imports
const jwt = require('jsonwebtoken');


const authenticate = (req, res, next) => {
    // extract authorization header
    const authHeader = req.headers.authorization;
    // extract token
    const token = authHeader && authHeader.split(' ')[1];
    // check if token is present
    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No Token Provided.' });
    }
    try {
        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // attach user to request object
        // this is the logged in user
        req.user = decoded;
        // proceed to the next route/function
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(500).json({ message: error.message });
    }
};

// authorisation based on user role
// accepts any number of roles
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // check if user is logged in
        if (!req.user) {
            return res.status(401).json({ message: 'Access Denied. No User Logged In.' });
        }
        // check if user role is allowed
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access Denied. You do not have permission to access this resource.' });
        }
        // proceed to the next route/function
        next();
    };
};

module.exports = {
    authenticate,
    authorizeRoles
};