import jwt from "jsonwebtoken";
import { ENV } from "../env.js";
const sendJwtToken = (id) => {
    const accessToken = jwt.sign({
        userId: id
    }, ENV.JWT_SECRET, { expiresIn: "15m" });

    const refreshToken = jwt.sign({
        userId: id
    }, ENV.JWT_SECRET, { expiresIn: "3d" });
    
    return {
        accessToken,refreshToken
    }
}
export default sendJwtToken;