import axiosClient from "./axiosClient";
import { uploadImage } from "./mediaApi";

export const getFoods = () => axiosClient.get("/api/foods");
export const createFood = (data) => axiosClient.post("/api/foods", data);
export const updateFood = (id, data) => axiosClient.put(`/api/foods/${id}`, data);
export const updateFoodStock = (id, quantity) =>
  axiosClient.patch(`/api/foods/${id}/stock?quantity=${quantity}`);
export const deleteFood = (id) => axiosClient.delete(`/api/foods/${id}`);

export const uploadFoodImage = (file) => uploadImage(file, "FOODS");

export const uploadComboImage = (file) => uploadImage(file, "COMBOS");
