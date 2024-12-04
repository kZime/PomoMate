import dotenv from "dotenv";

dotenv.config(); // initialize dotenv

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// register controller
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

// login controller
export const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        // find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // compare password
        const isPasswordValid = await bcrypt.compare(password, user.hashed_password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // get secret key from environment variable
        const secretKey = process.env.JWT_SECRET_KEY; // replace with actual secret key

        if (!secretKey) {
            return res.status(500).json({ message: "Internal server error: Secret key is missing" });
        }

        // generate JWT token
        const token = jwt.sign({ userId: user._id, username: user.username }, secretKey, { expiresIn: "30d" });

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const authenticateTcoken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // get Bearer Token

    if (!token) {
        return res.status(401).json({ message: 'Token is missing' });
    }

    try {
        const secretKey = process.env.JWT_SECRET_KEY;
        const user = jwt.verify(token, secretKey); // replace to real password
        req.user = user; 
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};


