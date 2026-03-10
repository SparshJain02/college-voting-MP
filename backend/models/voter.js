import mongoose, { Schema } from "mongoose"

const voterSchema = new Schema({
    votedFor: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    whoVoted: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }]
    }
})

const voterModel = mongoose.model("Voter",voterSchema);

export default voterModel;