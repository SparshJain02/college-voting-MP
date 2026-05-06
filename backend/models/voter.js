import mongoose, { Schema } from "mongoose"

const voterSchema = new Schema({
    candidateId: {
        type: Schema.Types.ObjectId,
        ref: "Candidate"
    },
    // ! remmove this role as it already exists in candidate 
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