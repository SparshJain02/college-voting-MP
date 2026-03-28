import express from "express"
const router = express.Router();
import { login, loginPassport, logout, refreshToken, signup, signupPassport,sendOtp, verifyOtp } from "../controllers/user.js";
import { credentialVerificationUser } from "../middleware/credVerifyUser.js";
router.post("/login/pass", loginPassport)

router.post("/signup/pass",signupPassport)
router.post("/signup",credentialVerificationUser,signup)
router.post("/login",credentialVerificationUser,login)
router.post("/logout",logout)
router.post("/refresh-token",refreshToken)


// otps
router.post("/otp",credentialVerificationUser,sendOtp)
router.post("/otp/verify",verifyOtp)
export default router