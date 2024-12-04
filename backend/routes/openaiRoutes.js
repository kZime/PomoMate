import express from "express";
import { authenticateToken } from "../utils/middlewares.js"; // 导入认证中间件
import { predictTask } from "../controllers/openaiController.js";

const router = express.Router();

// 定义 POST /predictTask 路由
router.post("/predictTask", authenticateToken, predictTask);

export default router; // 使用 ES Modules 导出
