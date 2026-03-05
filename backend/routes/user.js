import express from "express"
const router = express.Router();
import { login, loginPassport, logout, refreshToken, signup, signupPassport, userFetch } from "../controllers/user.js";
import { verifyUser } from "../middleware/verifyUser.js";
router.post("/login/pass", loginPassport)

router.post("/signup/pass",signupPassport)
router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)
router.post("/user-fetch",verifyUser,userFetch)
router.post("/refresh-token",refreshToken)

export default router