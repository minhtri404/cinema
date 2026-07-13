import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useEffect, useMemo, useState } from "react";
import { cancelBooking, getBookings, useTicket } from "../../../api/bookingApi";
import "../../../styles/booking.css";

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const formatDateTime = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const showtimeText = (booking) => {
  if (!booking.showDate && !booking.startTime) return "—";
  return `${booking.showDate || ""} ${booking.startTime || ""}`.trim();
};

const seatText = (booking) =>
  (booking.seats || []).map((seat) => seat.seatCode).filter(Boolean).join(", ") || "—";

const foodText = (booking) =>
  (booking.foods || [])
    .map((food) => `${food.foodName} x${food.quantity || 0}`)
    .filter(Boolean)
    .join(", ") || "—";

const errorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  return data?.message || fallback;
};

function BookingPage() {
  const [bookings, setBookings] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await getBookings();
      setBookings(response.data || []);
    } catch (error) {
      alert(errorMessage(error, "Không tải được danh sách vé."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    return bookings.filter((booking) => {
      const searchable = [
        booking.bookingCode,
        booking.ticket?.ticketCode,
        booking.customerName,
        booking.customerEmail,
        booking.customerPhone,
        booking.movieTitle,
        booking.theaterName,
        seatText(booking),
      ];
      const matchesKeyword =
        !value ||
        searchable
          .filter(Boolean)
          .some((item) => String(item).toLowerCase().includes(value));

      return matchesKeyword && (!statusFilter || booking.status === statusFilter);
    });
  }, [bookings, keyword, statusFilter]);

  const summary = useMemo(() => {
    const paid = bookings.filter((booking) => booking.status === "PAID");
    return {
      total: bookings.length,
      paid: paid.length,
      revenue: paid.reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0),
      pending: bookings.filter((booking) => booking.status === "PENDING").length,
    };
  }, [bookings]);

  const handleCancel = async (booking) => {
    if (!window.confirm(`Hủy vé "${booking.bookingCode}"?`)) return;
    try {
      await cancelBooking(booking.id);
      await loadBookings();
      alert("Đã hủy vé.");
    } catch (error) {
      alert(errorMessage(error, "Hủy vé thất bại."));
    }
  };

  const handleUseTicket = async (booking) => {
    if (!window.confirm(`Xác nhận đã sử dụng vé "${booking.ticket?.ticketCode}"?`)) return;
    try {
      await useTicket(booking.id);
      await loadBookings();
      alert("Đã cập nhật vé thành USED.");
    } catch (error) {
      alert(errorMessage(error, "Cập nhật vé thất bại."));
    }
  };

  return (
    <section className="booking-page">
      <div className="booking-card">
        <header className="booking-header">
          <div>
            <span className="page-label">CINEMA MANAGEMENT</span>
            <h2>Vé & Booking</h2>
            <p>Quản lý đơn đặt vé, thanh toán, mã vé và trạng thái sử dụng.</p>
          </div>
        </header>

        <div className="booking-summary">
          <div>
            <span>Tổng booking</span>
            <strong>{summary.total}</strong>
          </div>
          <div>
            <span>Đã thanh toán</span>
            <strong>{summary.paid}</strong>
          </div>
          <div>
            <span>Chờ thanh toán</span>
            <strong>{summary.pending}</strong>
          </div>
          <div>
            <span>Doanh thu</span>
            <strong>{money(summary.revenue)}</strong>
          </div>
        </div>

        <div className="booking-toolbar">
          <label className="booking-search">
            <SearchRoundedIcon fontSize="small" />
            <input
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm mã vé, khách hàng, phim, ghế..."
            />
          </label>

          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>

        <div className="booking-table-wrap">
          <table className="booking-table">
            <thead>
              <tr>
                <th>Mã vé</th>
                <th>Khách hàng</th>
                <th>Phim / Suất chiếu</th>
                <th>Rạp / Phòng</th>
                <th>Ghế</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="booking-empty">Đang tải dữ liệu...</td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="booking-empty">Chưa có vé phù hợp.</td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <div className="booking-code">
                        <span><ConfirmationNumberRoundedIcon fontSize="small" /></span>
                        <div>
                          <strong>{booking.ticket?.ticketCode || "Chưa sinh vé"}</strong>
                          <small>{booking.bookingCode}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{booking.customerName || `User #${booking.userId}`}</strong>
                      <small>{booking.customerEmail || booking.customerPhone || "—"}</small>
                    </td>
                    <td>
                      <strong>{booking.movieTitle || `Showtime #${booking.showtimeId}`}</strong>
                      <small>{showtimeText(booking)}</small>
                    </td>
                    <td>
                      <strong>{booking.theaterName || "—"}</strong>
                      <small>{booking.roomName || "—"}</small>
                    </td>
                    <td>{seatText(booking)}</td>
                    <td>
                      <strong>{money(booking.totalAmount)}</strong>
                      <small>Vé {money(booking.ticketAmount)} · Food {money(booking.foodAmount)}</small>
                    </td>
                    <td>
                      <span className={`booking-status ${booking.status?.toLowerCase()}`}>{booking.status}</span>
                      {booking.ticket?.status && (
                        <small className="ticket-status">Ticket: {booking.ticket.status}</small>
                      )}
                    </td>
                    <td>
                      <div className="booking-actions">
                        <button type="button" onClick={() => setSelectedBooking(booking)} title="Chi tiết">
                          <InfoOutlinedIcon fontSize="small" />
                        </button>
                        {booking.ticket?.status === "VALID" && (
                          <button type="button" className="success" onClick={() => handleUseTicket(booking)} title="Dùng vé">
                            <CheckCircleOutlineRoundedIcon fontSize="small" />
                          </button>
                        )}
                        {!["CANCELLED", "EXPIRED"].includes(booking.status) && (
                          <button type="button" className="danger" onClick={() => handleCancel(booking)} title="Hủy vé">
                            <CancelOutlinedIcon fontSize="small" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBooking && (
        <div className="booking-modal-overlay" onMouseDown={() => setSelectedBooking(null)}>
          <div className="booking-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="booking-modal-header">
              <div>
                <h3>Chi tiết vé</h3>
                <p>{selectedBooking.bookingCode} · {selectedBooking.ticket?.ticketCode || "Chưa có ticket"}</p>
              </div>
              <button type="button" onClick={() => setSelectedBooking(null)} aria-label="Đóng">×</button>
            </div>

            <div className="booking-detail-grid">
              <div><span>Khách hàng</span><strong>{selectedBooking.customerName || "—"}</strong></div>
              <div><span>Email</span><strong>{selectedBooking.customerEmail || "—"}</strong></div>
              <div><span>Phim</span><strong>{selectedBooking.movieTitle || "—"}</strong></div>
              <div><span>Suất chiếu</span><strong>{showtimeText(selectedBooking)}</strong></div>
              <div><span>Rạp</span><strong>{selectedBooking.theaterName || "—"}</strong></div>
              <div><span>Phòng</span><strong>{selectedBooking.roomName || "—"}</strong></div>
              <div><span>Ghế</span><strong>{seatText(selectedBooking)}</strong></div>
              <div><span>Đồ ăn</span><strong>{foodText(selectedBooking)}</strong></div>
              <div><span>Ngày đặt</span><strong>{formatDateTime(selectedBooking.createdAt)}</strong></div>
              <div><span>Ngày thanh toán</span><strong>{formatDateTime(selectedBooking.paidAt)}</strong></div>
              <div><span>Tổng tiền</span><strong>{money(selectedBooking.totalAmount)}</strong></div>
              <div><span>Trạng thái</span><strong>{selectedBooking.status}</strong></div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default BookingPage;
