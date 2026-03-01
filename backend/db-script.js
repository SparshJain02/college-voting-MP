import { ENV } from "./env.js";
import { User } from "./models/user.js";
import mongoose from "mongoose";
const obj = {
    email: "test@gmail.com",
    password: "test"
};

async function testDb(){
    mongoose.connect(ENV.MONGO_URL)
    .then(()=>{
        console.log("db connected");
    })
    .catch(err=>{
        console.log("error connecting db: ",err);
    })
    const user = new User(obj);
    await user.save();
}
testDb()
.then(()=>{
    console.log("test executed successfully!");
})
.catch(err=>{
    console.log("error executing db tests",err);
})