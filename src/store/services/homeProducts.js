import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const homeProducts = createApi({
  reducerPath: "homeProducts",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://saad-env.eba-b8ntatks.ap-south-1.elasticbeanstalk.com/api/",
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
