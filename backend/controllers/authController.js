import dotenv from "dotenv";

dotenv.config(); // 初始化 dotenv 配置

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 注册逻辑
export const register = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, hashed_password: hashedPassword });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 登录逻辑
export const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        // 查找用户
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 验证密码
        const isPasswordValid = await bcrypt.compare(password, user.hashed_password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // 密钥从环境变量中获取
        const secretKey = process.env.JWT_SECRET_KEY; // 确保你已经在环境变量中设置了这个值

        if (!secretKey) {
            return res.status(500).json({ message: "Internal server error: Secret key is missing" });
        }

        // 生成JWT token
        const token = jwt.sign({ userId: user._id, username: user.username }, secretKey, { expiresIn: "30d" });

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const authenticateTcoken = async (req, res, next) => {
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


