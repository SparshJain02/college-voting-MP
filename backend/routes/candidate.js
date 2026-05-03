import express from "express"
import { verifyUser } from "../middleware/verifyUser.js";
import { addCandidate, amICandidate, candidateCountFetch, updateCandidates } from "../controllers/vote.js";
import { candidateFetch } from "../controllers/vote.js";
const Router = express.Router();

// when user will click on president/vice president then he will be registered as candidate
Router.post("/",verifyUser,addCandidate)
Router.get("/",verifyUser,candidateFetch)
Router.get("/check",verifyUser,amICandidate);
Router.get("/count",verifyUser,candidateCountFetch)
Router.put("/",verifyUser,updateCandidates)




export default Router;