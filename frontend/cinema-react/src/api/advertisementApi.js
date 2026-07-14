import axiosClient from "./axiosClient";

export const getAdvertisements = () => axiosClient.get("/api/advertisements");

export const createAdvertisement = (data) =>
  axiosClient.post("/api/advertisements", data);

export const updateAdvertisement = (id, data) =>
  axiosClient.put(`/api/advertisements/${id}`, data);

export const deleteAdvertisement = (id) =>
  axiosClient.delete(`/api/advertisements/${id}`);

export const uploadAdvertisementImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return axiosClient.post("/api/uploads/advertisements", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
