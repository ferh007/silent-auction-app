import axios from "axios";
import { getAuth } from "firebase/auth";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Inject Firebase token
api.interceptors.request.use(async (config) => {
  const auth = getAuth();
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
