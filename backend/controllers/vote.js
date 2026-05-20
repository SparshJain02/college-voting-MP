import mongoose from "mongoose";
import adminModel from "../models/admin.js";
import candidateModel, { electionDateModel } from "../models/elections.js";
import { User } from "../models/user.js";
import voterModel from "../models/voter.js";

export const addCandidate = async (req, res) => {
    try {
        // * validations 
        const role = req.role;
        if (role !== "student") {
            return res.status(403).json({ error: "Only students are eligible" });
        }
        const { position, slogan } = req.body;
        if (!(position === "President" || position === "Vice President")) {
            return res.status(403).json({ error: "Invalid position" });
        }
        const { UserId } = req;
        const user = await User.findById(UserId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // *checking whether elections are going on or not
        const electionDates = await electionDateModel.findOne({ branch: user.branch });
        if (!electionDates) return res.status(403).json({ error: "no elections yet" });
        const currDate = new Date();
        const nominationStart = new Date(electionDates.nominationStart);
        const nominationEnd = new Date(electionDates.nominationEnd);
        if (!(currDate >= nominationStart && currDate <= nominationEnd)) {
            return res.status(403).json({ error: `You cannot apply yet!` });
        }

        // *logic to add candidate 
        const isCandidate = await candidateModel.findOne({ candidateId: user._id, });
        if (isCandidate) {
            return res.status(409).json({ error: "You have already applied" });
        }
        const posCount = await candidateModel.countDocuments({ position });
        if (!posCount >= 50) {
            return res.status(403).json({ error: "Seats are full" });
        }
        await candidateModel.create({ position, candidateId: user._id, branch: user.branch, slogan });

        const pCount = await candidateModel.countDocuments({ position: "President", branch: user.branch });
        const vPCount = await candidateModel.countDocuments({ position: "Vice President", branch: user.branch });

        // setting up socket
        const io = req.app.get('io');
        io.to(user.branch).emit('seatUpdate', {
            'President': { filled: pCount, total: 50 },
            'Vice President': { filled: vPCount, total: 50 },
        })
        return res.status(201).json({ message: "Candidate Added Successfully" });
    }
    catch (err) {
        return res.status(500).json({ error: `Error adding candidate: ${err},` });
    }
}
export const updateCandidates = async (req, res) => {
    // this operation can only be done by admin
    const role = req.role;
    if (role !== "admin") {
        return res.status(403).json({ error: "only admin can update" });
    }
    // i will recieve a object 
    const { updatedList } = req.body;

    if (!updatedList && Object.keys(updatedList).length === 0) {
        return res.status(404).json({ error: "No data to update" });
    }

    // this will be object 
    let bulkWrite = [];
    for (const [key, value] of Object.entries(updatedList)) {
        bulkWrite.push({
            updateOne: {
                filter: { _id: key },
                update: { $set: { status: value } }
            }
        });
    }
    console.log(bulkWrite);
    const bulkUpdate = await candidateModel.bulkWrite(bulkWrite);
    return res.status(200).json({ message: "Updated Successfully" });
}
export const candidateFetch = async (req, res) => {
    const role = req.role;

    let user;
    if (role === "student") {
        user = await User.findById(req.UserId);
    }
    else if (role === "admin" || role === "super") {
        user = await adminModel.findById(req.UserId);
    }
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    const branch = user.branch;
    const { page, limit, status, position } = req.query;
    const skip = (page - 1) * limit;
    // *elections logic:
    const electionDates = await electionDateModel.findOne({ branch });
    if (!electionDates) {
        return res.status(403).json({ error: "No candidates" });
    }
    const nominationEnd = new Date(electionDates.nominationEnd);
    const votingEnd = new Date(electionDates.votingEnd);
    if ((new Date() < nominationEnd || new Date() > votingEnd)) {
        return res.status(403).json({ error: "Can't get candidates" });
    }

    // *candidates fetch logic 
    let candidates = [{}];
    if (position === "all") {
        candidates = await candidateModel.find({ branch, status }).populate("candidateId", "username rollno email slogan").limit(limit).skip(skip).sort({ createdAt: 1 });
    }
    else {
        candidates = await candidateModel.find({ branch, status, position }).populate("candidateId", "username rollno email slogan").limit(limit).skip(skip).sort({ createdAt: 1 });
    }
    if (!candidates) {
        return res.status(404).json({ error: "no candidates yet" });
    }
    const totalDocs = await candidateModel.countDocuments({ branch });
    const totalPages = Math.ceil(totalDocs / limit);
    return res.status(200).json({
        data: {
            candidates,
            totalPages
        }
    })
}
export const candidateCountFetch = async (req, res) => {
    const role = req.role;
    let user;
    if (role === "student") {
        user = await User.findById(req.UserId);
    }
    else if (role === "admin" || role === "super") {
        user = await User.findById(req.UserId);

    }
    if (!user) {
        return res.status(404).json({ error: "User does not exists" });
    }
    const presCount = await candidateModel.countDocuments({ branch: user.branch, position: "President" });
    const vPCount = await candidateModel.countDocuments({ branch: user.branch, position: "Vice President" });
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
    return res.status(200).json({ data })
}
export const amICandidate = async (req, res) => {
    // well it should be checked when nominationstart>date && votingstart<date
    // i will be getting id from req.UserId
    const role = req.role;
    if (role === "admin" || role === "super") {
        return res.status(200).json({ message: false });
    }
    const isCandidate = await candidateModel.exists({ candidateId: req.UserId });
    return res.status(200).json({ message: !!isCandidate });
}
// export const addVoters = async (req, res) => {
//     try {
//         // find if user exists
//         const { candidateId } = req.body;
//         const user = await User.findById(req.UserId);
//         if (!user) {
//             return res.status(401).json({ message: "Unauthorized" });
//         }

//         // we have to make sure that user is not candidate
//         const isCandidate = await candidateModel.find({ branch: user.branch, applications: { $in: [user._id] } });
//         if (isCandidate.length !== 0) {
//             return res.status(403).json({ message: "Candidates can't vote" });
//         }
//         // if candidate exist then update if not then create 
//         const votedObj = await voterModel.findOne({ votedFor: candidateId });
//         if (!votedObj) {
//             await voterModel.create({ votedFor: candidateId, whoVoted: req.UserId });
//             return res.status(201).json({ message: "Vote added Successfully" });
//         }
//         await voterModel.updateOne({ votedFor: candidateId }, { $push: { whoVoted: req.UserId } })
//         return res.status(201).json({ message: "Vote added Successfully" });
//     }
//     catch (err) {
//         return res.status(500).json({ message: "err: ", err });
//     }

// }

export const submitVote = async (req, res) => {
    // only vote if election exists
    // only vote if date>=votingStart and date<=votingEnd
    // vote if candidate exists
    // post request
    // only vote if not voted

    // xp , vp , z user vote , cal(xpCount,vpCount) send , frontend it could be possible that xp and yp exists or it can be possible they don't exists , so let's do one thing i have id of both of them i will count the documents and i will find one and the populate it and fetch all the details 

    // checking if voted
    const role = req.role;

    let user;
    if(role === "student"){
         user = await User.findById(req.UserId);
    }
    else{
        user = await adminModel.findById(req.UserId);
    }
    if (user && user.hasVoted) {
        return res.status(403).json({ error: "You cannot vote again!" });
    }



    // finding candidate
    const { presidentId, vicePresidentId } = req.body;
    const president = await candidateModel.findById(presidentId);
    const vicePresident = await candidateModel.findById(vicePresidentId);

    if (!president || !vicePresident || president.status != "Approved" || vicePresident.status != "Approved") {
        return res.status(403).json({ error: "Candidate not exists or approved" });
    }

    const branch = user.branch;

    // checking elections
    const elections = await electionDateModel.findOne({ branch });
    if (!elections) {
        return res.status(403).json({ error: "Cannot vote without elections" });
    }
    const currDate = new Date();
    if (!(currDate >= elections.votingStart && currDate <= elections.votingEnd)) {
        return res.status(403).json({ error: "You can only vote in election period" });
    }

    const voterCollection = [
        {
            candidateId: presidentId,
            branch
        },
        {
            candidateId: vicePresidentId,
            branch
        }
    ];
    const result = await voterModel.insertMany(voterCollection);
        user.hasVoted = true;
        await user.save();

    const presidentVotesCount = await voterModel.countDocuments({candidateId: presidentId});
    const vicePresidentVoteCount = await voterModel.countDocuments({candidateId: vicePresidentId});
    const presidentData = await candidateModel.findById(presidentId).populate("candidateId","username email");
    const vicePresidentData = await candidateModel.findById(vicePresidentId).populate("candidateId","username email")
    console.log(presidentData,presidentVotesCount,vicePresidentVoteCount);
    
    const io = req.app.get('io');
    io.to(branch).emit('liveCandidates',[
        {
            _id: presidentData._id,
            votes: presidentVotesCount,
            username: presidentData.candidateId.username,
            email: presidentData.candidateId.email,
            position: "President"
        },
        {
            _id:vicePresidentData._id,
            votes: vicePresidentVoteCount,
            username: vicePresident.candidateId.username,
            email: vicePresident.candidateId.email,
            position: "Vice President"
        }
    ])


    return res.status(201).json({ message: "Vote Successfully" });
}

export const getVotedCandidates = async (req, res) => {
    // this will bet get request 
    // can only get this details when votings are live 
    // our structure should be
    // [{_id,name,email,position,votes}]
    const { branch } = req.query;
    if (!branch) {
        return res.status(404).json({ error: "No branch " });
    }
    const electionDates = await electionDateModel.findOne({ branch });
    if (!electionDates) {
        return res.status(404).json({ error: "There are no elections" });
    }

    const result = await voterModel.aggregate([
        {
            $match: {
                branch
            }
        },
        {
            $group: {
                _id: '$candidateId',
                votes: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: 'candidates',
                localField: "_id", // hold candidate id
                foreignField: "_id", // candidate id 
                pipeline: [
                    {
                        $project: {
                            // contains candidate fields 
                            position: 1,
                            candidateId: 1 // represents user id (naming convention is bad)
                        }
                    },
                ],
                as: "candidate"
                
            }
        },
        {
            $unwind: "$candidate"
        },
        {
            $lookup: {
                from: "users",
                localField: "candidate.candidateId",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            email: 1
                        }
                    }
                ],
                as: "user",
            }
        },
        {
            $unwind: "$user"
        },
        // clean up
        {
            $project: {
                _id: 1, // candidateId
                position: "$candidate.position",
                votes: 1,
                username: "$user.username",
                email: "$user.email",
            }
        }
    ])
    return res.status(200).json({data: result});
}
