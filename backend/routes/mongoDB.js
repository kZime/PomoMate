import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

// 初始化 dotenv 配置
dotenv.config();

const router = express.Router();

// Variable to be sent to Frontend with Database status
let databaseConnection = "Waiting for Database response...";

// 路由：返回数据库连接状态
router.get("/", (req, res) => {
    res.send(databaseConnection);
});

// 从环境变量中读取 MongoDB URI
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error("MONGO_URI is not defined in the environment variables.");
    databaseConnection = "MONGO_URI is missing. Please check environment configuration.";
} else {
    // 连接到 MongoDB
    mongoose.connect(mongoURI)
        .then(() => {
            console.log("Connected to Database!");
            databaseConnection = "Connected to Database";
        })
        .catch((error) => {
            console.error("Database connection error:", error);
            databaseConnection = "Error connecting to Database";
        });
}

export default router;
