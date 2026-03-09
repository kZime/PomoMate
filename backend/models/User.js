import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    hashed_password: {
        type: String,
        required: true,
    },
    tasks: [
        {
            category: {
                type: String,
                required: true,
                trim: true,
            },
            detail: {
                type: String,
                required: true,
                trim: true,
            },
            completedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model("User", userSchema);

export default User;
