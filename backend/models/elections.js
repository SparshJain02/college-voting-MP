import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
    position: {
        type: String,
        enum: ["president","vicePresident"],
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
        enum: ["bca","mca","btech","bsc","bba","bcom"]
    }
})

const candidateModel = mongoose.model("Candidate",candidateSchema);
export default candidateModel;