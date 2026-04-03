import express from "express"
import { verifyUser } from "../middleware/verifyUser.js";
import { addCandidate, addVoters } from "../controllers/vote.js";
import { candidateFetch } from "../controllers/vote.js";
const Router = express.Router();

// when user will click on president/vice president then he will be registered as candidate
Router.post("/",verifyUser,addCandidate)
Router.get("/:position",verifyUser,candidateFetch)
Router.post("/vote",verifyUser,addVoters)



export default Router;