const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController"); // 导入注册控制器

// 定义 POST /register 路由
router.post("/", login);

module.exports = router;
