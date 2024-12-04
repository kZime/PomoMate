require("dotenv").config();
const jwt = require("jsonwebtoken");

const authenticateToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // 获取 Bearer Token

    if (!token) {
        return res.status(401).json({ message: 'Token is missing' });
    }

    try {
        const secretKey = process.env.JWT_SECRET_KEY;
        const user = jwt.verify(token, secretKey); // 替换为实际密钥
        req.user = user; // 将解码后的用户信息存入 req
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = { authenticateToken };

