import axiosClient from "./axiosClient";

export const getEvents = () => axiosClient.get("/api/events");

export const createEvent = (data) => axiosClient.post("/api/events", data);

export const updateEvent = (id, data) =>
  axiosClient.put(`/api/events/${id}`, data);

export const deleteEvent = (id) => axiosClient.delete(`/api/events/${id}`);

export const uploadEventImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return axiosClient.post("/api/uploads/events", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
