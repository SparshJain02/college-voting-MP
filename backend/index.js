import express from "express"
import { ENV } from "./env.js";
import mongoose from "mongoose";
import cors from "cors"
import passport from "./config/passport.js";
import session from "express-session";
import userRouter from "./routes/user.js";
import cookieParser from "cookie-parser";


// ! remove status code and write like "pending" , "rejected", "unauthorized"
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}))
passport.initialize();

// app.use(session({
//     secret: ENV.JWT_SECRET,
//     resave: false,
//     saveUninitialized: false
// }))
app.use(cookieParser());

const allowedOrigins = ["http://localhost:5173"]

app.use(cors(({
    origin: allowedOrigins,
    credentials: true,
    methods: ["POST,GET,DELETE,PATCH"]
})))

async function connectDbAndServer(){
    try{

        mongoose.connect(ENV.MONGO_URL)
        .then(()=>{
            console.log("Db connected Successfully!");
        })
        .catch(err=>{
            console.log("Error connecting Db!",err.reason);
        })
        app.listen(ENV.PORT,()=>{
            console.log("Server Started!");
        })
    }
    catch(err){
        console.log("Error in connecting db & server")
    }
}
connectDbAndServer();

app.use("/auth",userRouter)