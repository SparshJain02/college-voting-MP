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
    branch: {
        type: String,
        unique: true,
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
    },
    admin: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    }
})
export const electionDateModel = mongoose.model("ElectionDates",electionDates);
const candidateModel = mongoose.model("Candidate",candidateSchema);
export default candidateModel;