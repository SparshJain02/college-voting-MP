import adminModel from "../models/admin.js";
import { authSchema } from "../validation/zod.js";
import bcrypt from "bcrypt"

export const credVerifyAdmin = async(req,res,next)=>{
    const {email,password} = req.body;
    const adminSchema = authSchema.pick({email:true,password: true});
    const result = adminSchema.safeParse(req.body);
    if(!result){    
        return res.status(422).json({ error: "Validation Failed" });
        // signup validations
    }
    // validations done now chech actual user
    const admin = await adminModel.findOne({email});
    if(!admin){
        return res.status(404).json({error: "Admin not exists"});
    }
    const isMatched = await bcrypt.compare(password,admin.password);
    if(!isMatched){
        return res.status(401).json({error: "Incorrect Password"});
    }   
    req.Admin = admin; 
    next();  
}