import { axiosInstance } from "../lib/axios.js";


export const auth = {
    signup: async(data)=>{
        const response = await axiosInstance.post("/auth/signup",data)
        return response.data;
    },
    login: async(data)=>{
        const response = await axiosInstance.post("/auth/login",data);
        return response.data;
    },
    tokenRefetch: async()=>{
        const res = await axiosInstance.post("/auth/refetchToken");
        return res.data;
    },
    course: async()=>{
        const response = await axiosInstance.post("/auth/course");
        return response.data;
    },
}