import { getCookieOption } from "../config/cookieOptions";
import adminModel from "../models/admin.js";
import sendJwtToken from "../services/create-jwt-token.js";
import { adminSchema } from "../validation/zod.js"
import bcrypt from "bcrypt"
export const signup = async(req,res)=>{
    // !before signup actual proceeds check whether the user is super admin
    try{
        const result = adminSchema.safeParse(req.body);
        if(!result){
            return res.status(422).json({error: "Validation Errors"});
        }
        // check whether admin already exists
        const admin = await adminModel.findOne({email});
        if(admin){
            return res.status(409).json({error: "Admin already exists!"});
        }
        const {email,password,branch,username} = req.body;
        const hashedPassword = await bcrypt.hash(password,5);

        const createdAdmin = await adminModel.create({
            email,password:hashedPassword,username,branch
        })
        
        const token = sendJwtToken("admin");
        
        res.cookie("accessToken",token.accessToken,getCookieOption("access"));
        res.cookie("refreshToken",token.refreshToken,getCookieOption("refresh"));
        await adminModel.updateOne({email},{refreshToken: token.refreshToken});

        // ! send email to admin with their password 

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