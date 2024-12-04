require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 注册逻辑
const register = async (req, res) => {
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
const login = async (req, res) => {
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

const authenticateTcoken = async (req, res, next) => {
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

// 控制器：查询用户任务
const getTasks = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.userId); // 从 token 解码信息中获取用户 ID
        const user = await User.findById(userId, 'tasks'); // 查询任务字段

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ tasks: user.tasks }); // 返回任务数据
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const mongoose = require('mongoose');

// 添加任务
const addTask = async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.userId); 
      const { category, detail } = req.body;
  
      if (!category || !detail) {
        return res.status(400).json({ success: false, message: 'Category and detail are required.' });
      }
  
      // 查找用户并更新任务
      const user = await User.findById(userId);
      if (!user) {
        // DEBUG: 如果用户不存在，则返回错误信息
        console.log("req.user:", req.user);
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
  
      // 添加任务到用户的 tasks 列表
      const newTask = {
        category,
        detail,
        completionTime: null, // 默认完成时间为 null
      };
  
      user.tasks.push(newTask);
      await user.save();
  
      res.status(201).json({ success: true, message: 'Task added successfully.', task: newTask });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  };

  const deleteTask = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.userId);
        console.log("userId:", userId)
        const { taskId } = req.body;
        console.log("taskId:", taskId)

        if (!userId || !taskId) {
            return res.status(400).json({ success: false, message: "User ID and Task ID are required" });
        }
        const user = await User.findOneAndUpdate(
            { _id: userId }, // 根据 userId 查找用户
            { $pull: { tasks: { _id: taskId } } }, // 从 tasks 数组中删除指定 taskId 的任务
            { new: true } // 返回更新后的文档
          );
      
          if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
          }
      
          // 返回删除后的用户信息（包含更新后的 tasks 数组）
          return res.status(200).json({ success: true, message: "Task deleted successfully", tasks: user.tasks });
    } catch (error) {
        console.error("Error deleting task:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" }); 
    }
}

module.exports = { register, login, authenticateTcoken, getTasks, addTask, deleteTask };
