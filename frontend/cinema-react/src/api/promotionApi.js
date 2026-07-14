import axiosClient from "./axiosClient";
import { uploadImage } from "./mediaApi";

export const getPromotions = () => axiosClient.get("/api/promotions");

export const createPromotion = (data) =>
  axiosClient.post("/api/promotions", data);

export const updatePromotion = (id, data) =>
  axiosClient.put(`/api/promotions/${id}`, data);

export const deletePromotion = (id) =>
  axiosClient.delete(`/api/promotions/${id}`);

export const uploadPromotionImage = (file) => {
  return uploadImage(file, "PROMOTIONS");
};
