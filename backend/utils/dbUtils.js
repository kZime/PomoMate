import User from "../models/User.js"; // 使用 ES Modules 的 import 语法

// 获取用户任务
export const getUserTasks = async (userId) => {
    const user = await User.findById(userId, "tasks");
    if (!user) {
        throw new Error("User not found");
    }
    return user.tasks;
};
