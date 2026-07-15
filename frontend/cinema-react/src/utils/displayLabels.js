const labelFrom = (labels, value, fallback = "Không xác định") => {
  const key = String(value || "").trim().toUpperCase();
  return labels[key] || value || fallback;
};

export const movieStatusLabel = (value) =>
  labelFrom(
    {
      NOW_SHOWING: "Đang chiếu",
      COMING_SOON: "Sắp chiếu",
      ADVANCE_BOOKING: "Vé bán trước",
      PRE_SALE: "Vé bán trước",
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

export const inventoryStatusLabel = (value) =>
  labelFrom(
    {
      ACTIVE: "Đang bán",
      INACTIVE: "Ngừng bán",
      OUT_OF_STOCK: "Hết hàng",
    },
    value,
  );

export const foodCategoryLabel = (value) =>
  labelFrom(
    {
      POPCORN: "Bắp",
      DRINK: "Nước",
      COMBO: "Combo",
      SNACK: "Đồ ăn nhẹ",
      OTHER: "Khác",
    },
    value,
  );

export const foodSizeLabel = (value) =>
  labelFrom({ NONE: "Không áp dụng", S: "S", M: "M", L: "L", XL: "XL" }, value);

export const ticketStatusLabel = (value) =>
  labelFrom(
    {
      VALID: "Hợp lệ",
      USED: "Đã sử dụng",
      CANCELLED: "Đã hủy",
      EXPIRED: "Hết hạn",
      UNKNOWN: "Không xác định",
    },
    value,
  );

export const bookingStatusLabel = (value) =>
  labelFrom(
    {
      PENDING: "Chờ thanh toán",
      PAID: "Đã thanh toán",
      CANCELLED: "Đã hủy",
      CANCELED: "Đã hủy",
      EXPIRED: "Hết hạn",
    },
    value,
  );
