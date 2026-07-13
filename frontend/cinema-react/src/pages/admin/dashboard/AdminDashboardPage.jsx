import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import LocalDiningRoundedIcon from "@mui/icons-material/LocalDiningRounded";
import MovieRoundedIcon from "@mui/icons-material/MovieRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import TheatersRoundedIcon from "@mui/icons-material/TheatersRounded";
import { useEffect, useMemo, useState } from "react";
import { getBookings } from "../../../api/bookingApi";
import { getFoods } from "../../../api/foodApi";
import { getMovies } from "../../../api/movieApi";
import { getShowtimes } from "../../../api/showtimeApi";
import { getUsers } from "../../../api/userApi";
import "../../../styles/dashboard.css";

const todayString = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const money = (value) => {
  const amount = Number(value || 0);
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  return `${amount.toLocaleString("vi-VN")}đ`;
};

const fullMoney = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

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

const getSeatText = (booking) =>
  (booking.seats || []).map((seat) => seat.seatCode).filter(Boolean).join(", ") || "—";

const safeData = (result) => (result.status === "fulfilled" ? result.value.data || [] : []);

function DashboardPage() {
  const auth = JSON.parse(localStorage.getItem("auth") || "{}");
  const [data, setData] = useState({
    movies: [],
    showtimes: [],
    bookings: [],
    users: [],
    foods: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const [movies, showtimes, bookings, users, foods] = await Promise.allSettled([
        getMovies(),
        getShowtimes(),
        getBookings(),
        getUsers(),
        getFoods(),
      ]);

      setData({
        movies: safeData(movies),
        showtimes: safeData(showtimes),
        bookings: safeData(bookings),
        users: safeData(users),
        foods: safeData(foods),
      });

      const failed = [movies, showtimes, bookings, users, foods].some(
        (result) => result.status === "rejected",
      );
      if (failed) {
        setError("Một vài API chưa phản hồi, Dashboard đang hiển thị phần dữ liệu tải được.");
      }
    } catch (loadError) {
      setError("Không tải được dữ liệu Dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const dashboard = useMemo(() => {
    const { movies, showtimes, bookings, users, foods } = data;
    const today = todayString();
    const paidBookings = bookings.filter((booking) => booking.status === "PAID");
    const pendingBookings = bookings.filter((booking) => booking.status === "PENDING");
    const cancelledBookings = bookings.filter((booking) => booking.status === "CANCELLED");
    const usedTickets = bookings.filter((booking) => booking.ticket?.status === "USED");
    const validTickets = bookings.filter((booking) => booking.ticket?.status === "VALID");
    const customers = users.filter((user) => user.role === "CUSTOMER");
    const staff = users.filter((user) => ["ADMIN", "STAFF"].includes(user.role));
    const lowStockFoods = foods.filter(
      (food) => Number(food.stockQuantity || 0) <= Number(food.lowStockThreshold || 0),
    );

    const revenue = paidBookings.reduce(
      (sum, booking) => sum + Number(booking.totalAmount || 0),
      0,
    );

    const todayShowtimes = showtimes.filter((showtime) => showtime.showDate === today);
    const upcomingShowtimes = showtimes.filter((showtime) => showtime.showDate >= today);

    const statusItems = [
      { label: "Đã thanh toán", value: paidBookings.length, tone: "paid" },
      { label: "Chờ thanh toán", value: pendingBookings.length, tone: "pending" },
      { label: "Đã hủy", value: cancelledBookings.length, tone: "cancelled" },
      { label: "Vé đã dùng", value: usedTickets.length, tone: "used" },
    ];

    const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const offset = date.getTimezoneOffset() * 60_000;
      const key = new Date(date.getTime() - offset).toISOString().slice(0, 10);
      const total = paidBookings
        .filter((booking) => (booking.paidAt || booking.createdAt || "").slice(0, 10) === key)
        .reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0);
      return {
        key,
        label: `${date.getDate()}/${date.getMonth() + 1}`,
        total,
      };
    });

    const maxRevenue = Math.max(...lastSevenDays.map((item) => item.total), 1);
    const recentBookings = [...bookings]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 6);

    return {
      today,
      revenue,
      paidBookings,
      pendingBookings,
      validTickets,
      customers,
      staff,
      lowStockFoods,
      todayShowtimes,
      upcomingShowtimes,
      statusItems,
      lastSevenDays,
      maxRevenue,
      recentBookings,
      movieCount: movies.length,
      showtimeCount: showtimes.length,
    };
  }, [data]);

  const kpis = [
    {
      label: "Tổng phim",
      value: dashboard.movieCount,
      detail: "Phim trong hệ thống",
      Icon: MovieRoundedIcon,
      tone: "blue",
    },
    {
      label: "Suất chiếu hôm nay",
      value: dashboard.todayShowtimes.length,
      detail: `${dashboard.upcomingShowtimes.length} suất sắp tới`,
      Icon: CalendarMonthRoundedIcon,
      tone: "green",
    },
    {
      label: "Vé đã bán",
      value: dashboard.paidBookings.length,
      detail: `${dashboard.validTickets.length} vé còn hiệu lực`,
      Icon: ConfirmationNumberRoundedIcon,
      tone: "orange",
    },
    {
      label: "Doanh thu",
      value: money(dashboard.revenue),
      detail: "Từ booking PAID",
      Icon: PaymentsRoundedIcon,
      tone: "purple",
    },
  ];

  return (
    <section className="dashboard-page dashboard-pro">
      <div className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow">Cinema Management</p>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">
            Xin chào {auth.fullName || "Admin"}, đây là tổng quan vận hành rạp hôm nay.
          </p>
        </div>

        <button type="button" className="dashboard-refresh" onClick={loadDashboard} disabled={loading}>
          <RefreshRoundedIcon fontSize="small" />
          {loading ? "Đang tải..." : "Tải lại"}
        </button>
      </div>

      {error && <div className="dashboard-alert">{error}</div>}

      <div className="dashboard-grid dashboard-kpis">
        {kpis.map(({ label, value, detail, Icon, tone }) => (
          <article className="stat-card dashboard-stat" key={label}>
            <div className={`stat-icon stat-icon-${tone}`}>
              <Icon />
            </div>
            <div>
              <div className="stat-label">{label}</div>
              <div className="stat-value">{loading ? "..." : value}</div>
              <div className="stat-detail">{detail}</div>
            </div>
          </article>
        ))}
      </div>

      <div className="dashboard-main-grid">
        <section className="dashboard-panel revenue-panel">
          <div className="panel-heading">
            <div>
              <h2>Doanh thu 7 ngày</h2>
              <p>Tính theo thời điểm thanh toán thành công.</p>
            </div>
            <strong>{fullMoney(dashboard.revenue)}</strong>
          </div>

          <div className="revenue-chart">
            {dashboard.lastSevenDays.map((item) => (
              <div className="revenue-bar-item" key={item.key}>
                <div className="revenue-bar-track">
                  <div
                    className="revenue-bar"
                    style={{ height: `${Math.max((item.total / dashboard.maxRevenue) * 100, item.total ? 8 : 2)}%` }}
                  />
                </div>
                <span>{item.label}</span>
                <small>{item.total ? money(item.total) : "0"}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-panel status-panel">
          <div className="panel-heading">
            <div>
              <h2>Trạng thái vé</h2>
              <p>Theo booking và ticket hiện tại.</p>
            </div>
          </div>

          <div className="status-list">
            {dashboard.statusItems.map((item) => (
              <div className="status-row" key={item.label}>
                <span className={`status-dot ${item.tone}`} />
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="dashboard-secondary-grid">
        <section className="dashboard-panel recent-panel">
          <div className="panel-heading">
            <div>
              <h2>Vé gần đây</h2>
              <p>Các booking mới nhất trong hệ thống.</p>
            </div>
          </div>

          <div className="recent-table-wrap">
            <table className="recent-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Khách hàng</th>
                  <th>Phim</th>
                  <th>Ghế</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="dashboard-empty">Chưa có booking.</td>
                  </tr>
                ) : (
                  dashboard.recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        <strong>{booking.ticket?.ticketCode || booking.bookingCode || `#${booking.id}`}</strong>
                        <small>{formatDateTime(booking.createdAt)}</small>
                      </td>
                      <td>{booking.customerName || `User #${booking.userId}`}</td>
                      <td>{booking.movieTitle || `Showtime #${booking.showtimeId}`}</td>
                      <td>{getSeatText(booking)}</td>
                      <td>{fullMoney(booking.totalAmount)}</td>
                      <td>
                        <span className={`dashboard-status ${booking.status?.toLowerCase()}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="dashboard-side-stack">
          <section className="dashboard-panel mini-panel">
            <div className="mini-icon blue"><PeopleAltRoundedIcon /></div>
            <div>
              <span>Khách hàng</span>
              <strong>{dashboard.customers.length}</strong>
              <p>{dashboard.staff.length} tài khoản quản trị/nhân viên</p>
            </div>
          </section>

          <section className="dashboard-panel mini-panel">
            <div className="mini-icon green"><TheatersRoundedIcon /></div>
            <div>
              <span>Lịch chiếu</span>
              <strong>{dashboard.showtimeCount}</strong>
              <p>Dữ liệu dùng để lập suất chiếu và bán vé</p>
            </div>
          </section>

          <section className="dashboard-panel mini-panel">
            <div className="mini-icon orange"><LocalDiningRoundedIcon /></div>
            <div>
              <span>Cảnh báo thức ăn</span>
              <strong>{dashboard.lowStockFoods.length}</strong>
              <p>Món có tồn kho bằng hoặc dưới ngưỡng cảnh báo</p>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

export default DashboardPage;
