import express from "express"
import { submitVote } from "../controllers/vote.js";
import { verifyUser } from "../middleware/verifyUser.js";
const router = express.Router();

router.post("/",verifyUser,submitVote)
export default router