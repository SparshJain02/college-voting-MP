import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { User } from "../models/user.js";
import bcrypt from "bcrypt"
passport.use(new LocalStrategy(
    {usernameField: "email"}, async(username, password , done) =>{
        const user = await User.findOne({email: username});
        if(!user){
            return done(null,false,{message: "user not found"})
        }
        const match = await bcrypt.compare(password,user.password);
        if(!match){
            return done(null, false, {message: "username or password incorrect"})
        }
        done(null,user);
    }
))
passport.serializeUser((user,done)=>{
    if(user === null){
        print('yo')
        return done(null,false,{message: "user not found"})
    }
    done(null,user.id);  
})
passport.deserializeUser(async(id,done)=>{
    try{
        const user = await User.findById(id);
        done(null,user)
    }
    catch(err){
        done(err);
    }
})
export default passport