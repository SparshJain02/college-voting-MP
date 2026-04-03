import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
    position: {
        type: String,
        enum: ["president","vicePresident"],
        required: true,
    },
    applications: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
        ]
    },
    branch: {
        type: String,
        enum: ["bca","mca","btech","bsc","bba","bcom"],
        required: true,
    }
})
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
    admin: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    }
})
export const electionDateModel = mongoose.model("ElectionDates",electionDates);
const candidateModel = mongoose.model("Candidate",candidateSchema);
export default candidateModel;