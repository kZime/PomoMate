import User from "../models/User.js";

export const getUserTasks = async (userId) => {
    const user = await User.findById(userId, "tasks");
    if (!user) {
        throw new Error("User not found");
    }
    return user.tasks;
};
