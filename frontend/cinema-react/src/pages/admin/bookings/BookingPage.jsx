import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EventSeatOutlinedIcon from "@mui/icons-material/EventSeatOutlined";
import LocalMoviesOutlinedIcon from "@mui/icons-material/LocalMoviesOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useEffect, useMemo, useState } from "react";
import {
  cancelBooking,
  deleteBooking,
  getBookings,
  markBookingPaid,
} from "../../../api/bookingApi";
import { getRooms } from "../../../api/roomApi";
import { getShowtimes } from "../../../api/showtimeApi";
import { getTheaters } from "../../../api/theaterApi";
import { getCustomers } from "../../../api/userApi";
import "../../../styles/booking.css";

const STATUS_ALIASES = {
  PENDING: "PENDING",
  "CHỜ_THANH_TOÁN": "PENDING",
  CONFIRMED: "PAID",
  "ĐÃ_XÁC_NHẬN": "PAID",
  PAID: "PAID",
  "ĐÃ_THANH_TOÁN": "PAID",
  CANCELLED: "CANCELLED",
  CANCELED: "CANCELLED",
  "ĐÃ_HỦY": "CANCELLED",
};

const STATUS_LABELS = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  CANCELLED: "Đã hủy",
};

const normalizeStatus = (status) => {
  const value = String(status || "PENDING").trim().toUpperCase();
  return STATUS_ALIASES[value] || value;
};

const statusLabel = (status) => {
  const normalized = normalizeStatus(status);
  return STATUS_LABELS[normalized] || status || "Không xác định";
};

const money = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const formatShowDate = (value) => {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
};

const errorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  return data?.message || fallback;
};

const toMap = (items) =>
  new Map((items || []).map((item) => [String(item.id), item]));

const fetchBookingData = async () => {
  const [
    bookingsResult,
    showtimesResult,
    theatersResult,
    roomsResult,
    customersResult,
  ] =
    await Promise.allSettled([
      getBookings(),
      getShowtimes(),
      getTheaters(),
      getRooms(),
      getCustomers(),
    ]);

  if (bookingsResult.status === "rejected") throw bookingsResult.reason;

  return {
    bookings: bookingsResult.value.data || [],
    showtimes:
      showtimesResult.status === "fulfilled" ? showtimesResult.value.data || [] : [],
    theaters:
      theatersResult.status === "fulfilled" ? theatersResult.value.data || [] : [],
    rooms: roomsResult.status === "fulfilled" ? roomsResult.value.data || [] : [],
    customers:
      customersResult.status === "fulfilled" ? customersResult.value.data || [] : [],
  };
};

