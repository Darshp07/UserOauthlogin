
import axios from "axios";

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

const API = axios.create({
  baseURL: `${BACKEND_URL}/api/auth/appUsers`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerUser = async (userData) => {
  const response = await API.post("/register", userData);
  if (response.data?.code === 0) {
    throw new Error(response.data.message || "Registration failed.");
  }
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await API.post("/LogInUser", credentials);
  if (response.data?.code === 0) {
    throw new Error(response.data.message || "Login failed.");
  }

  return response.data?.data || response.data;
};
