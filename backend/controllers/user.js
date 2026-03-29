import { User } from "../models/user.js";
import bcrypt from "bcrypt"

import passport from "passport";
import jwt from "jsonwebtoken"
import { ENV } from "../env.js";
import { authSchema, loginSchema, emailCheck, otpSchema } from "../validation/zod.js";
import { getCookieOption } from "../config/cookieOptions.js";
import generateOtp from "../config/otp.js";
// import { sendEmail } from "../services/email-send.js";
import otpModel from "../models/otps.js"
import sendMail from "../services/email-send.js";
import sendJwtToken from "../services/token-send.js";

export const signupPassport = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        return res.status(409).json({ message: "user already exist" })
    }
    const hashedPassword = await bcrypt.hash(password, 5)
    const newUser = new User({
        email, password: hashedPassword
    })
    await newUser.save();
    return res.status(201).json({ message: "user data saved successfully", status: true })
}
export const signup = async (req, res) => {
    try {
        const { email, password, username, rollno, branch } = req.body;
        const result = authSchema.safeParse(req.body);
        if (!result.success) {
            // const errors = result.error.issues.reduce((acc, obj) => {
            //     acc[obj.path] = obj.message;
            //     return acc;
            // }, {});
            return res.status(422).json({ error: "Validation Errors" });
        }
        const hashedPassword = await bcrypt.hash(password, 5)
        const savedUser = await User.insertOne({ email, password: hashedPassword, rollno, username, branch })
        // creating access and refresh token
        const token = sendJwtToken(savedUser._id);
        await User.findByIdAndUpdate(savedUser._id, { $set: { refreshToken: token.refreshToken } });
        res.cookie("accessToken", token.accessToken, getCookieOption("access"));
        res.cookie("refreshToken", token.refreshToken, getCookieOption("refresh"));
        return res.status(201).json({message: "Signed In"});
    }
    catch (err) {
        return res.status(500).json({ error: `Error signing In: ${err}` })
    }
}
export const login = async (req, res) => { 

    const token = sendJwtToken(req.User._id);

    await User.updateOne({ _id: req.User._id }, { refreshToken:token.refreshToken })
    res.cookie("accessToken", token.accessToken, getCookieOption("access"));
    res.cookie("refreshToken", token.refreshToken, getCookieOption("refresh"));

    return res.status(200).json({ message: "User Logged in Successfully"});
}
export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const user = await User.findOneAndUpdate({ refreshToken }, { $set: { refreshToken: null } });
            res.clearCookie("refreshToken",);
        }
        if (req.cookies.accessToken) {
            res.clearCookie("accessToken");
        }
        return res.status(200).json({ message: "Logout"});
    }
    catch (err) {
        return res.status(500).json({ message: "Failed to logout" });
    }
}
export const refreshToken = async (req, res) => {
    // here i have to create accessToken but only when if refresh
    const refreshToken = req.cookies.refreshToken;
    // there can be a case where there is no refreshToken
    if (!refreshToken) {
        return res.status(404).json({ error: "Unauthorized"});
    }

    jwt.verify(refreshToken, ENV.JWT_SECRET, async (err, decoded) => {
        if (err) {
            if (err.name == "TokenExpiredError") {
                // then redirect to login 
                return res.status(401).json({ error: "Unauthorized" });
            }
            return res.status(500).json({ error: "refreshToken broked" });
        }
        else if (!decoded) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const user = await User.findById(decoded.userId);
        if (user.refreshToken !== refreshToken) {
            res.clearCookie("refreshToken");
            return res.status(401).json({ error: "Unauthorized" });
        }
        // now generate access token
        const payload = decoded.userId;
        const accessToken = jwt.sign({ userId: payload }, ENV.JWT_SECRET, { expiresIn: "15m" });
        res.cookie("accessToken", accessToken, getCookieOption("access"));
        return res.status(201).json({ message: "Acess Token Generated"});
    })
}
export const loginPassport = async (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.json({ status: false, message: "error logging in..." })
        }
        else if (!user) {
            return res.json({ status: false, message: info.message })
        }
        req.login(user, () => {
            return res.json({ status: true, message: "logged in successfully!" })
        })
    })(req, res, next);
}
export const fetchUser = async(req,res)=>{
    //  i want to fetch the user 
    const user = await User.findById(req.UserId);
    if(!user){
        return res.status(401).json({error: "Unauthorized"});
    }
    return res.status(200).json({data: {
        email: user.email,
        rollno: user.rollno,
        username: user.username,
        branch: user.branch,
    }})
}

// otps
export const sendOtp = async (req, res) => {
    const { email } = req.body;
    // const result = emailCheck.safeParse(email);
    // if (!result) {
    //     return res.status(422).json({ error: "Invalid Email" });
    // }
 
    // // *before generating otp let's verify whether we should sent otp or not
    // const user = await User.findOne({email});
    // if(type==="signup" && user){
    //     return res.status(409).json({error: "User Aready Exists"});
    // }
    // else if(type ==="login" && (!user)){
    //     return res.status(404).json({error: "User Doesnot Exists"});
    // }
    // else if(!(type==="login" || type==="signup")){
    //     return res.status(422).json({error: "Invalid Type"});
    // }


    const otp = generateOtp();
    const isOtp = await otpModel.findOne({ email});
    if (isOtp) {
        // user is requesting to resend 
        const expiry = new Date().getTime() - isOtp.createdAt.getTime();
        // expiry in milliseconds
        if (expiry >= 60*1000) {
            await otpModel.updateOne({ email }, { otp,createdAt: new Date() })
            sendMail(email, otp);
            // const data = await sendEmail(email,otp);
            return res.status(200).json({ message: "Email send successfully" });
        }
        return res.status(409).json({ error: "OTP Already Exists!" });
    }
    sendMail(email, otp);
    // const data = await sendEmail(email, otp);
    await otpModel.create({ email, otp });
    return res.status(200).json({ message: "Email send successfully" });
}
export const verifyOtp = async (req, res) => {
    const { otp, email } = req.body;
    if(otp.length!=6){
        return res.status(422).json({error: "Invalid OTP"});
    }
    const result = emailCheck.safeParse(email);
    if (!result) {
        return res.status(422).json({ error: "Invalid Email" });
    }
    const generatedOtp = await otpModel.findOne({ email });
    if (!generatedOtp) { 
        return res.status(404).json({ error: "OTP Expired Or Not Created Yet" })
    }
    else if (otp !== generatedOtp.otp) {
        return res.status(403).json({ error: "Incorrect OTP" })
    }
    return res.status(200).json({ message: 'otp verifed' });
}