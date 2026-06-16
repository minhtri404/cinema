import axiosClient from "./axiosClient";

export const getGenres = () => {
  return axiosClient.get("/api/genres");
};

export const getGenreById = (id) => {
  return axiosClient.get(`/api/genres/${id}`);
};

export const createGenre = (data) => {
  return axiosClient.post("/api/genres", data);
};

export const updateGenre = (id, data) => {
  return axiosClient.put(`/api/genres/${id}`, data);
};

export const deleteGenre = (id) => {
  return axiosClient.delete(`/api/genres/${id}`);
};