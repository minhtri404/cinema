import axiosClient from "./axiosClient";

export const getFoods = () => axiosClient.get("/api/foods");
export const createFood = (data) => axiosClient.post("/api/foods", data);
export const updateFood = (id, data) => axiosClient.put(`/api/foods/${id}`, data);
export const updateFoodStock = (id, quantity) =>
  axiosClient.patch(`/api/foods/${id}/stock?quantity=${quantity}`);
export const deleteFood = (id) => axiosClient.delete(`/api/foods/${id}`);

export const uploadFoodImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return axiosClient.post("/api/uploads/foods", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const uploadComboImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return axiosClient.post("/api/uploads/combos", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
