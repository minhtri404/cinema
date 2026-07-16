import axiosClient from "./axiosClient";
import { uploadImage } from "./mediaApi";

export const getAdvertisements = () => axiosClient.get("/api/advertisements");

export const createAdvertisement = (data) =>
  axiosClient.post("/api/advertisements", data);

export const updateAdvertisement = (id, data) =>
  axiosClient.put(`/api/advertisements/${id}`, data);

export const deleteAdvertisement = (id) =>
  axiosClient.delete(`/api/advertisements/${id}`);

export const uploadAdvertisementImage = (file) =>
  uploadImage(file, "ADVERTISEMENTS");
