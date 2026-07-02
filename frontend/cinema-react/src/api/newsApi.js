import axiosClient from "./axiosClient";

export const getNews = () => axiosClient.get("/api/news");

export const createNews = (data) => axiosClient.post("/api/news", data);

export const updateNews = (id, data) =>
  axiosClient.put(`/api/news/${id}`, data);

export const deleteNews = (id) => axiosClient.delete(`/api/news/${id}`);

export const uploadNewsImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return axiosClient.post("/api/uploads/news", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
