import mongoose from "mongoose";
import { branch as branches } from "../config/branches.js";
const candidateSchema = new mongoose.Schema({
    position: {
        type: String,
        enum: ["President","Vice President"],
        required: true,
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    slogan: {
        type: String,
    },
    branch: {
        type: String,
        enum: branches,
        required: true,
    }
},{timestamps: true})
const electionDates = new mongoose.Schema({
    nominationStart:{
        type: Date,
    },
    nominationEnd:{
        type: Date,
    },
    votingStart:{
        type: Date,
    },
    votingEnd:{
        type: Date,
        expires:0
    },
    branch: {
        type: String,
        unique: true,
        enum: branches,
    },
    admin: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    }
})
export const electionDateModel = mongoose.model("ElectionDates",electionDates);
const candidateModel = mongoose.model("Candidate",candidateSchema);
export default candidateModel;