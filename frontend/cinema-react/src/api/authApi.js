import axiosClient from "./axiosClient";

export const loginAdmin = (credentials) => {
  return axiosClient.post("/api/auth/login", credentials);
};
