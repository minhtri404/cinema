import axiosClient from "./axiosClient";

export const getBookings = () => axiosClient.get("/api/bookings/tickets");

export const cancelBooking = (id) => axiosClient.put(`/api/bookings/${id}/cancel`);

export const useTicket = (id) => axiosClient.put(`/api/bookings/${id}/use-ticket`);

export const payBooking = (id, data = {}) => axiosClient.put(`/api/bookings/${id}/pay`, data);
