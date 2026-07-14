import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import MovieRoundedIcon from "@mui/icons-material/MovieRounded";
import TheatersRoundedIcon from "@mui/icons-material/TheatersRounded";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import CelebrationOutlinedIcon from "@mui/icons-material/CelebrationOutlined";
import NewspaperOutlinedIcon from "@mui/icons-material/NewspaperOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import QrCodeScannerOutlinedIcon from "@mui/icons-material/QrCodeScannerOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import TapasOutlinedIcon from "@mui/icons-material/TapasOutlined";
import { NavLink } from "react-router-dom";

const menuItems = [
  { label: "Tổng quan", path: "/admin", Icon: DashboardRoundedIcon },
  { label: "Phim", path: "/admin/movies", Icon: MovieRoundedIcon },
  { label: "Thể loại", path: "/admin/genres", Icon: CategoryOutlinedIcon },
  { label: "Rạp", path: "/admin/theaters", Icon: StorefrontOutlinedIcon },
  { label: "Phòng chiếu", path: "/admin/rooms", Icon: MeetingRoomOutlinedIcon },
  { label: "Lịch chiếu", path: "/admin/showtimes", Icon: CalendarMonthRoundedIcon },
  { label: "Sự kiện", path: "/admin/events", Icon: CelebrationOutlinedIcon },
  { label: "Tin tức", path: "/admin/news", Icon: NewspaperOutlinedIcon },
  { label: "Khuyến mãi", path: "/admin/promotions", Icon: LocalOfferOutlinedIcon },
  { label: "Quảng cáo", path: "/admin/advertisements", Icon: CampaignOutlinedIcon },
  { label: "Thức ăn", path: "/admin/foods", Icon: RestaurantMenuOutlinedIcon },
  { label: "Combo", path: "/admin/combos", Icon: TapasOutlinedIcon },
  { label: "Vé", path: "/admin/bookings", Icon: ConfirmationNumberRoundedIcon },
  { label: "Quét vé", path: "/admin/ticket-scan", Icon: QrCodeScannerOutlinedIcon },
  { label: "Giá vé", path: "/admin/ticket-pricing", Icon: PaidOutlinedIcon },
  { label: "Người dùng", path: "/admin/users", Icon: GroupRoundedIcon, adminOnly: true },
  { label: "Nhân viên", path: "/admin/staff", Icon: ManageAccountsOutlinedIcon, adminOnly: true },

];

function Sidebar() {
  const auth = JSON.parse(localStorage.getItem("auth") || "{}");
  const role = String(auth.role || "").toUpperCase();

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <TheatersRoundedIcon />
        </div>

        <div className="brand-copy">
          <span>Quản trị rạp</span>
          <p>Hệ thống quản lý</p>
        </div>
      </div>

      <div className="sidebar-divider" />

      <nav className="sidebar-menu" aria-label="Điều hướng quản trị">
        {menuItems
          .filter((item) => !item.adminOnly || role === "ADMIN")
          .map(({ label, path, Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/admin"}
            title={label}
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
