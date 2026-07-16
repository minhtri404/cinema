import { BarcodeFormat, QRCodeWriter } from "@zxing/library";
import { useEffect, useMemo, useState } from "react";
import { getBookingsByUser } from "../../../../api/bookingApi";
import Pagination from "../../../../components/common/Pagination";
import usePagination from "../../../../hooks/usePagination";

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const cleanText = (value, fallback = "—") => {
  const text = String(value || "").trim();
  if (!text) return fallback;

  return text
    .replace(/CGV Cao L\?/gi, "CGV Cao Lỗ")
    .replace(/Cao L\?/gi, "Cao Lỗ")
    .replace(/Ph\?ng/gi, "Phòng")
    .replace(/ph\?ng/gi, "phòng")
    .replace(/R\?p/gi, "Rạp")
    .replace(/r\?p/gi, "rạp")
    .replace(/PhÃ²ng/gi, "Phòng")
    .replace(/Ráº¡p/gi, "Rạp")
    .replace(/Cao Lá»—/gi, "Cao Lỗ")
    .replace(/Ä‘/g, "đ")
    .replace(/â€”/g, "—")
    .replace(/Â·/g, "·")
    .replace(/\s+/g, " ");
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return cleanText(value);

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatShowtime = (booking) => {
  const time = String(booking.startTime || "").slice(0, 5);
  if (!booking.showDate) return time || "—";
  const date = new Date(`${booking.showDate}T${booking.startTime || "00:00"}`);
  if (Number.isNaN(date.getTime())) return `${booking.showDate} ${time}`.trim();
  return formatDateTime(date);
};

const statusLabel = (status) => {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "PAID") return "Đã thanh toán";
  if (normalized === "PENDING") return "Chờ thanh toán";
  if (normalized === "CANCELLED" || normalized === "CANCELED") return "Đã hủy";
  if (normalized === "EXPIRED") return "Hết hạn";
  if (normalized === "HOLD") return "Đang giữ ghế";
  return cleanText(status, "Đang cập nhật");
};

const statusClass = (status) => String(status || "unknown").toLowerCase();

const seatsText = (booking) =>
  (booking.seats || [])
    .map((seat) => cleanText(seat.seatCode, ""))
    .filter(Boolean)
    .join(", ") || "—";

const foodsText = (booking) => {
  const foods = booking.foods || [];
  if (!foods.length) return "—";
  return foods
    .map((food) => `${cleanText(food.foodName, "Combo")} x${food.quantity || 0}`)
    .join(", ");
};

function TicketQr({ value }) {
  const cells = useMemo(() => {
    if (!value) return [];
    try {
      const matrix = new QRCodeWriter().encode(
        String(value),
        BarcodeFormat.QR_CODE,
        128,
        128,
        new Map(),
      );
      const width = matrix.getWidth();
      const height = matrix.getHeight();
      const result = [];

      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          if (matrix.get(x, y)) result.push(`${x},${y}`);
        }
      }

      return result;
    } catch {
      return [];
    }
  }, [value]);

  if (!value) return <div className="history-qr-empty">Chưa có mã vé</div>;
  if (cells.length === 0) return <div className="history-qr-empty">Không tạo được QR</div>;

  return (
    <svg className="history-qr" viewBox="0 0 128 128" role="img" aria-label="QR mã vé">
      <rect width="128" height="128" fill="#ffffff" />
      {cells.map((cell) => {
        const [x, y] = cell.split(",").map(Number);
        return <rect key={cell} x={x} y={y} width="1" height="1" fill="#111827" />;
      })}
    </svg>
  );
}

