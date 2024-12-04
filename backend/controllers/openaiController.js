import OpenAI from "openai";
import { getUserTasks } from "../utils/dbUtils.js";
import mongoose from "mongoose";

const client = new OpenAI({
    apiKey: process.env.OPENAI_SECRET_API_KEY,
});

export const predictTask = async (req, res) => {
    try {
        // 获取用户 ID
        const userId = new mongoose.Types.ObjectId(req.user.userId);

        // 获取用户任务
        const tasks = await getUserTasks(userId);

        // 只保留 category, detail 和 completedAt
        const tasks_content = tasks.map(task => ({
            category: task.category,
            detail: task.detail,
            completedAt: task.completedAt,
        }));

        const currentTime = new Date().toISOString();

        // DEBUG
        console.log(tasks_content);
        console.log(currentTime);

        // 生成 Prompt
        const prompt = `The current time is ${currentTime}. 
        Here is my history of tasks: ${JSON.stringify(tasks_content)}. 
        Please predict my next task.
        predict rule: 
            1. The category should be one of the existing categories.
            2. The detail should follow previous tasks' format.
            3. The predictReason should be a concise and specific reason for the predicted task.
        Please respond in the following format (do not include any other information):
        {
            "category": "",
            "detail": "",
            "predictReason": ""
        }`;

        // 调用 OpenAI API
        const chatCompletion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
        });

        const response = chatCompletion.choices[0].message.content;

        res.status(200).json(response);
    } catch (error) {
        console.error("Error with OpenAI API:", error);
        res.status(500).json({ error: "Failed to process request.", details: error.message });
    }
};