function BookingPage() {
  const [bookings, setBookings] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    let active = true;

    fetchBookingData()
      .then((data) => {
        if (!active) return;
        setBookings(data.bookings);
        setShowtimes(data.showtimes);
        setTheaters(data.theaters);
        setRooms(data.rooms);
        setCustomers(data.customers);
      })
      .catch((error) => {
        console.error("Lỗi tải danh sách vé:", error);
        if (active) alert(errorMessage(error, "Không tải được danh sách vé."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const showtimeMap = useMemo(() => toMap(showtimes), [showtimes]);
  const theaterMap = useMemo(() => toMap(theaters), [theaters]);
  const roomMap = useMemo(() => toMap(rooms), [rooms]);
  const customerMap = useMemo(() => toMap(customers), [customers]);

  const getShowtime = (booking) =>
    showtimeMap.get(String(booking.showtimeId));

  const filteredBookings = useMemo(() => {
    const value = keyword.trim().toLowerCase();

    return [...bookings]
      .filter((booking) => {
        const showtime = showtimeMap.get(String(booking.showtimeId));
        const theater = showtime
          ? theaterMap.get(String(showtime.theaterId))
          : null;
        const room = showtime ? roomMap.get(String(showtime.roomId)) : null;
        const seats = (booking.seats || []).map((seat) => seat.seatCode).join(" ");
        const customer = customerMap.get(String(booking.userId));
        const matchesKeyword =
          !value ||
          [
            booking.id,
            booking.userId,
            booking.showtimeId,
            customer?.fullName,
            customer?.email,
            showtime?.movieName,
            theater?.name,
            room?.name,
            seats,
          ]
            .filter((item) => item !== null && item !== undefined)
            .some((item) => String(item).toLowerCase().includes(value));

        return (
          matchesKeyword &&
          (!statusFilter || normalizeStatus(booking.status) === statusFilter)
        );
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [bookings, customerMap, keyword, roomMap, showtimeMap, statusFilter, theaterMap]);

  const stats = useMemo(() => {
    const pending = bookings.filter(
      (booking) => normalizeStatus(booking.status) === "PENDING",
    ).length;
    const completed = bookings.filter(
      (booking) => normalizeStatus(booking.status) === "PAID",
    );

    return {
      total: bookings.length,
      pending,
      tickets: bookings.reduce(
        (sum, booking) => sum + (booking.seats?.length || 0),
        0,
      ),
      value: completed.reduce(
        (sum, booking) => sum + Number(booking.totalAmount || 0),
        0,
      ),
    };
  }, [bookings]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await getBookings();
      setBookings(response.data || []);
    } catch (error) {
      alert(errorMessage(error, "Không thể làm mới danh sách vé."));
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkPaid = async (booking) => {
    if (!window.confirm(`Đánh dấu đơn đặt vé #${booking.id} là đã thanh toán?`)) return;

    try {
      setProcessingId(booking.id);
      const response = await markBookingPaid(booking.id);
      setBookings((current) =>
        current.map((item) => (item.id === booking.id ? response.data : item)),
      );
      if (selectedBooking?.id === booking.id) setSelectedBooking(response.data);
      alert("Đã cập nhật trạng thái thanh toán.");
    } catch (error) {
      alert(errorMessage(error, "Cập nhật thanh toán thất bại."));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (booking) => {
    if (
      !window.confirm(
        `Xóa vĩnh viễn đơn đặt vé #${booking.id}? Thao tác này không thể hoàn tác.`,
      )
    ) {
      return;
    }

    try {
      setProcessingId(booking.id);
      await deleteBooking(booking.id);
      setBookings((current) => current.filter((item) => item.id !== booking.id));
      if (selectedBooking?.id === booking.id) setSelectedBooking(null);
      alert("Đã xóa đơn đặt vé.");
    } catch (error) {
      alert(errorMessage(error, "Xóa đơn đặt vé thất bại."));
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (booking) => {
    if (
      !window.confirm(
        `Hủy đơn đặt vé #${booking.id}? Các ghế trong đơn sẽ được mở lại.`,
      )
    ) {
      return;
    }

    try {
      setProcessingId(booking.id);
      const response = await cancelBooking(booking.id);
      setBookings((current) =>
        current.map((item) => (item.id === booking.id ? response.data : item)),
      );
      if (selectedBooking?.id === booking.id) setSelectedBooking(response.data);
      alert("Đã hủy đơn đặt vé và giải phóng ghế.");
    } catch (error) {
      alert(errorMessage(error, "Hủy đơn đặt vé thất bại."));
    } finally {
      setProcessingId(null);
    }
  };

  const renderActions = (booking) => {
    const status = normalizeStatus(booking.status);
    const processing = processingId === booking.id;

    return (
      <div className="booking-actions">
        <button
          type="button"
          onClick={() => setSelectedBooking(booking)}
          title="Xem chi tiết"
          aria-label={`Xem đơn đặt vé ${booking.id}`}
        >
          <VisibilityOutlinedIcon fontSize="small" />
        </button>
        {status === "PENDING" && (
          <button
            type="button"
            className="paid"
            onClick={() => handleMarkPaid(booking)}
            disabled={processing}
            title="Đánh dấu đã thanh toán"
            aria-label={`Đánh dấu đơn đặt vé ${booking.id} đã thanh toán`}
          >
            <CheckCircleOutlineRoundedIcon fontSize="small" />
          </button>
        )}
        {status !== "CANCELLED" ? (
          <button
            type="button"
            className="cancel"
            onClick={() => handleCancel(booking)}
            disabled={processing}
            title="Hủy đơn đặt vé"
            aria-label={`Hủy đơn đặt vé ${booking.id}`}
          >
            <CancelOutlinedIcon fontSize="small" />
          </button>
        ) : (
          <button
            type="button"
            className="danger"
            onClick={() => handleDelete(booking)}
            disabled={processing}
            title="Xóa"
            aria-label={`Xóa đơn đặt vé ${booking.id}`}
          >
            <DeleteOutlineRoundedIcon fontSize="small" />
          </button>
        )}
      </div>
    );
  };

  const detailShowtime = selectedBooking ? getShowtime(selectedBooking) : null;
  const detailTheater = detailShowtime
    ? theaterMap.get(String(detailShowtime.theaterId))
    : null;
  const detailRoom = detailShowtime
    ? roomMap.get(String(detailShowtime.roomId))
    : null;
  const detailCustomer = selectedBooking
    ? customerMap.get(String(selectedBooking.userId))
    : null;

  return (
    <>
      <section className="booking-page">
        <div className="booking-card">
          <header className="booking-header">
            <div>
              <span className="page-label">QUẢN LÝ RẠP CHIẾU PHIM</span>
              <h2>Quản lý vé</h2>
              <p>Theo dõi đơn đặt vé, ghế đã đặt và tình trạng thanh toán.</p>
            </div>
            <div className="booking-header-actions">
              <button type="button" onClick={handleRefresh} disabled={refreshing}>
                <RefreshRoundedIcon fontSize="small" />
                {refreshing ? "Đang tải..." : "Làm mới"}
              </button>
            </div>
          </header>

          <div className="booking-stats">
            <article>
              <span className="booking-stat-icon blue"><ConfirmationNumberOutlinedIcon /></span>
              <div><small>Tổng đơn đặt vé</small><strong>{stats.total}</strong></div>
            </article>
            <article>
              <span className="booking-stat-icon amber"><LocalMoviesOutlinedIcon /></span>
              <div><small>Chờ xử lý</small><strong>{stats.pending}</strong></div>
            </article>
            <article>
              <span className="booking-stat-icon violet"><EventSeatOutlinedIcon /></span>
              <div><small>Số ghế đặt</small><strong>{stats.tickets}</strong></div>
            </article>
            <article>
              <span className="booking-stat-icon green"><PaymentsOutlinedIcon /></span>
              <div><small>Doanh thu đã thanh toán</small><strong>{money(stats.value)}</strong></div>
            </article>
          </div>

          <div className="booking-toolbar">
            <label className="booking-search">
              <SearchRoundedIcon fontSize="small" />
              <input
                type="search"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm mã vé, khách hàng, phim, rạp hoặc ghế..."
              />
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ thanh toán</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <div className="booking-table-wrap">
            <table className="booking-table">
              <thead>
                <tr>
                  <th>Mã vé</th>
                  <th>Khách hàng</th>
                  <th>Phim & suất chiếu</th>
                  <th>Ghế</th>
                  <th>Tổng tiền</th>
                  <th>Ngày đặt</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" className="booking-empty">Đang tải dữ liệu...</td></tr>
                ) : filteredBookings.length === 0 ? (
                  <tr><td colSpan="8" className="booking-empty">Chưa có đơn đặt vé phù hợp.</td></tr>
                ) : (
                  filteredBookings.map((booking) => {
                    const showtime = getShowtime(booking);
                    const theater = showtime
                      ? theaterMap.get(String(showtime.theaterId))
                      : null;
                    const room = showtime
                      ? roomMap.get(String(showtime.roomId))
                      : null;
                    const status = normalizeStatus(booking.status);
                    const customer = customerMap.get(String(booking.userId));

                    return (
                      <tr key={booking.id}>
                        <td><strong className="booking-code">#{booking.id}</strong></td>
                        <td>
                          <strong>{customer?.fullName || `Khách hàng #${booking.userId || "—"}`}</strong>
                          <span className="booking-muted">{customer?.email || `Mã người dùng: ${booking.userId || "—"}`}</span>
                        </td>
                        <td>
                          <strong>{showtime?.movieName || `Suất chiếu #${booking.showtimeId}`}</strong>
                          <span className="booking-muted">
                            {showtime
                              ? `${formatShowDate(showtime.showDate)} · ${showtime.startTime?.slice(0, 5) || "—"}`
                              : `Mã suất chiếu: ${booking.showtimeId || "—"}`}
                          </span>
                          {showtime && (
                            <span className="booking-muted">
                              {theater?.name || `Rạp #${showtime.theaterId}`} · {room?.name || `Phòng #${showtime.roomId}`}
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="booking-seats">
                            {(booking.seats || []).length > 0
                              ? booking.seats.map((seat) => (
                                  <span key={seat.id || seat.seatCode}>{seat.seatCode}</span>
                                ))
                              : <span className="empty-seat">—</span>}
                          </div>
                        </td>
                        <td><strong className="booking-money">{money(booking.totalAmount)}</strong></td>
                        <td><span className="booking-date">{formatDateTime(booking.createdAt)}</span></td>
                        <td>
                          <span className={`booking-status ${status.toLowerCase()}`}>
                            {statusLabel(booking.status)}
                          </span>
                        </td>
                        <td>{renderActions(booking)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {selectedBooking && (
        <div className="booking-modal-overlay" onMouseDown={() => setSelectedBooking(null)}>
          <div className="booking-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="booking-modal-header">
              <div>
                <span>CHI TIẾT ĐƠN ĐẶT VÉ</span>
                <h3>Vé #{selectedBooking.id}</h3>
              </div>
              <button type="button" onClick={() => setSelectedBooking(null)} aria-label="Đóng">×</button>
            </div>

            <div className="booking-detail-status">
              <span className={`booking-status ${normalizeStatus(selectedBooking.status).toLowerCase()}`}>
                {statusLabel(selectedBooking.status)}
              </span>
              <strong>{money(selectedBooking.totalAmount)}</strong>
            </div>

            <div className="booking-detail-grid">
              <div><small>Khách hàng</small><strong>{detailCustomer?.fullName || `Khách hàng #${selectedBooking.userId || "—"}`}</strong></div>
              <div><small>Ngày đặt</small><strong>{formatDateTime(selectedBooking.createdAt)}</strong></div>
              <div><small>Phim</small><strong>{detailShowtime?.movieName || "Chưa có dữ liệu"}</strong></div>
              <div><small>Suất chiếu</small><strong>{detailShowtime ? `${formatShowDate(detailShowtime.showDate)} · ${detailShowtime.startTime?.slice(0, 5)}` : `#${selectedBooking.showtimeId}`}</strong></div>
              <div><small>Rạp</small><strong>{detailTheater?.name || (detailShowtime ? `Rạp #${detailShowtime.theaterId}` : "—")}</strong></div>
              <div><small>Phòng</small><strong>{detailRoom?.name || (detailShowtime ? `Phòng #${detailShowtime.roomId}` : "—")}</strong></div>
            </div>

            <div className="booking-detail-seats">
              <h4>Ghế đã đặt</h4>
              {(selectedBooking.seats || []).length > 0 ? (
                selectedBooking.seats.map((seat) => (
                  <div key={seat.id || seat.seatCode}>
                    <span><EventSeatOutlinedIcon fontSize="small" /> Ghế {seat.seatCode}</span>
                    <strong>{money(seat.price)}</strong>
                  </div>
                ))
              ) : (
                <p>Đơn đặt vé chưa có thông tin ghế.</p>
              )}
            </div>

            <div className="booking-modal-actions">
              <button type="button" className="secondary" onClick={() => setSelectedBooking(null)}>Đóng</button>
              {normalizeStatus(selectedBooking.status) === "PENDING" && (
                <button
                  type="button"
                  className="primary"
                  onClick={() => handleMarkPaid(selectedBooking)}
                  disabled={processingId === selectedBooking.id}
                >
                  <CheckCircleOutlineRoundedIcon fontSize="small" />
                  Đánh dấu đã thanh toán
                </button>
              )}
              {normalizeStatus(selectedBooking.status) !== "CANCELLED" && (
                <button
                  type="button"
                  className="danger"
                  onClick={() => handleCancel(selectedBooking)}
                  disabled={processingId === selectedBooking.id}
                >
                  <CancelOutlinedIcon fontSize="small" />
                  Hủy đơn đặt vé
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BookingPage;
