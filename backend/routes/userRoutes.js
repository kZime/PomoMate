import express from "express";
const router = express.Router();
import { register, login } from "../controllers/authController.js"; // 导入注册控制器


router.post("/register", register);
router.post("/login", login);

export default router;