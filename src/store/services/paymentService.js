import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const paymentService = createApi({
  reducerPath: "payment",
  baseQuery: fetchBaseQuery({
    baseUrl: "a1188382a7467456694b3b4427a216b1-700100809.ap-south-1.elb.amazonaws.com",
    prepareHeaders: (headers, { getState }) => {
      const reducers = getState();
      const token = reducers?.authReducer?.userToken;
      headers.set("authorization", token ? `Bearer ${token}` : "");
      return headers;
    },
  }),
  endpoints: (builder) => {
    return {
      sendPayment: builder.mutation({
        query: (cart) => {
          return {
            url: "/create-checkout-session",
            method: "POST",
            body: cart,
          };
        },
      }),
      webhookPayment: builder.mutation({
        query: (cart) => {
          return {
            url: "/webhook",
            method: "POST",
            body: cart,
          };
        },
      }),
      verifyPayment: builder.query({
        query: (id) => {
          return {
            url: `verify-payment/${id}`,
            method: "GET",
          };
        },
      }),
    };
  },
});
export const { useSendPaymentMutation,webhookPayment, useVerifyPaymentQuery } = paymentService;
export default paymentService;
