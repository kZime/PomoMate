import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { JWT_SECRET_KEY } from "../config/env.js";

const DEMO_USERNAME = "demo_user";

const buildToken = (user) =>
    jwt.sign(
        { userId: user._id, username: user.username },
        JWT_SECRET_KEY,
        { expiresIn: "30d" }
    );

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

        // generate JWT token
        const token = buildToken(user);

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const loginDemoUser = async (req, res) => {
    try {
        let user = await User.findOne({ username: DEMO_USERNAME });

        if (!user) {
            const hashedPassword = await bcrypt.hash(`demo-${Date.now()}`, 10);
            user = await User.create({
                username: DEMO_USERNAME,
                hashed_password: hashedPassword,
            });
        }

        const token = buildToken(user);
        res.status(200).json({
            message: "Demo login successful",
            token,
        });
    } catch (error) {
        console.error("Demo login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const authenticateTcoken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // get Bearer Token

    if (!token) {
        return res.status(401).json({ message: 'Token is missing' });
    }

    try {
        const user = jwt.verify(token, JWT_SECRET_KEY); // replace to real password
        req.user = user; 
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};


