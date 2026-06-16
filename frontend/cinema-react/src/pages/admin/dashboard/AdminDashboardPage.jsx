import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import MovieRoundedIcon from "@mui/icons-material/MovieRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";

const stats = [
  {
    label: "Tong phim",
    value: "128",
    Icon: MovieRoundedIcon,
    tone: "blue",
  },
  {
    label: "Suat chieu hom nay",
    value: "42",
    Icon: CalendarMonthRoundedIcon,
    tone: "green",
  },
  {
    label: "Ve da ban",
    value: "1,284",
    Icon: ConfirmationNumberRoundedIcon,
    tone: "orange",
  },
  {
    label: "Doanh thu",
    value: "86.4M",
    Icon: PaymentsRoundedIcon,
    tone: "purple",
  },
];

function DashboardPage() {
  const auth = JSON.parse(localStorage.getItem("auth") || "{}");

  return (
    <section className="dashboard-page">
      <div className="dashboard-title">
        <div>
          <p className="dashboard-eyebrow">Cinema Management</p>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">
            Xin chao {auth.fullName || "Admin"}, day la tong quan he thong.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        {stats.map(({ label, value, Icon, tone }) => (
          <article className="stat-card" key={label}>
            <div className={`stat-icon stat-icon-${tone}`}>
              <Icon />
            </div>
            <div>
              <div className="stat-label">{label}</div>
              <div className="stat-value">{value}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default DashboardPage;
