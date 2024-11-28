const express = require("express");
const router = express.Router();
const { register } = require("../controllers/authController"); // 导入注册控制器

// 定义 POST /register 路由
router.post("/", register);

module.exports = router;
