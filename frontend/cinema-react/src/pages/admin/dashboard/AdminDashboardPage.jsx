import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import LocalMoviesOutlinedIcon from "@mui/icons-material/LocalMoviesOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import MovieRoundedIcon from "@mui/icons-material/MovieRounded";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBookings } from "../../../api/bookingApi";
import { getMovies } from "../../../api/movieApi";
import { getRooms } from "../../../api/roomApi";
import { getShowtimes } from "../../../api/showtimeApi";
import { getTheaters } from "../../../api/theaterApi";
import { getCustomers, getUsers } from "../../../api/userApi";
import "../../../styles/dashboard.css";
import { showtimeStatusLabel } from "../../../utils/displayLabels";

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

const localDateValue = (date = new Date()) => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const compactMoney = (value) =>
  new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0)) + "đ";

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
};

const toMap = (items) =>
  new Map((items || []).map((item) => [String(item.id), item]));

const valueOf = (result) =>
  result.status === "fulfilled" ? result.value.data || [] : [];

function DashboardPage() {
  const auth = JSON.parse(localStorage.getItem("auth") || "{}");
  const isAdmin = String(auth.role || "").toUpperCase() === "ADMIN";
  const [data, setData] = useState({
    movies: [],
    showtimes: [],
    bookings: [],
    theaters: [],
    rooms: [],
    users: [],
    customers: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [partialError, setPartialError] = useState(false);

  const loadDashboard = useCallback(async (refresh = false) => {
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      const results = await Promise.allSettled([
        getMovies(),
        getShowtimes(),
        getBookings(),
        getTheaters(),
        getRooms(),
        isAdmin ? getUsers() : Promise.resolve({ data: [] }),
        getCustomers(),
      ]);
      setPartialError(results.some((result) => result.status === "rejected"));
      setData({
        movies: valueOf(results[0]),
        showtimes: valueOf(results[1]),
        bookings: valueOf(results[2]),
        theaters: valueOf(results[3]),
        rooms: valueOf(results[4]),
        users: valueOf(results[5]),
        customers: valueOf(results[6]),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const today = localDateValue();
  const paidBookings = useMemo(
    () => data.bookings.filter((booking) => normalizeStatus(booking.status) === "PAID"),
    [data.bookings],
  );
  const todayShowtimes = useMemo(
    () =>
      data.showtimes
        .filter((showtime) => showtime.showDate === today)
        .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime))),
    [data.showtimes, today],
  );
  const totalTickets = paidBookings.reduce(
    (sum, booking) => sum + (booking.seats?.length || 0),
    0,
  );
  const totalRevenue = paidBookings.reduce(
    (sum, booking) => sum + Number(booking.totalAmount || 0),
    0,
  );

  const statusCounts = useMemo(() => {
    const counts = { PENDING: 0, PAID: 0, CANCELLED: 0 };
    data.bookings.forEach((booking) => {
      const status = normalizeStatus(booking.status);
      if (status in counts) counts[status] += 1;
    });
    return counts;
  }, [data.bookings]);

  const revenueTrend = useMemo(() => {
    const days = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      const key = localDateValue(date);
      days.push({
        key,
        label: new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(date),
        value: 0,
      });
    }
    const byDate = new Map(days.map((item) => [item.key, item]));
    paidBookings.forEach((booking) => {
      const date = booking.createdAt ? localDateValue(new Date(booking.createdAt)) : null;
      if (date && byDate.has(date)) {
        byDate.get(date).value += Number(booking.totalAmount || 0);
      }
    });
    return days;
  }, [paidBookings]);

  const maxRevenue = Math.max(...revenueTrend.map((item) => item.value), 1);
  const totalBookings = Math.max(data.bookings.length, 1);
  const paidAngle = (statusCounts.PAID / totalBookings) * 360;
  const pendingAngle = paidAngle + (statusCounts.PENDING / totalBookings) * 360;
  const theaterMap = useMemo(() => toMap(data.theaters), [data.theaters]);
  const roomMap = useMemo(() => toMap(data.rooms), [data.rooms]);
  const showtimeMap = useMemo(() => toMap(data.showtimes), [data.showtimes]);
  const customerMap = useMemo(
    () => toMap(data.users.length > 0 ? data.users : data.customers),
    [data.customers, data.users],
  );
  const recentBookings = useMemo(
    () =>
      [...data.bookings]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 6),
    [data.bookings],
  );

  const userCount = data.users.length || data.customers.length;
  const metrics = [
    { label: "Tổng phim", value: data.movies.length, Icon: MovieRoundedIcon, tone: "blue", note: "Phim trong hệ thống" },
    { label: "Suất chiếu hôm nay", value: todayShowtimes.length, Icon: CalendarMonthRoundedIcon, tone: "green", note: `${data.theaters.length} rạp đang quản lý` },
    { label: "Vé đã bán", value: totalTickets, Icon: ConfirmationNumberRoundedIcon, tone: "orange", note: `${paidBookings.length} đơn đã thanh toán` },
    { label: "Tổng doanh thu", value: compactMoney(totalRevenue), Icon: PaymentsRoundedIcon, tone: "purple", note: "Từ đơn đặt vé đã thanh toán" },
  ];

  return (
    <section className="dashboard-page overview-dashboard">
      <div className="dashboard-title overview-title">
        <div>
          <p className="dashboard-eyebrow">QUẢN LÝ RẠP CHIẾU PHIM</p>
          <h1>Tổng quan hệ thống</h1>
          <p className="dashboard-subtitle">Xin chào {auth.fullName || "Quản trị viên"}, đây là tình hình hệ thống hôm nay.</p>
        </div>
        <button type="button" onClick={() => loadDashboard(true)} disabled={refreshing}>
          <RefreshRoundedIcon fontSize="small" /> {refreshing ? "Đang tải..." : "Làm mới dữ liệu"}
        </button>
      </div>

      {partialError && <div className="overview-warning">Một vài dịch vụ chưa phản hồi, trang tổng quan đang hiển thị các dữ liệu tải được.</div>}

      <div className="dashboard-grid overview-metrics">
        {metrics.map(({ label, value, Icon, tone, note }) => (
          <article className="stat-card" key={label}>
            <div className={`stat-icon stat-icon-${tone}`}><Icon /></div>
            <div><div className="stat-label">{label}</div><div className="stat-value">{loading ? "—" : value}</div><small>{note}</small></div>
          </article>
        ))}
      </div>

      <div className="overview-secondary-stats">
        <article><StorefrontOutlinedIcon /><span><small>Rạp</small><strong>{data.theaters.length}</strong></span></article>
        <article><MeetingRoomOutlinedIcon /><span><small>Phòng chiếu</small><strong>{data.rooms.length}</strong></span></article>
        <article><GroupOutlinedIcon /><span><small>Người dùng</small><strong>{userCount}</strong></span></article>
        <article><PaidOutlinedIcon /><span><small>Chờ thanh toán</small><strong>{statusCounts.PENDING}</strong></span></article>
      </div>

      <div className="overview-analytics-grid">
        <article className="overview-panel revenue-panel">
          <div className="overview-panel-title"><div><span><TrendingUpRoundedIcon /></span><div><h2>Doanh thu 7 ngày</h2><p>Tổng tiền từ đơn đặt vé đã thanh toán</p></div></div><strong>{money(revenueTrend.reduce((sum, item) => sum + item.value, 0))}</strong></div>
          <div className="revenue-chart">
            {revenueTrend.map((item) => (
              <div className="revenue-column" key={item.key} title={`${item.key}: ${money(item.value)}`}>
                <div className="revenue-bar-track"><span style={{ height: `${Math.max((item.value / maxRevenue) * 100, item.value ? 8 : 2)}%` }} /></div>
                <small>{item.label}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="overview-panel status-panel">
          <div className="overview-panel-title"><div><span><ConfirmationNumberRoundedIcon /></span><div><h2>Trạng thái đặt vé</h2><p>{data.bookings.length} đơn đặt vé trong hệ thống</p></div></div></div>
          <div className="booking-status-overview">
            <div className="status-donut" style={{ background: `conic-gradient(#22c55e 0deg ${paidAngle}deg, #f59e0b ${paidAngle}deg ${pendingAngle}deg, #ef4444 ${pendingAngle}deg 360deg)` }}><span><strong>{data.bookings.length}</strong><small>Tổng</small></span></div>
            <div className="status-legend">
              {Object.entries(statusCounts).map(([status, count]) => <div key={status}><i className={status.toLowerCase()} /><span>{STATUS_LABELS[status]}</span><strong>{count}</strong></div>)}
            </div>
          </div>
        </article>
      </div>

      <div className="overview-content-grid">
        <article className="overview-panel schedule-panel">
          <div className="overview-panel-title"><div><span><LocalMoviesOutlinedIcon /></span><div><h2>Lịch chiếu hôm nay</h2><p>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "full" }).format(new Date())}</p></div></div><Link to="/admin/showtimes">Xem lịch chiếu</Link></div>
          <div className="today-schedule-list">
            {todayShowtimes.length === 0 ? <p className="overview-empty">Hôm nay chưa có suất chiếu.</p> : todayShowtimes.slice(0, 6).map((showtime) => {
              const theater = theaterMap.get(String(showtime.theaterId));
              const room = roomMap.get(String(showtime.roomId));
              return <div key={showtime.id}><time>{showtime.startTime?.slice(0, 5) || "—"}</time><span><strong>{showtime.movieName}</strong><small>{theater?.name || `Rạp #${showtime.theaterId}`} · {room?.name || `Phòng #${showtime.roomId}`} · {showtime.formatType || "2D"}</small></span><em>{showtimeStatusLabel(showtime.status || "ONLINE")}</em></div>;
            })}
          </div>
        </article>

        <article className="overview-panel recent-panel">
          <div className="overview-panel-title"><div><span><ConfirmationNumberRoundedIcon /></span><div><h2>Đơn đặt vé gần nhất</h2><p>Hoạt động đặt vé mới trong hệ thống</p></div></div><Link to="/admin/bookings">Quản lý vé</Link></div>
          <div className="recent-booking-list">
            {recentBookings.length === 0 ? <p className="overview-empty">Chưa có đơn đặt vé.</p> : recentBookings.map((booking) => {
              const showtime = showtimeMap.get(String(booking.showtimeId));
              const customer = customerMap.get(String(booking.userId));
              const status = normalizeStatus(booking.status);
              return <div key={booking.id}><span className="recent-code">#{booking.id}</span><span className="recent-main"><strong>{customer?.fullName || `Khách hàng #${booking.userId}`}</strong><small>{showtime?.movieName || `Suất chiếu #${booking.showtimeId}`} · {(booking.seats || []).map((seat) => seat.seatCode).join(", ") || "Chưa có ghế"}</small></span><span className="recent-total"><strong>{money(booking.totalAmount)}</strong><small>{formatDateTime(booking.createdAt)}</small></span><em className={status.toLowerCase()}>{STATUS_LABELS[status] || status}</em></div>;
            })}
          </div>
        </article>
      </div>

      <div className="overview-quick-links">
        <Link to="/admin/movies"><MovieRoundedIcon /><span><strong>Quản lý phim</strong><small>Cập nhật danh sách phim</small></span></Link>
        <Link to="/admin/showtimes"><CalendarMonthRoundedIcon /><span><strong>Lịch chiếu</strong><small>Sắp xếp các suất chiếu</small></span></Link>
        <Link to="/admin/bookings"><ConfirmationNumberRoundedIcon /><span><strong>Quản lý vé</strong><small>Theo dõi đơn đặt vé trực tuyến</small></span></Link>
        {isAdmin && <Link to="/admin/users"><GroupOutlinedIcon /><span><strong>Người dùng</strong><small>Quản lý tài khoản</small></span></Link>}
      </div>
    </section>
  );
}

export default DashboardPage;
