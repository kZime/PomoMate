import express from "express";
const router = express.Router();

// 引入其他模块路由
import taskRoutes from "./taskRoutes.js"; // 任务相关路由
import userRoutes from "./userRoutes.js"; // 用户相关路由
import openaiRoutes from "./openaiRoutes.js"; // OpenAI 相关路由

// 根路径路由
router.get("/", (req, res) => {
  res.render("index", { title: "Express" });
});

// 模块化路由挂载
router.use("/task", taskRoutes); // 挂载任务相关路由到 /task
router.use("/user", userRoutes); // 挂载用户相关路由到 /user
router.use("/openai", openaiRoutes); // 挂载 OpenAI 相关路由到 /openai

export default router;
