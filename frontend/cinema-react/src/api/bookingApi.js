import axiosClient from "./axiosClient";

export const getBookings = () => axiosClient.get("/api/bookings");

export const getBookingById = (id) => axiosClient.get(`/api/bookings/${id}`);

export const markBookingPaid = (id) =>
  axiosClient.put(`/api/bookings/${id}/pay`);

export const cancelBooking = (id) =>
  axiosClient.put(`/api/bookings/${id}/cancel`);

export const getBookedSeats = (showtimeId) =>
  axiosClient.get(`/api/bookings/showtime/${showtimeId}/booked-seats`);

export const getBookedSeatDetails = (showtimeId) =>
  axiosClient.get(`/api/bookings/showtime/${showtimeId}/booked-seat-details`);

export const deleteBooking = (id) => axiosClient.delete(`/api/bookings/${id}`);
