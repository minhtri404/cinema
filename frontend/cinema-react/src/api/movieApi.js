import axiosClient from "./axiosClient";
import { uploadImage } from "./mediaApi";

export const getMovies = () => {
  return axiosClient.get("/api/movies");
};

export const createMovie = (data) => {
  return axiosClient.post("/api/movies", data);
};
export const getMovieById = (id) => {
  return axiosClient.get(`/api/movies/${id}`);
};

export const updateMovie = (id, data) => {
  return axiosClient.put(`/api/movies/${id}`, data);
};
export const deleteMovie = (id) => {
  return axiosClient.delete(`/api/movies/${id}`);
};
export const uploadMoviePoster = (file) => {
  return uploadImage(file, "MOVIES");
};
