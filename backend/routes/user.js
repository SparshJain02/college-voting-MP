import express from "express"
const router = express.Router();
import { login, loginPassport, logout, refreshToken, signup, signupPassport,sendOtp, verifyOtp, fetchUser } from "../controllers/user.js";
import { credentialVerificationUser } from "../middleware/credVerifyUser.js";
import { verifyUser } from "../middleware/verifyUser.js";
router.post("/login/pass", loginPassport)

router.post("/signup/pass",signupPassport)
router.post("/signup",credentialVerificationUser,signup)
router.post("/login",credentialVerificationUser,login)
router.get("/user",verifyUser,fetchUser)
router.post("/logout",logout)
router.post("/refresh",refreshToken) // it's universal not related to user only
// otps
router.post("/otp",credentialVerificationUser,sendOtp)
router.post("/otp/verify",verifyOtp)
export default router