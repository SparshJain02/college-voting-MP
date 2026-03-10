import candidateModel from "../models/elections.js";
import { User } from "../models/user.js";

export const addCandidate = async(req,res)=>{
    try{
        const {position} = req.body;
        if(!(position === "president" || position === "vicePresident")){
            return res.status(403).json({message: "Invalid role", status: false});
        }
        const {UserId} = req;
        const user = await User.findById(UserId);
        if(!user){
            return res.status(401).json({message: "Unauthorized",status: false});
        }

        const isCandidate = await candidateModel.findOne(
            {position,branch: user.branch}
        )
        if(!isCandidate){
            // then create new document
            await candidateModel.create({position,applications: user._id,branch: user.branch});
        }
        else if(isCandidate.applications.length<=20){
            // then insert
            if(isCandidate.applications.includes(user._id)){
                return res.status(409).json({message: "Already voted", status: false});
            }
            await candidateModel.updateOne(
                {position,branch: user.branch},
                {$push: {applications: user._id}}
            )
        }
        else return res.status(403).json({message: "Seats full",status: false});
        return res.status(201).json({message: "Candidate Added Successfully", status: true});
    }
    catch(err){
        return res.status(500).json({message: `Error adding candidate: ${err},`, status: false});
    }
}