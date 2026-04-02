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
            else if(err.name === "JsonWebTokenError"){
                // it means user has modified the token 
                return res.status(401).json({error: "Unauthorized" })
            }
        }
        else if(!decoded){
            return res.status(401).json({error: "Unauthorized" });
        }
        else{
            req.UserId = decoded.userId;
            req.role = decoded.role;
            next();
        }
    });
}