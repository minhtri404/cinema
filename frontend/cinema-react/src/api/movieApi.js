import axiosClient from "./axiosClient";

export const getMovies = () => {
  return axiosClient.get("/api/movies");
};

export const createMovie = (data) => {
  return axiosClient.post("/api/movies", data);
};

export const deleteMovie = (id) => {
  return axiosClient.delete(`/api/movies/${id}`);
};