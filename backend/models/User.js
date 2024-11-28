const mongoose = require("mongoose");

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
    createdAt: {
        type: Date,
        default: Date.now, // 默认值为当前时间
    },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
