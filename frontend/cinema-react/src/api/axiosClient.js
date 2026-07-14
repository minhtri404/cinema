import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  try {
    const auth = JSON.parse(localStorage.getItem("auth") || "{}");
    const token = auth.accessToken || auth.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    localStorage.removeItem("auth");
  }

  return config;
});

export default axiosClient;
