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
    role: {
        type: String,
        default: "student",
    },
    branch: {
        type: String,
        enum: [
            'CSE',
            'ECE',
            'EE',
            'ME',
            'CE',
            'MCT',
            'AE',
            'BCA',
            'MCA',
            'BBA',
            'MBA',
            'B.Com',
            'B.Arch',
            'B.Des',
            'B.Pharm',
            'B.Sc Nursing',
            'BPT',
            'B.A. LL.B.',
            'JMC',
            'HM',
        ],
        required: true
    },
    refreshToken: {
        type: String,
        default: null
    }
})
export const User = mongoose.model("User", userSchema);