import axiosClient from "./axiosClient";

export const getBookings = () => axiosClient.get("/api/bookings");

export const getBookingsByUser = (userId) =>
  axiosClient.get(`/api/bookings/user/${userId}`);

export const createBooking = (data) => axiosClient.post("/api/bookings", data);

export const holdBookingSeats = (data) => axiosClient.post("/api/bookings/holds", data);

export const getBookingById = (id) => axiosClient.get(`/api/bookings/${id}`);

export const markBookingPaid = (id) =>
  axiosClient.put(`/api/bookings/${id}/pay`);

export const payBooking = (id, data = {}) =>
  axiosClient.put(`/api/bookings/${id}/pay`, data);

export const cancelBooking = (id) =>
  axiosClient.put(`/api/bookings/${id}/cancel`);

export const getBookedSeats = (showtimeId) =>
  axiosClient.get(`/api/bookings/showtime/${showtimeId}/booked-seats`);

export const getSeatLocks = (showtimeId) =>
  axiosClient.get(`/api/bookings/showtime/${showtimeId}/seat-locks`);

export const getBookedSeatDetails = (showtimeId) =>
  axiosClient.get(`/api/bookings/showtime/${showtimeId}/booked-seat-details`);

export const deleteBooking = (id) => axiosClient.delete(`/api/bookings/${id}`);

export const useTicket = (id) =>
  axiosClient.put(`/api/bookings/${id}/use-ticket`);
