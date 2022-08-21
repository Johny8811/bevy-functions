import axios, { AxiosRequestHeaders, Method } from "axios";

export type Params = {
  url: string,
  headers?: AxiosRequestHeaders,
  method?: Method,
  body?: any,
}

export const fetchApi = async ({
  url,
  method = "get",
  headers,
  body,
}: Params) => {
  switch (method) {
    case "get": {
      return await axios.get(url, { method, headers })
          .then(({ data }) => data);
    }
    case "post": {
      return await axios.post(url, { method, headers, body })
          .then(({ data }) => data);
    }
    default: {
      return new Promise((resolve, reject) => {
        reject(new Error("Method has to be set."));
      });
    }
  }
};
