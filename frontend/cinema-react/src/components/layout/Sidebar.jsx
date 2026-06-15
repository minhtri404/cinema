import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import MovieRoundedIcon from "@mui/icons-material/MovieRounded";
import TheatersRoundedIcon from "@mui/icons-material/TheatersRounded";
import { NavLink } from "react-router-dom";

const menuItems = [
  { label: "Dashboard", path: "/admin", Icon: DashboardRoundedIcon },
  { label: "Phim", path: "/admin/movies", Icon: MovieRoundedIcon },
  { label: "Lich chieu", path: "/admin/showtimes", Icon: CalendarMonthRoundedIcon },
  { label: "Ve", path: "/admin/bookings", Icon: ConfirmationNumberRoundedIcon },
  { label: "Nguoi dung", path: "/admin/users", Icon: GroupRoundedIcon },
];

function Sidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <TheatersRoundedIcon />
        </div>
        <div>
          <span>Admin Cinema</span>
          <p>Management</p>
        </div>
      </div>

      <div className="sidebar-divider" />

      <nav className="sidebar-menu" aria-label="Admin navigation">
        {menuItems.map(({ label, path, Icon }) => (
          <NavLink
            key={path}
            className={({ isActive }) => (isActive ? "active" : undefined)}
            end={path === "/admin"}
            to={path}
          >
            <Icon className="menu-icon" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
