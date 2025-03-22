import axios, { AxiosError } from "axios";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_URL || "http://localhost:5000",
  timeout: 15000 // 15 second timeout
});

export default api;

/*
 *  Request Debug
 * @param {any} error
 * @returns {void}
 * @description
 * This function is used to debug the axios response
 */
export function responseDebug(error: AxiosError) {
  if (error?.response) {
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
  } else if (error?.request) {
    console.log(error.request);
  } else {
    console.log("Error", error?.message);
  }
  console.log(error?.config);
}