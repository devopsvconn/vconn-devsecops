import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const homeProducts = createApi({
  reducerPath: "homeProducts",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://a8c0fed7f13334e3c98534becdae912f-2084228010.ap-south-1.elb.amazonaws.com/api/",
  }),
  endpoints: (builder) => {
    return {
      catProducts: builder.query({
        query: (params) => {
          return {
            url: `cat-products/${params.name}/${params.page}`,
            method: "GET",
          };
        },
      }),
      searchProducts: builder.query({
        query: (params) => {
          return {
            url: `search-products/${params.keyword}/${params.page}`,
            method: "GET",
          };
        },
      }),
    };
  },
});
export const { useCatProductsQuery, useSearchProductsQuery } = homeProducts;
export default homeProducts;
