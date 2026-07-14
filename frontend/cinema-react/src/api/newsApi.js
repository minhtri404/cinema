import axiosClient from "./axiosClient";
import { uploadImage } from "./mediaApi";

export const getNews = () => axiosClient.get("/api/news");

export const createNews = (data) => axiosClient.post("/api/news", data);

export const updateNews = (id, data) =>
  axiosClient.put(`/api/news/${id}`, data);

export const deleteNews = (id) => axiosClient.delete(`/api/news/${id}`);

export const uploadNewsImage = (file) => {
  return uploadImage(file, "NEWS");
};
