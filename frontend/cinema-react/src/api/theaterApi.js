import axiosClient from "./axiosClient";

export const getTheaters = () => {
  return axiosClient.get("/api/theaters");
};

export const getTheaterById = (id) => {
  return axiosClient.get(`/api/theaters/${id}`);
};

export const createTheater = (data) => {
  return axiosClient.post("/api/theaters", data);
};

export const updateTheater = (id, data) => {
  return axiosClient.put(`/api/theaters/${id}`, data);
};

export const deleteTheater = (id) => {
  return axiosClient.delete(`/api/theaters/${id}`);
};