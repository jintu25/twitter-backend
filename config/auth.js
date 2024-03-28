const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");

dotenv.config();

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token; // Assuming the token is stored in a cookie
        // const token = req.headers.authorization; // Alternative approach for token retrieval
        console.log('check token:', token)
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized Access: Token is missing"
            });
        }

        // Verify token
        const decoded = await jwt.verify(token, process.env.SECRET_TOKEN);
        req.user = decoded.userId; // Assuming the JWT payload contains user ID
        next(); // Call next middleware
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({
            success: false,
            message: "Unauthorized Access: Invalid token"
        });
    }
};

module.exports = isAuthenticated;
