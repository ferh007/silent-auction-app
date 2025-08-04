import axios from "axios";
import { getAuth } from "firebase/auth";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

// Inject Firebase token
api.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
