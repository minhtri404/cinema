import axiosClient from "./axiosClient";

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
  const formData = new FormData();
  formData.append("file", file);

  return axiosClient.post("/api/uploads/movies", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};