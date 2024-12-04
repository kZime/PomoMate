const OpenAI = require('openai');
const { getUserTasks } = require("../utils/dbUtils");
const mongoose = require('mongoose');
const client = new OpenAI({
    apiKey: process.env.OPENAI_SECRET_API_KEY,
});



exports.openai = async (req, res) => {
    try{
        // get user id
        const userId = new mongoose.Types.ObjectId(req.user.userId);

        // get user tasks
        const tasks = await getUserTasks(userId);

        // only keep category, detail, and completedAt
        const tasks_content = tasks.map(task => ({ category: task.category, detail: task.detail, completedAt: task.completedAt }));

        const currentTime = new Date().toISOString();

        // DEBUG
        console.log(tasks_content);
        console.log(currentTime);

        // generate prompt
        const prompt = `The current time is ${currentTime}. 
        Here is my history of tasks: ${JSON.stringify(tasks_content)}. 
        Please predict my next task.
        predict rule: 
            1. The category should be one of the existing categories.
            2. The detail should be follow previous tasks' format.
            3. The predictReason should be a concise and specific reason for the predicted task.
        Please respond in the following format (do not include any other information):
        {
            "category": "",
            "detail": "",
            "predictReason": ""
        }
        `;


        // const { prompt } = req.body;
        const chatCompletion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
        });

        const response = chatCompletion.choices[0].message.content;

        res.status(200).json(response);
    } catch (error) {
        console.error("Error with OpenAI API:", error);
        res.status(500).json({ error: "Failed to process request.", error });
    }
}
