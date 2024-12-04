import express from "express";
import { authenticateToken } from "../utils/middlewares.js"; // Import controllers
import { addTask, getTasks, deleteTask, editTask } from "../controllers/taskController.js"; // Import controllers

const router = express.Router();

router.post("/add", authenticateToken, addTask);
router.post("/get", authenticateToken, getTasks);
router.post("/delete", authenticateToken, deleteTask);
router.post("/edit", authenticateToken, editTask);

export default router;