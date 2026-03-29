import { ENV } from "../env.js"

export const getCookieOption = (type) =>{
    const isProd = ENV.DEVELOPMENT=="production";
    const base = {
        httpOnly: true,
        secure: isProd?true:false,
        sameSite: false,
    }
    if(type === "access"){
        return {...base,maxAge:15*60*1000};
    }
    else if(type === "refresh"){
        return {...base , maxAge: 3*24*60*60*1000}
    }
}