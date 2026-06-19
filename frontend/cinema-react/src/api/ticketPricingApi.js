import axiosClient from "./axiosClient";

export const getTicketPricing = () => {
  return axiosClient.get("/api/ticket-pricing");
};

export const updateTicketPricing = (id, data) => {
  return axiosClient.put(`/api/ticket-pricing/${id}`, data);
};

export const getTicketSurcharges = () => {
  return axiosClient.get("/api/ticket-surcharges");
};

export const updateTicketSurcharge = (id, data) => {
  return axiosClient.put(`/api/ticket-surcharges/${id}`, data);
};