import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const auth = JSON.parse(localStorage.getItem("auth") || "{}");
  const fullName = auth.fullName || localStorage.getItem("fullName") || "Admin";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header className="admin-header">
      <div className="header-search">
        <SearchRoundedIcon />
        <input aria-label="Tim kiem" placeholder="Tim kiem..." type="search" />
      </div>

      <div className="header-actions">
        <button className="icon-button" type="button" aria-label="Thong bao">
          <NotificationsRoundedIcon />
        </button>

        <div className="header-user">
          <span className="user-avatar">
            <PersonRoundedIcon />
          </span>
          <span>{fullName}</span>
        </div>

        <button className="logout-btn" onClick={handleLogout} type="button">
          <LogoutRoundedIcon />
          <span>Dang xuat</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
