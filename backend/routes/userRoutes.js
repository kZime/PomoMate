import express from "express";
const router = express.Router();
import { register, login, loginDemoUser } from "../controllers/authController.js";


router.post("/register", register);
router.post("/login", login);
router.post("/demo-login", loginDemoUser);

export default router;