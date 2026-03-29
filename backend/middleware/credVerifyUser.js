import { User } from "../models/user.js";
import { authSchema } from "../validation/zod.js";
import bcrypt from "bcrypt"

export const credentialVerificationUser = async(req,res,next)=>{
    const {type,email,password,rollno} = req.body;
    
    if(type === "signup"){
        const signupSchema = authSchema.pick({email:true,rollno: true});
        const result = signupSchema.safeParse(req.body);
        if(!result){
            return res.status(422).json({ error: "Validation Failed" });
            // signup validations
        }
        const user = await User.findOne({email});
        if(user){
            return res.status(409).json({error: "User Already Exists!"});
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