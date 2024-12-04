const express = require("express");
const router = express.Router();
const { authenticateTcoken, openai } = require("../controllers/authController"); // 导入注册控制器

// 定义 POST /addTask 路由
router.post("/", authenticateTcoken, openai);

module.exports = router;