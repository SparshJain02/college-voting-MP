import {  useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { auth } from "../../api/auth.js";
export const useSignupUser = ()=>{
    const result = useMutation({
        mutationKey: ["useSignupUser"],
        mutationFn: auth.signup
    })
    return result;
}
export const useLoginUser = ()=>{
    const result = useMutation({
        mutationKey: ["useLoginUser"],
        mutationFn: auth.login
    })
    return result;
}
export const useRefetchToken = ()=>{
    const result = useMutation({
        mutationKey: ["refetchToken"],
        mutationFn: auth.tokenRefetch
    })
    return result
}
export const useCourse = ()=>{
    const result = useMutation({
        mutationKey: ["useCourse"],
        mutationFn: auth.course,
    })
    return result;
}
