import express from "express"
import { credVerifyAdmin } from "../middleware/credVerifyAdmin.js";
import { deleteAdmin, getAdmins, getElectionDates, login, sendOtp, signup, updateNominations, updateVotings } from "../controllers/admin.js";
import { verifyUser } from "../middleware/verifyUser.js";
import { setElectionDates } from "../controllers/admin.js";
const router = express.Router();
    
router.post("/signup",verifyUser,signup)
router.post("/login",credVerifyAdmin,login)
router.post("/otp",credVerifyAdmin,sendOtp)
router.get("/all",verifyUser,getAdmins);
router.delete("/",verifyUser,deleteAdmin);

router.post("/election",verifyUser,setElectionDates)
router.get("/election",verifyUser,getElectionDates);
router.put("/election/nomination",verifyUser,updateNominations)
router.put("/election/voting",verifyUser,updateVotings)

export default router;