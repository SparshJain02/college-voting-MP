import express from "express"
import { ENV } from "./env.js";
import mongoose from "mongoose";
import cors from "cors"
import passport from "./config/passport.js";
import session from "express-session";
import userRouter from "./routes/user.js";
import adminRouter from "./routes/admin.js";
import candidateRouter from "./routes/vote.js";
import cookieParser from "cookie-parser";
import http from "http"
import { Server } from "socket.io";

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}))
passport.initialize();

const server = http.createServer(app);
app.use(cookieParser());

const allowedOrigins = ["http://localhost:5173"]

app.use(cors(({
    origin: allowedOrigins,
    credentials: true,
    methods: ["POST,GET,DELETE,PUT"]
})))

const io = new Server(server,{
    cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ["POST,GET,DELETE,PUT"] 
    }
})

app.set('io',io);

io.on('connection', (socket) => {
    const branch = socket.handshake.auth.branch;
    if(branch){
        socket.join(`${branch}`);
        console.log(`Socket with ${socket.id} joined ${branch}`);
    }
  
  socket.on('disconnect', () => {
    console.log('Student disconnected:', socket.id);
  });
});

async function connectDbAndServer() {
    try {
        await mongoose.connect(ENV.MONGO_URL);
        console.log("Db connected Successfully!");
        server.listen(ENV.PORT, () => {
            console.log(`Server Started on port ${ENV.PORT}!`);
        });
    } catch (err) {
        console.log("Error in connecting db & server:", err.message);
    }
}

connectDbAndServer();

app.use("/auth",userRouter)
app.use("/admin",adminRouter)
app.use("/candidate",candidateRouter)