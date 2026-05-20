import express from "express"
import { getVotedCandidates, submitVote } from "../controllers/vote.js";
import { verifyUser } from "../middleware/verifyUser.js";
const router = express.Router();

router.post("/",verifyUser,submitVote)
router.get("/",verifyUser,getVotedCandidates)
export default router