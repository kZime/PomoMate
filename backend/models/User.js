import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // 确保用户名唯一
        trim: true, // 去除前后空格
    },
    hashed_password: {
        type: String,
        required: true,
    },
    tasks: [
        {
            category: {
                type: String, // 任务类别（如 "Work", "Personal" 等）
                required: true,
                trim: true,
            },
            detail: {
                type: String, // 任务详情
                required: true,
                trim: true,
            },
            completedAt: {
                type: Date, // 任务完成时间
                default: Date.now, // 初始值为空，表示任务未完成
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now, // 默认值为当前时间
    },
});

const User = mongoose.model("User", userSchema);


export default User;