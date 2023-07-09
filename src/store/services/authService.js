import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

const authService = createApi({
    reducerPath: 'auth',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://a8c0fed7f13334e3c98534becdae912f-2084228010.ap-south-1.elb.amazonaws.com/api/'
    }),
    endpoints: (builder) => {
       return {
           authLogin: builder.mutation({
               query: (loginData) => {
                   return {
                       url: 'login',
                       method: 'POST',
                       body: loginData
                   }
               }
           }),
           userRegister: builder.mutation({
            query: data => {
                return {
                    url: '/register',
                    method: 'POST',
                    body: data
                }
            }
           }),
           userLogin: builder.mutation({
            query: loginData => {
                return {
                    url: '/login',
                    method: 'POST',
                    body: loginData
                }
            }
           })
       }
    }
});
export const {useAuthLoginMutation, useUserRegisterMutation, useUserLoginMutation} = authService
export default authService