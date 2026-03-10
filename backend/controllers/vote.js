import candidateModel from "../models/elections.js";
import { User } from "../models/user.js";
import voterModel from "../models/voter.js";

export const addCandidate = async(req,res)=>{
    try{
        const {position} = req.body;
        if(!(position === "president" || position === "vicePresident")){
            return res.status(403).json({message: "Invalid role", status: false});
        }
        const {UserId} = req;
        const user = await User.findById(UserId);
        if(!user){
            return res.status(401).json({message: "Unauthorized" });
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
        else return res.status(403).json({message: "Seats full" });
        return res.status(201).json({message: "Candidate Added Successfully", status: true});
    }
    catch(err){
        return res.status(500).json({message: `Error adding candidate: ${err},`, status: false});
    }
}
export const candidateFetch = async(req,res)=>{
    const {position} = req.params;
    const user = await User.findById(req.UserId);
    if(!user){
        return res.status(401).json({message: "Unauthorized"});
    }
    const branch = user.branch;
    let candidates = await candidateModel.findOne({branch,position}).populate("applications","username rollno email branch");
    if(!candidates){
        return res.status(404).json({message: "no candidates yet"});
    }
    candidates = candidates.applications.map(obj=>obj)
    return res.status(200).json({data: candidates})
}
export const addVoters = async(req,res)=>{
    try{
        // find if user exists
        const {candidateId} = req.body; 
        const user = await User.findById(req.UserId);
        if(!user){
            return res.status(401).json({message: "Unauthorized"});
        }
        
        // we have to make sure that user is not candidate
        const isCandidate = await candidateModel.find({branch: user.branch, applications:{$in:[user._id]}});
        if(isCandidate.length!==0){
            return res.status(403).json({message: "Candidates can't vote"});
        }        
        // if candidate exist then update if not then create 
        const votedObj = await voterModel.findOne({votedFor: candidateId});
        if(!votedObj){
            await voterModel.create({votedFor: candidateId,whoVoted: req.UserId});
            return res.status(201).json({message: "Vote added Successfully"});
        }
        await voterModel.updateOne({votedFor: candidateId},{$push: {whoVoted: req.UserId}})
        return res.status(201).json({message: "Vote added Successfully"});
    }
    catch(err){
        return res.status(500).json({message: "err: ",err});
    }
    
}