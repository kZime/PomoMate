import express from "express";
import { authenticateToken } from "../utils/middlewares.js";
import { predictTask } from "../controllers/openaiController.js";

const router = express.Router();

router.post("/predictTask", authenticateToken, predictTask);

export default router;
