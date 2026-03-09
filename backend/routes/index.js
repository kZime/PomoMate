import express from "express";
const router = express.Router();

import taskRoutes from "./taskRoutes.js";
import userRoutes from "./userRoutes.js";
import openaiRoutes from "./openaiRoutes.js";

router.get("/", (req, res) => {
  res.render("index", { title: "Express" });
});

router.use("/task", taskRoutes);
router.use("/user", userRoutes);
router.use("/openai", openaiRoutes);

export default router;
