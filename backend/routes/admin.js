import express from "express"
import { credVerifyAdmin } from "../middleware/credVerifyAdmin.js";
import { deleteAdmin, getAdmins, login, sendOtp, signup } from "../controllers/admin.js";
import { verifyUser } from "../middleware/verifyUser.js";
import { setElectionDates } from "../controllers/admin.js";
const router = express.Router();
    
router.post("/signup",verifyUser,signup)
router.post("/login",credVerifyAdmin,login)
router.post("/otp",credVerifyAdmin,sendOtp)
router.get("/",verifyUser,getAdmins);
router.delete("/",verifyUser,deleteAdmin);

router.post("/election",verifyUser,setElectionDates)


export default router;