import mongoose, { Schema } from "mongoose"

const voterSchema = new Schema({
    candidateId: {
        type: Schema.Types.ObjectId,
        ref: "Candidate"
    },
    role: {
        type: String,
        enum: ["President","Vice President"]
    },
    branch: {
        type: String,
    }
})

const voterModel = mongoose.model("Voter",voterSchema);

export default voterModel;