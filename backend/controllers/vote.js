import adminModel from "../models/admin.js";
import candidateModel, { electionDateModel } from "../models/elections.js";
import { User } from "../models/user.js";
import voterModel from "../models/voter.js";

export const addCandidate = async(req,res)=>{
    try{
        // * validations 
        const role = req.role;
        if(role!=="student"){
            return res.status(403).json({error: "Only students are eligible"});
        }
        const {position,slogan} = req.body;
        if(!(position === "President" || position === "Vice President")){
            return res.status(403).json({error: "Invalid position"});
        }
        const {UserId} = req;
        const user = await User.findById(UserId);
        if(!user){
            return res.status(404).json({error: "User not found" });
        }

        // *checking whether elections are going on or not
        const electionDates = await electionDateModel.findOne({branch: user.branch});
        if(!electionDates) return res.status(403).json({error: "no elections yet"});
        const currDate = new Date();
        const nominationStart = new Date(electionDates.nominationStart);
        const nominationEnd = new Date(electionDates.nominationEnd);
        if(!(currDate>=nominationStart && currDate<=nominationEnd)){
            return res.status(403).json({error: `You cannot apply yet!`});
        }

        // *logic to add candidate 
        const isCandidate = await candidateModel.findOne({candidateId: user._id,});
        if(isCandidate){
            return res.status(409).json({error: "You have already applied"});
        }
        const posCount = await candidateModel.countDocuments({position});
        if(!posCount>=50){
            return res.status(403).json({error: "Seats are full"});
        }
        await candidateModel.create({position,candidateId: user._id,branch: user.branch,slogan});

        const pCount = await candidateModel.countDocuments({position: "President",branch: user.branch});
        const vPCount = await candidateModel.countDocuments({position: "Vice President",branch: user.branch});
        
        // setting up socket
        const io = req.app.get('io');
        io.to(user.branch).emit('seatUpdate',{
            'President': {filled:pCount,total: 50},
            'Vice President': {filled:vPCount,total: 50},
        })
        return res.status(201).json({message: "Candidate Added Successfully"});
    }
    catch(err){
        return res.status(500).json({error: `Error adding candidate: ${err},`});
    }
}
export const candidateFetch = async(req,res)=>{
    const role = req.role;
    let user;
    if(role === "student"){
        user = await User.findById(req.UserId);
    }
    else if(role === "admin" || role === "super"){
        user = await adminModel.findById(req.UserId);        
    }
    if(!user){
        return res.status(404).json({error: "User not found"});
    }
    const branch = user.branch;

    // *elections logic:
    const electionDates = await electionDateModel.findOne({branch});
    if(!electionDates){
        return res.status(403).json({error: "No candidates"});
    }
    const nominationEnd = new Date(electionDates.nominationEnd);
    const votingEnd = new Date(electionDates.votingEnd);
    if(!(new Date()<nominationEnd || new Date()>votingEnd)){
        return res.status(403).json({error: "Can't get candidates"});
    }

    // *candidates fetch logic 
    let candidates = await candidateModel.find({branch}).populate("candidateId","username rollno email branch");
    if(!candidates){
        return res.status(404).json({error: "no candidates yet"});
    }
    return res.status(200).json({data: candidates})
}
export const candidateCountFetch = async(req,res)=>{
    const role = req.role; 
    let user;
    if(role === "student"){
        user  = await User.findById(req.UserId);
    }
    else if(role === "admin" || role === "super"){
        user  = await User.findById(req.UserId);
        
    }
    if(!user){
        return res.status(404).json({error: "User does not exists"});
    }
    const presCount = await candidateModel.countDocuments({branch: user.branch,position: "President"});
    const vPCount = await candidateModel.countDocuments({branch: user.branch,position: "Vice President"});
    const data = {
        "President": {
            filled: presCount,
            total: 50,
        },
        "Vice President": {
            filled: vPCount,
            total: 50
        }
    };
    return res.status(200).json({data})
}
export const amICandidate  = async(req,res)=>{
    // well it should be checked when nominationstart>date && votingstart<date
    // i will be getting id from req.UserId
    const role = req.role;
    if(role==="admin" || role==="super"){
        return res.status(200).json({message: false});
    }
    const isCandidate = await candidateModel.exists({candidateId: req.UserId});
    return res.status(200).json({message: !!isCandidate});
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
