import axiosClient from "../../../api/axiosClient";

export const loginAdmin = (credentials) => {
  return axiosClient.post("/api/auth/login", credentials);
};
