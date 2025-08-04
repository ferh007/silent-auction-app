import axios from "axios";

// Create an axios instance with baseURL from .env
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:5000",
});

// OPTIONAL: Automatically add Firebase token if you integrate Firebase Auth later
// api.interceptors.request.use(async (config) => {
//   const token = await auth.currentUser?.getIdToken();
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

export default api;
