import mongoose, { Schema } from "mongoose";
const adminSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    branch: {
        type: String,
        required: true,
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
    role: {
        type: String,
        enum: ["admin","super"],
        default: "admin"
    },
    refreshToken: {
        type: String,
        default: null
    }
});
const adminModel =  mongoose.model("Admin",adminSchema);
export default adminModel;