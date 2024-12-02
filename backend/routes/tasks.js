const express = require("express");
const router = express.Router();
const { authenticateTcoken, getTasks } = require("../controllers/authController"); // 导入注册控制器

// 定义 POST /register 路由
router.post("/", authenticateTcoken, getTasks);

module.exports = router;
