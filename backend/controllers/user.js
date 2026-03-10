import { User } from "../models/user.js";
import bcrypt from "bcrypt"
import passport from "passport";
import jwt from "jsonwebtoken"
import { ENV } from "../env.js";
import { authSchema, loginSchema } from "../validation/zod.js";
import { getCookieOption } from "../config/cookieOptions.js";

export const signupPassport = async(req,res) => {
    const {email , password} = req.body;
    const user = await User.findOne({email});
    if(user){
        return res.status(409).json({message: "user already exist" })
    }
    const hashedPassword = await bcrypt.hash(password,5)
    const newUser = new User({
        email,password: hashedPassword
    })
    await newUser.save();
    return res.status(201).json({message: "user data saved successfully",status: true})
}
export const signup = async(req,res)=>{
    try{

        const result = authSchema.safeParse(req.body);
        if (!result.success) {
            const errors = result.error.issues.reduce((acc, obj) => {
                acc[obj.path] = obj.message;
                return acc;
            }, {});
            return res.status(422).json({error: errors});
        }
        const {email,password,username,rollno,branch} = req.body;
        const user = await User.findOne({email,rollno});
        if(user){
            return res.status(409).json({message: "user already exist" })
        }
        const hashedPassword = await bcrypt.hash(password,5)
        const savedUser = await User.insertOne({email,password:hashedPassword,rollno,username,branch})
        const accessToken = jwt.sign({
            userId: savedUser._id
        },ENV.JWT_SECRET,{expiresIn: "15m"});
        const refreshToken = jwt.sign({
            userId: savedUser._id
        },ENV.JWT_SECRET,{expiresIn: "3d"});
        await User.findByIdAndUpdate(savedUser._id,{$set: {refreshToken: refreshToken}});
        res.cookie("accessToken",accessToken,getCookieOption("access"));
        res.cookie("refreshToken",refreshToken,getCookieOption("refresh"));
        return res.status(201).json({message: "user saved successfully!",status: true});
    }
    catch(err){
        return res.status(500).json({message: `Error signing in: ${err}` })
    }
}
export const login = async(req,res)=>{
    const result = loginSchema.safeParse(req.body);
    if(!result.success){
        const err = result.error.issues.reduce((acc,obj)=>{
            acc[obj.path] = obj.message;
            return acc;
        },{})
        return res.status(422).json({error: err});
    }
    const {email,password,rollno} = req.body;
    const user = await User.findOne({email,rollno});
    if(!user){
        return res.status(404).json({message: "incorrect credentials" })
    }
    const hashedPassword = user.password;
    bcrypt.compare(password,hashedPassword,(err,result)=>{
        if(err){
            return res.status(500).json({message: "login failed! something went wrong", status: false})
        }
        else if(!result){
            return res.status(401).json({message: "email or password incorrect", status: true})
        }
    })    
     const accessToken = jwt.sign({
        userId: user._id
    },ENV.JWT_SECRET,{expiresIn: "15m"});
    const refreshToken = jwt.sign({
        userId: user._id
    },ENV.JWT_SECRET,{expiresIn: "3d"});
    await User.updateOne({_id: user._id},{refreshToken})
    res.cookie("accessToken",accessToken,getCookieOption("access"));
    res.cookie("refreshToken",refreshToken,getCookieOption("refresh"));

    return res.status(200).json({message: "Logged in Successfully!",status: true})
}
export const logout = async(req,res)=>{
    try{
        const refreshToken = req.cookies.refreshToken;
        if(refreshToken){
            const user = await User.findOneAndUpdate({refreshToken},{$set: {refreshToken: null}}); 
            res.clearCookie("refreshToken",);
        }
        if(req.cookies.accessToken){
            res.clearCookie("accessToken");
        }
        return res.status(200).json({message: "logout successfull", status: true});
    }
    catch(err){
        return res.status(500).json({message: "Failed to logout" });
    }
}
export const refreshToken = async(req,res)=>{
    // here i have to create accessToken but only when if refresh
    const refreshToken = req.cookies.refreshToken;
    // there can be a case where there is no refreshToken
    if(!refreshToken){
        return res.status(404).json({message: "no token provided", status: false});
    }

    jwt.verify(refreshToken,ENV.JWT_SECRET,async(err,decoded)=>{
        if(err){
            if(err.name == "TokenExpiredError"){
                // then redirect to login 
                return res.status(401).json({message: "Log in again!" });
            }
            return res.status(500).json({message: "refreshToken broked" });
        }
        else if(!decoded){
            return res.status(401).json({message: "not verified!" });
        }
        const user = await User.findById(decoded.userId);
        if(user.refreshToken !== refreshToken){
            res.clearCookie("refreshToken");
            return res.status(401).json({message: "Unauthorized" });
        }
        // now generate access token
        const payload = decoded.userId;
        const accessToken =  jwt.sign({userId: payload},ENV.JWT_SECRET,{expiresIn: "15m"});
         res.cookie("accessToken",accessToken,getCookieOption("access"));
         return res.status(200).json({message: "token send successfully", status: true});
    })
}
export const loginPassport = async(req,res,next)=>{
    passport.authenticate('local',(err,user,info)=>{
        if(err){
            return res.json({status: false,message: "error logging in..."})
        }
        else if(!user){
            return res.json({status: false, message: info.message})
        }
        req.login(user,()=>{
            return res.json({status: true, message: "logged in successfully!"})
        })
    })(req,res,next);
}
