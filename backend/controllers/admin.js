import { getCookieOption } from "../config/cookieOptions.js";
import generateOtp from "../config/otp.js";
import adminModel from "../models/admin.js";
import otpModel from "../models/otps.js";
import sendJwtToken from "../services/create-jwt-token.js";
import { sendMail, sendMailAdmin } from "../services/email-send.js";
import bcrypt from "bcrypt"
import { electionDateModel } from "../models/elections.js";
import { electionDateSchema } from "../validation/zod.js";
export const signup = async (req, res) => {
    const superRole = req.role;
    if (superRole != "super") {
        return res.status(403).json({ error: "Super admin can create admin" });
    }
    // {email,password,branch,username} = req.body  
    try {
        // !uncomment after testing
        // const result = adminSchema.safeParse(req.body);
        // if(!result){
        //     return res.status(422).json({error: "Validation Errors"});
        // }
        const { email, password, branch, username } = req.body;
        // check whether admin already exists

        const admin = await adminModel.findOne({ email });
        if (admin) {
            return res.status(409).json({ error: "Admin already exists!" });
        }
        const hashedPassword = await bcrypt.hash(password, 5);

        const createdAdmin = await adminModel.create({
            email, password: hashedPassword, username, branch, role: "admin"
        })

        // sending mail to admin
        sendMailAdmin(username, email, password, branch);

        return res.status(201).json({
            data: {
                email: createdAdmin.email,
                username: createdAdmin.username,
                branch: createdAdmin.branch,
            }
        })
    }
    catch (err) {
        return res.status(500).json({ err: err.message });
    }
}
export const login = async (req, res) => {
    const admin = req.Admin;
    // now sign jwt and return 
    const token = sendJwtToken(admin._id, admin.role);
    await adminModel.findByIdAndUpdate(admin._id, { refreshToken: token.refreshToken });

    res.cookie("accessToken", token.accessToken, getCookieOption("access"))
    res.cookie("refreshToken", token.refreshToken, getCookieOption("refresh"))


    return res.status(200).json({ message: "Login in successfull" });
}
export const sendOtp = async (req, res) => {
    try {
        const admin = req.Admin;
        const otp = generateOtp();
        let currOtp = await otpModel.findOne({ email: admin.email });
        if (currOtp) {
            // check expiry
            const expiry = new Date().getTime() - currOtp.createdAt.getTime(); // milliscs
            if (expiry > 60 * 1000) { // 60 secs
                // then 
                await otpModel.updateOne({ email: admin.email }, { otp, createdAt: new Date() });
                sendMail(admin.email, otp);
                return res.status(200).json({ message: "Otp Resend Successfully!" });
            }
            // generate new otp 
            return res.status(409).json({ error: "Otp Already Exists" });
        }
        // if no otp then create
        currOtp = await otpModel.create({ email: admin.email, otp });
        sendMail(admin.email, otp);
        return res.status(201).json({ message: "OTP send successfully!" });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
export const setElectionDates = async (req, res) => {
    const role = req.role;
    const admin = req.UserId;
    if (role !== "admin") {
        return res.status(403).json({ error: "Only admin are allowed to create elections" });
    }
    const result = electionDateSchema.safeParse(req.body);
    if (!result) {
        return res.status(422).json({ error: "Validation Errors" });
    }
    const { nominationStart, nominationEnd, votingStart, votingEnd } = req.body;

    // * there are things that should be taken care of: 1) admin should not be allowed to upload elections more than once 2) (optional) there should be feature so that admin can update timelines
    const dates = await electionDateModel.create({
        nominationStart,
        nominationEnd,
        votingStart,
        votingEnd,
        admin
    })
    return res.status(201).json({ message: "Election Created Successfully!" });
}

export const getAdmins = async (req, res) => {
    // only superadmin can get details of all admins so: 
    const role = req.role;
    if (role != "super") {
        return res.status(403).json({ error: "Only super admin is allowed to get admins" });
    }

    // i have applied aggregate on adminModel , the sole purpose for this is to add status field 
    // status can be active or inactive so it is checked from electiondates model
    // active if current date is less then voting end date

    const result = await adminModel.aggregate([
        {
            $match:{ // this is because it can add super admin also 
                role: "admin"
            }
        },
        {
            $lookup: {
                from: "electiondates", // actual collection name
                localField: "_id",
                foreignField: "admin",
                as: "elections", // this will create new field in result with election which will be an array
            },
        },
        {
            $unwind: {
                path: "$elections", // this will remove that array from the newly added election field
                preserveNullAndEmptyArrays: true, // it will keep the non matched document also like a admin who is created but he have not yet created election dates also so what will happen is aggregate will try to find the current admin id with electiondates.admin but it will be null so the document won't be added in result if we won't add this statement  
            }
        },
        {
            $addFields: { // this is the actual logic to add status 
                status: { // field name
                    $cond: [ // condition which is getting applied 
                        {
                            $and: [
                                { $ne: ["$elections", null] }, 
                                { $gte: ["$elections.votingEnd", new Date()] }
                            ]
                        },
                        "Active",
                        "Inactive"
                    ]
                }
            }
        }
    ]);
    const adminData = result.map((admin)=>{
        return{
            name: admin.username,
            email: admin.email,
            status: admin.status,
            branch: admin.branch
        }
    })
    return res.status(200).json({ data: adminData });

}
export const getElectionStatus = async(req,res)=>{
    // !pending
    // i would need election data in home page and in admin page 
}
export const deleteAdmin = async(req,res)=>{
    console.log(req.body);
    try{
        const {email} = req.body;
        const role = req.role;
        if(role!="super"){
            return res.status(403).json({error: "Only super admins are allowed to delete"});
        }
        // ! check email validation when testing completes
        
        // find whether admins exists or not
        const admin = await adminModel.findOne({email});
        if(!admin){
            return res.status(404).json({error: "Admin not found"});
        }
        // now delete
        await adminModel.deleteOne({email});
        // delete elections also
        await electionDateModel.deleteOne({admin:admin._id});
        // !send mail notifiying you are not admin anymore
        return res.status(200).json({message: "Admin Deleted Successfully!"});
    }
    catch(err){
        return res.status(500).json({error: `admin deletion failed ${err.name}`});
    }
}