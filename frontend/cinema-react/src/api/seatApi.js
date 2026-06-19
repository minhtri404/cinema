import axiosClient from "./axiosClient";

export const getSeatsByRoom = (roomId) => {
  return axiosClient.get(`/api/seats/room/${roomId}`);
};

export const generateSeats = (roomId, rowCount, columnCount) => {
  return axiosClient.post(
    `/api/seats/generate?roomId=${roomId}&rowCount=${rowCount}&columnCount=${columnCount}`
  );
};

export const updateSeat = (id, data) => {
  return axiosClient.put(`/api/seats/${id}`, data);
};