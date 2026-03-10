import jwt from "jsonwebtoken"
import { ENV } from "../env.js";
export const verifyUser = async (req,res,next)=>{
    const token = req.cookies.accessToken;
    if(!token){
        return res.status(401).json({message: "Token Invalid!" })
    }
    jwt.verify(token,ENV.JWT_SECRET,(err,decoded)=>{
        if(err){
            if(err.name === "TokenExpiredError"){
                return res.status(401).json({message: "Token Expired" })
            }
                return res.status(500).json({message: "Authentication Error!" })
        }
        else if(!decoded){
            return res.status(403).json({message: "not verified!" });
        }
        else{
            req.UserId = decoded.userId;
            next();
        }
    });
}