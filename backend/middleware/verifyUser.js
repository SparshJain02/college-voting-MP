import jwt from "jsonwebtoken"
import { ENV } from "../env.js";
export const verifyUser = async (req,res,next)=>{
    const token = req.cookies.accessToken;
    if(!token){
        return res.status(401).json({error: "Token Expired" })
    }
    jwt.verify(token,ENV.JWT_SECRET,(err,decoded)=>{
        if(err){
            if(err.name === "TokenExpiredError"){
                return res.status(401).json({error: "Token Expired" })
            }
                return res.status(500).json({error: "Authentication Error!" })
        }
        else if(!decoded){
            return res.status(403).json({error: "Not Verified" });
        }
        else{
            req.UserId = decoded.userId;
            next();
        }
    });
}