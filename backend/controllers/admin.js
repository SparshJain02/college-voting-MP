import { getCookieOption } from "../config/cookieOptions.js";
import generateOtp from "../config/otp.js";
import adminModel from "../models/admin.js";
import otpModel from "../models/otps.js";
import sendJwtToken from "../services/create-jwt-token.js";
import {sendMail,sendMailAdmin} from "../services/email-send.js";
import { adminSchema, } from "../validation/zod.js"
import bcrypt from "bcrypt"
export const signup = async(req,res)=>{
    const superRole = req.role;
    console.log(superRole);
    if(superRole!="super"){
        return res.status(403).json({error: "Super admin can create admin"});
    }
    // {email,password,branch,username} = req.body  
    try{
        // !uncomment after testing
        // const result = adminSchema.safeParse(req.body);
        // if(!result){
        //     return res.status(422).json({error: "Validation Errors"});
        // }
        const {email,password,branch,username} = req.body;
        // check whether admin already exists

        const admin = await adminModel.findOne({email});
        if(admin){
            return res.status(409).json({error: "Admin already exists!"});
        }
        const hashedPassword = await bcrypt.hash(password,5);

        const createdAdmin = await adminModel.create({
            email,password:hashedPassword,username,branch,role:"admin"
        })
        
        const token = sendJwtToken("admin");
        
        res.cookie("accessToken",token.accessToken,getCookieOption("access"));
        res.cookie("refreshToken",token.refreshToken,getCookieOption("refresh"));
        await adminModel.updateOne({email},{refreshToken: token.refreshToken});

        // sending mail to admin
        sendMailAdmin(username,email,password,branch);

        return res.status(201).json({data: {
            email: createdAdmin.email,
            username: createdAdmin.username,
            branch: createdAdmin.branch,
        }})
    }
    catch(err){
        return res.status(500).json({err: err.message});
    }
}
export const login = async(req,res)=>{
    const admin = req.Admin;   
    // now sign jwt and return 
    const token = sendJwtToken(admin._id,admin.role);
    await adminModel.findByIdAndUpdate(admin._id,{refreshToken:token.refreshToken});

    res.cookie("accessToken",token.accessToken,getCookieOption("access"))
    res.cookie("refreshToken",token.refreshToken,getCookieOption("refresh"))


    return res.status(200).json({message: "Login in successfull"});
}
export const sendOtp = async(req,res)=>{
    try{
        const admin = req.Admin;
        const otp = generateOtp();
        let currOtp = await otpModel.findOne({email: admin.email});
        if(currOtp){
            // check expiry
            const expiry = new Date().getTime() - currOtp.createdAt.getTime(); // milliscs
            if(expiry>60*1000){ // 60 secs
                // then 
                await otpModel.updateOne({email:admin.email},{otp,createdAt: new Date()});
                sendMail(admin.email,otp);
                return res.status(200).json({message: "Otp Resend Successfully!"});
            } 
            // generate new otp 
            return res.status(409).json({error: "Otp Already Exists"});
        }
        // if no otp then create
        currOtp = await otpModel.create({email:admin.email,otp});
        sendMail(admin.email,otp);
        return res.status(201).json({message: "OTP send successfully!"});
    }
    catch(err){
        return res.status(500).json({error: err.message});
    }    
}
