import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import CelebrationOutlinedIcon from "@mui/icons-material/CelebrationOutlined";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import MovieRoundedIcon from "@mui/icons-material/MovieRounded";
import NewspaperOutlinedIcon from "@mui/icons-material/NewspaperOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import TapasOutlinedIcon from "@mui/icons-material/TapasOutlined";
import TheatersRoundedIcon from "@mui/icons-material/TheatersRounded";
import { NavLink } from "react-router-dom";

const menuItems = [
  { label: "Dashboard", path: "/admin", Icon: DashboardRoundedIcon },
  { label: "Phim", path: "/admin/movies", Icon: MovieRoundedIcon },
  { label: "Thể loại", path: "/admin/genres", Icon: CategoryOutlinedIcon },
  { label: "Rạp", path: "/admin/theaters", Icon: StorefrontOutlinedIcon },
  { label: "Phòng chiếu", path: "/admin/rooms", Icon: MeetingRoomOutlinedIcon },
  { label: "Lịch chiếu", path: "/admin/showtimes", Icon: CalendarMonthRoundedIcon },
  { label: "Sự kiện", path: "/admin/events", Icon: CelebrationOutlinedIcon },
  { label: "Tin tức", path: "/admin/news", Icon: NewspaperOutlinedIcon },
  { label: "Khuyến mãi", path: "/admin/promotions", Icon: LocalOfferOutlinedIcon },
  { label: "Thức ăn", path: "/admin/foods", Icon: RestaurantMenuOutlinedIcon },
  { label: "Combo", path: "/admin/combos", Icon: TapasOutlinedIcon },
  { label: "Vé", path: "/admin/bookings", Icon: ConfirmationNumberRoundedIcon },
  { label: "Giá vé", path: "/admin/ticket-pricing", Icon: PaidOutlinedIcon },
  { label: "Người dùng", path: "/admin/users", Icon: GroupRoundedIcon },
  { label: "Nhân viên", path: "/admin/staff", Icon: ManageAccountsOutlinedIcon },
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
            to={path}
            end={path === "/admin"}
            className={({ isActive }) => (isActive ? "active" : undefined)}
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
