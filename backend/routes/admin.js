import express from "express"
import { credVerifyAdmin } from "../middleware/credVerifyAdmin.js";
import { login, sendOtp, signup } from "../controllers/admin.js";
import { verifyUser } from "../middleware/verifyUser.js";
const router = express.Router();

router.post("/signup",verifyUser,signup)
router.post("/login",credVerifyAdmin,login)
router.post("/otp",credVerifyAdmin,sendOtp)

export default router;