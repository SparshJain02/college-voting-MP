import { createSlice } from "@reduxjs/toolkit";

export const authStateSlice = createSlice({
    name: "authState",
    initialState: {
        value: "signup"
    },
    reducers: {
        signup: (state)=>{
            state.value = "signup"
        },
        login: (state)=>{
            state.value = "login"
        },
    }
})
export const {signup,login} = authStateSlice.actions
export default authStateSlice.reducer