import mongoose, { Schema } from "mongoose";

const otpSchema = new Schema({
    otp: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300
    }
})
const otpModel = mongoose.model("Otp",otpSchema);
export default otpModel