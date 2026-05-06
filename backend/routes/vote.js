import express from "express"
import { getVotedCandidates, submitVote } from "../controllers/vote.js";
import { verifyUser } from "../middleware/verifyUser.js";
const router = express.Router();

router.post("/",verifyUser,submitVote)
// actually there is no need of verifyUser middleware cause we are not using it in our controller but we still need cause we are asking for branch from req.query which means user should be authenticated 
router.get("/",verifyUser,getVotedCandidates)
export default router