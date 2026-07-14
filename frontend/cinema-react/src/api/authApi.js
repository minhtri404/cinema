import axiosClient from "./axiosClient";

export const loginAdmin = (credentials) => {
  return axiosClient.post("/api/auth/login", credentials);
};

export const loginUser = (credentials) => {
  return axiosClient.post("/api/auth/login", credentials);
};

export const registerUser = (data) => {
  return axiosClient.post("/api/auth/register", data);
};

export const verifyEmail = (token) => {
  return axiosClient.get("/api/auth/verify-email", { params: { token } });
};

export const logoutUser = (refreshToken) => {
  return axiosClient.post("/api/auth/logout", { refreshToken });
};
