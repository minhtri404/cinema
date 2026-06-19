import axiosClient from "./axiosClient";

export const getRooms = () => {
  return axiosClient.get("/api/rooms");
};

export const getRoomsByTheater = (theaterId) => {
  return axiosClient.get(`/api/rooms?theaterId=${theaterId}`);
};

export const getRoomById = (id) => {
  return axiosClient.get(`/api/rooms/${id}`);
};

export const createRoom = (data) => {
  return axiosClient.post("/api/rooms", data);
};

export const updateRoom = (id, data) => {
  return axiosClient.put(`/api/rooms/${id}`, data);
};

export const deleteRoom = (id) => {
  return axiosClient.delete(`/api/rooms/${id}`);
};