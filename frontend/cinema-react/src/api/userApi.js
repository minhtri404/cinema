import axiosClient from "./axiosClient";

export const getCustomers = () => axiosClient.get("/api/users/customers");

export const getUsers = () => axiosClient.get("/api/users");

export const createUser = (data) => axiosClient.post("/api/users", data);

export const updateUser = (id, data) => axiosClient.put(`/api/users/${id}`, data);

export const deleteUser = (id) => axiosClient.delete(`/api/users/${id}`);
