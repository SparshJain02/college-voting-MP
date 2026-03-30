import { User } from "../models/user.js";
import { authSchema } from "../validation/zod.js";
import bcrypt from "bcrypt"

export const credentialVerificationUser = async(req,res,next)=>{
    const {type,email,password,rollno} = req.body;
    
    if(type === "signup"){
        const result = authSchema.safeParse(req.body);
        if(!result){    
            return res.status(422).json({ error: "Validation Failed" });
            // signup validations
        }
        // checking whether user exists with email
        const userEmail = await User.findOne({email});
        // the reason to check for roll no seperately because user can input another existing user roll no and try to signup 
        // if we check by .findOne({email,rollno}) it will give entry for the user with x email and x roll no , but user should have y email and y roll no , without checking roll no user can have y email but x roll no 
        const userRoll = await User.findOne({rollno});
        
        if(userEmail){
            return res.status(409).json({error: "User Already Exists!"});
        }
        else if(userRoll){
            return res.status(409).json({error: "User Already Exists"});
        }
        next();
    }
    else if(type === "login"){
        const loginSchema = authSchema.pick({email: true,rollno: true,password: true});
        const result = loginSchema.safeParse(req.body);
        if(!result){
            return res.status(422).json({error: "Validation Error"})
        }
        // login validations
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({error: "User doesnot exists"});
        }
        else if(user.rollno!==rollno){
            return res.status(401).json({error: "Incorrect Roll Number"});
        }
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(401).json({error: "Incorrect Password"});
        }
        req.User = user;
        next();
    }
    else{
        return res.status(403).json({error: "Invalid Type"});
    }
    
}