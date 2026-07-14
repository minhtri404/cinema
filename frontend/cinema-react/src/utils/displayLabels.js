const labelFrom = (labels, value, fallback = "Không xác định") => {
  const key = String(value || "").trim().toUpperCase();
  return labels[key] || value || fallback;
};

export const movieStatusLabel = (value) =>
  labelFrom(
    {
      NOW_SHOWING: "Đang chiếu",
      COMING_SOON: "Sắp chiếu",
      STOPPED: "Ngừng chiếu",
      ACTIVE: "Đang chiếu",
      INACTIVE: "Ngừng chiếu",
    },
    value,
  );

export const activityStatusLabel = (value) =>
  labelFrom(
    {
      ACTIVE: "Đang hoạt động",
      INACTIVE: "Ngừng hoạt động",
    },
    value,
  );

export const theaterStatusLabel = (value) =>
  labelFrom(
    {
      ONLINE: "Đang hoạt động",
      OFFLINE: "Tạm ngừng",
    },
    value,
  );

export const publicationStatusLabel = (value) =>
  labelFrom(
    {
      ONLINE: "Đang hiển thị",
      OFFLINE: "Đang ẩn",
    },
    value,
  );

export const showtimeStatusLabel = (value) =>
  labelFrom(
    {
      ONLINE: "Đang mở bán",
      SOLD_OUT: "Hết vé",
      CANCELLED: "Đã hủy",
      OFFLINE: "Tạm ngừng",
    },
    value,
  );

export const eventStatusLabel = (value) =>
  labelFrom(
    {
      ONLINE: "Mua trực tuyến",
      OFFLINE: "Mua tại quầy",
      EXPIRED: "Hết hạn",
    },
    value,
  );

export const promotionStatusLabel = (value) =>
  labelFrom(
    {
      ONLINE: "Đang áp dụng",
      OFFLINE: "Tạm ngừng",
      EXPIRED: "Hết hạn",
    },
    value,
  );

export const seatTypeLabel = (value) =>
  labelFrom(
    {
      STANDARD: "Ghế thường",
      VIP: "Ghế VIP",
      COUPLE: "Ghế đôi",
    },
    value,
  );
