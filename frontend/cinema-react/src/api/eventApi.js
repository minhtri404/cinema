import axiosClient from "./axiosClient";
import { uploadImage } from "./mediaApi";

export const getEvents = () => axiosClient.get("/api/events");

export const createEvent = (data) => axiosClient.post("/api/events", data);

export const updateEvent = (id, data) =>
  axiosClient.put(`/api/events/${id}`, data);

export const deleteEvent = (id) => axiosClient.delete(`/api/events/${id}`);

export const uploadEventImage = (file) => {
  return uploadImage(file, "EVENTS");
};
