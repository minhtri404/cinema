import axiosClient from "./axiosClient";

export const getPromotions = () => axiosClient.get("/api/promotions");

export const createPromotion = (data) =>
  axiosClient.post("/api/promotions", data);

export const updatePromotion = (id, data) =>
  axiosClient.put(`/api/promotions/${id}`, data);

export const deletePromotion = (id) =>
  axiosClient.delete(`/api/promotions/${id}`);

export const uploadPromotionImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return axiosClient.post("/api/uploads/promotions", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
