import axios from "axios";

// Configure axios defaults
axios.defaults.baseURL = "http://localhost:5001"; // Update this to match your backend port
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.withCredentials = true; // Important for CORS with credentials

// Add a request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    console.log("Request being sent:", config);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    console.log("Response received:", response);
    return response;
  },
  (error) => {
    console.error("Response error:", error);
    return Promise.reject(error);
  }
);

export default axios;
