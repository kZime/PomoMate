import User from "../models/User.js";
import mongoose from "mongoose";


export const getTasks = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.userId); 
        const user = await User.findById(userId, 'tasks'); 


        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ tasks: user.tasks }); 
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


export const addTask = async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.userId); 
      const { category, detail } = req.body;
  
      if (!category || !detail) {
        return res.status(400).json({ success: false, message: 'Category and detail are required.' });
      }
  
      const user = await User.findById(userId);
      if (!user) {
        // DEBUG: if user not found
        // console.log("req.user:", req.user);
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
  
      const newTask = {
        category,
        detail,
        completionTime: null, 
      };
  
      user.tasks.push(newTask);
      await user.save();
  
      res.status(201).json({ success: true, message: 'Task added successfully.', task: newTask });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.userId);
        // console.log("userId:", userId)
        const { taskId } = req.body;
        // console.log("taskId:", taskId)

        if (!userId || !taskId) {
            return res.status(400).json({ success: false, message: "User ID and Task ID are required" });
        }
        const user = await User.findOneAndUpdate(
            { _id: userId }, // 根据 userId 查找用户
            { $pull: { tasks: { _id: taskId } } }, // 从 tasks 数组中删除指定 taskId 的任务
            { new: true } // 返回更新后的文档
          );
      
          if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
          }
      
          // 返回删除后的用户信息（包含更新后的 tasks 数组）
          return res.status(200).json({ success: true, message: "Task deleted successfully", tasks: user.tasks });
    } catch (error) {
        console.error("Error deleting task:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" }); 
    }
};  

// edit task controller
export const editTask = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.userId);
        const { taskId, category, detail } = req.body;

        if (!userId || !taskId || !category || !detail) {
            return res.status(400).json({ success: false, message: "User ID, Task ID, Category, and Detail are required" });
        }

        // 查找用户，并确保任务ID匹配
        const user = await User.findOneAndUpdate(
            { _id: userId, "tasks._id": taskId }, 
            {
                $set: {
                    "tasks.$.category": category,  
                    "tasks.$.detail": detail,
                    "tasks.$.completedAt": new Date(), 
                }
            },
            { new: true } // 返回更新后的用户文档
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User or task not found" });
        }

        // 返回更新后的任务列表
        return res.status(200).json({ success: true, message: "Task updated successfully", tasks: user.tasks });

    } catch (error) {
        console.error("Error updating task:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};