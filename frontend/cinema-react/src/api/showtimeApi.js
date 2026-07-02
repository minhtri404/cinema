import axiosClient from "./axiosClient";

export const getShowtimes = (filters = {}) => {
  const params = {};

  if (filters.theaterId) params.theaterId = filters.theaterId;
  if (filters.showDate) params.showDate = filters.showDate;

  return axiosClient.get("/api/showtimes", { params });
};

export const getShowtimeById = (id) => {
  return axiosClient.get(`/api/showtimes/${id}`);
};

export const createShowtime = (data) => {
  return axiosClient.post("/api/showtimes", data);
};

export const updateShowtime = (id, data) => {
  return axiosClient.put(`/api/showtimes/${id}`, data);
};

export const deleteShowtime = (id) => {
  return axiosClient.delete(`/api/showtimes/${id}`);
};
