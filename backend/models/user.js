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
        enum: ["bca","mca","btech","bsc"],
        required: true
    },
    refreshToken: {
        type: String,
        default: null
    }
})
export const User = mongoose.model("User",userSchema);