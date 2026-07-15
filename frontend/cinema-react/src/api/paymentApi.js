import axiosClient from "./axiosClient";

export const createVnpayPayment = (data) =>
  axiosClient.post("/api/payments/vnpay/create", data);

export const confirmVnpayReturn = (params) =>
  axiosClient.get("/api/payments/vnpay/return", { params });
