const express = require("express");
const router = express.Router();
const { authenticateToken} = require("../utils/middlewares"); // 导入认证中间件
const { openai } = require("../controllers/openaiController");

// 定义 POST /addTask 路由
router.post("/", authenticateToken, openai);

module.exports = router;