function ClientTransactionHistory({ auth }) {
  const userId = auth?.userId || auth?.id;
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return undefined;

    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        setLoading(true);
        setError("");
      }
    });

    getBookingsByUser(userId)
      .then((response) => {
        if (!active) return;
        setBookings(
          (response.data || [])
            .slice()
            .sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || ""))),
        );
      })
      .catch(() => {
        if (active) setError("Không tải được lịch sử giao dịch.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const visibleBookings = useMemo(() => (userId ? bookings : []), [bookings, userId]);

  const stats = useMemo(() => {
    const paidBookings = visibleBookings.filter((booking) => String(booking.status || "").toUpperCase() === "PAID");
    return {
      total: visibleBookings.length,
      paid: paidBookings.length,
      amount: paidBookings.reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0),
    };
  }, [visibleBookings]);
  const pagination = usePagination(visibleBookings, 5);

  return (
    <section className="transaction-history">
      <header className="history-header">
        <div>
          <span>Lịch sử giao dịch</span>
          <h2>Vé đã đặt của bạn</h2>
          <p>Thông tin booking, thanh toán, ghế, combo và mã vé sau khi giao dịch hoàn tất.</p>
        </div>
        <div className="history-summary">
          <div><strong>{stats.total}</strong><span>Tổng đơn</span></div>
          <div><strong>{stats.paid}</strong><span>Đã thanh toán</span></div>
          <div><strong>{money(stats.amount)}</strong><span>Tổng chi</span></div>
        </div>
      </header>

      {loading ? (
        <div className="history-state">Đang tải lịch sử giao dịch...</div>
      ) : error ? (
        <div className="history-state error">{error}</div>
      ) : visibleBookings.length === 0 ? (
        <div className="history-state">Bạn chưa có giao dịch nào.</div>
      ) : (
        <div className="history-list">
          {pagination.paginatedItems.map((booking) => (
            <article className="history-card" key={booking.id}>
              <div className="history-main">
                <div>
                  <span className="history-code">{booking.bookingCode || `#${booking.id}`}</span>
                  <h3>{cleanText(booking.movieTitle, "Phim đang cập nhật")}</h3>
                  <p>
                    {cleanText(booking.theaterName, "Rạp")} · {cleanText(booking.roomName, "Phòng")} ·{" "}
                    {formatShowtime(booking)}
                  </p>
                </div>
                <span className={`history-status ${statusClass(booking.status)}`}>
                  {statusLabel(booking.status)}
                </span>
              </div>
              <div className="history-meta-grid">
                <div><span>Ghế</span><strong>{seatsText(booking)}</strong></div>
                <div><span>Combo</span><strong>{foodsText(booking)}</strong></div>
                <div><span>Tổng tiền</span><strong>{money(booking.totalAmount)}</strong></div>
                <div><span>Mã vé</span><strong>{booking.ticket?.ticketCode || "Chưa có"}</strong></div>
              </div>
              <button type="button" onClick={() => setSelectedBooking(booking)}>
                Xem chi tiết
              </button>
            </article>
          ))}
          <Pagination {...pagination} />
        </div>
      )}

      {selectedBooking && (
        <div className="history-modal-overlay" onMouseDown={() => setSelectedBooking(null)}>
          <article className="history-modal" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="history-modal-close" onClick={() => setSelectedBooking(null)}>×</button>
            <div className="history-ticket-preview">
              <div>
                <span>
                  {selectedBooking.showDate
                    ? new Date(`${selectedBooking.showDate}T00:00:00`).toLocaleDateString("vi-VN", { weekday: "long" })
                    : "Rạp chiếu"}
                </span>
                <strong>
                  {selectedBooking.showDate ? formatDateTime(`${selectedBooking.showDate}T00:00:00`).slice(0, 10) : "—"}
                </strong>
              </div>
              <h2>{cleanText(selectedBooking.movieTitle, "Phim đang cập nhật")}</h2>
              <p>{cleanText(selectedBooking.roomName, "Phòng")} · Ghế {seatsText(selectedBooking)}</p>
              <TicketQr value={selectedBooking.ticket?.qrCode || selectedBooking.ticket?.ticketCode || selectedBooking.bookingCode} />
              <small>{selectedBooking.ticket?.ticketCode || selectedBooking.bookingCode}</small>
            </div>

            <div className="history-detail">
              <div className="history-detail-head">
                <span className={`history-status ${statusClass(selectedBooking.status)}`}>
                  {statusLabel(selectedBooking.status)}
                </span>
                <h2>Chi tiết giao dịch</h2>
                <p>{selectedBooking.bookingCode} · {selectedBooking.ticket?.ticketCode || "Chưa có mã vé"}</p>
              </div>
              <div className="history-detail-grid">
                <div><span>Khách hàng</span><strong>{cleanText(selectedBooking.customerName || auth?.fullName)}</strong></div>
                <div><span>Email</span><strong>{cleanText(selectedBooking.customerEmail || auth?.email)}</strong></div>
                <div><span>Phim</span><strong>{cleanText(selectedBooking.movieTitle)}</strong></div>
                <div><span>Suất chiếu</span><strong>{formatShowtime(selectedBooking)}</strong></div>
                <div><span>Rạp</span><strong>{cleanText(selectedBooking.theaterName)}</strong></div>
                <div><span>Phòng</span><strong>{cleanText(selectedBooking.roomName)}</strong></div>
                <div><span>Ghế</span><strong>{seatsText(selectedBooking)}</strong></div>
                <div><span>Đồ ăn</span><strong>{foodsText(selectedBooking)}</strong></div>
                <div><span>Tiền vé</span><strong>{money(selectedBooking.ticketAmount)}</strong></div>
                <div><span>Combo</span><strong>{money(selectedBooking.foodAmount)}</strong></div>
                <div><span>Giảm giá</span><strong>{money(selectedBooking.discountAmount)}</strong></div>
                <div><span>Tổng thanh toán</span><strong>{money(selectedBooking.totalAmount)}</strong></div>
                <div><span>Ngày đặt</span><strong>{formatDateTime(selectedBooking.createdAt)}</strong></div>
                <div><span>Ngày thanh toán</span><strong>{formatDateTime(selectedBooking.paidAt)}</strong></div>
              </div>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}

export default ClientTransactionHistory;
