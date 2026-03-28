import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    rollno: {
        type: String,
        unique: true,
        minLength: 10,
    },
    branch: {
        type: String,
        enum: [
            "Computer Science and Engineering (CSE)",
            "Electronics and Communication Engineering (ECE)",
            "Mechanical Engineering (ME)",
            "Civil Engineering (CE)",
            "Information Technology (IT)",
            "Artificial Intelligence and Data Science",
            "Bachelor of Computer Applications (BCA)",
            "Bachelor of Business Administration (BBA)",
            "Architecture (B.Arch)",
            "Pharmacy (B.Pharm)",
        ],
        required: true
    },
    refreshToken: {
        type: String,
        default: null
    }
})
export const User = mongoose.model("User", userSchema);