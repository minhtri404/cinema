import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

function ClientHeader({ controller }) {
  const navigate = useNavigate();
  const navRef = useRef(null);
  const [openCatalogMenu, setOpenCatalogMenu] = useState(null);
  const {
    applyHeaderMovieFilter,
    auth,
    availableGenres,
    availableReleaseYears,
    handleLogout,
    menuOpen,
    openAuthModal,
    openFilterPanel,
    resetMovieFilters,
    setActiveTab,
    setMenuOpen,
    setView,
  } = controller;

  const navigateHome = () => {
    setView("home");
    setMenuOpen(false);
    setOpenCatalogMenu(null);
  };

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!navRef.current?.contains(event.target)) setOpenCatalogMenu(null);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpenCatalogMenu(null);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const openMoviesPage = () => {
    resetMovieFilters();
    setActiveTab("now");
    navigateHome();
  };

  const handleHeaderFilter = (type, value) => {
    if (!value) return;
    applyHeaderMovieFilter(type, value);
    setOpenCatalogMenu(null);
    const queryKey = type === "genre" ? "genre" : "year";
    navigate(`/phim?${queryKey}=${encodeURIComponent(value)}`);
  };

  return (
    <header className="client-header">
      <div className="client-topbar">
        <span>Điện ảnh được tuyển chọn cho bạn</span>
        <span>Hotline 1900 2026 · 08:00 — 22:00</span>
      </div>
      <div className="client-nav-wrap">
        <Link to="/" className="client-brand" onClick={navigateHome}>
          <span className="client-brand-mark">HM</span>
          <span>HMCinema</span>
        </Link>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span />
          <span />
        </button>

        <nav ref={navRef} className={`client-nav ${menuOpen ? "open" : ""}`} aria-label="Điều hướng khách hàng">
          <NavLink to="/" end onClick={navigateHome}>Trang chủ</NavLink>
          <NavLink to="/phim" onClick={openMoviesPage}>Phim</NavLink>
          <div className={`client-nav-dropdown ${openCatalogMenu === "genre" ? "open" : ""}`}>
            <button
              type="button"
              className="client-nav-dropdown-trigger"
              aria-expanded={openCatalogMenu === "genre"}
              onClick={() => setOpenCatalogMenu((current) => current === "genre" ? null : "genre")}
            >
              Thể loại <span aria-hidden="true">⌄</span>
            </button>
            <div className="client-mega-menu genre-menu" aria-hidden={openCatalogMenu !== "genre"}>
              <div className="client-mega-menu-title"><span>Khám phá theo</span><strong>Thể loại phim</strong></div>
              <div className="client-mega-menu-grid genre-grid">
                {availableGenres.map((genre) => (
                  <button type="button" key={genre} onClick={() => handleHeaderFilter("genre", genre)}>{genre}</button>
                ))}
              </div>
            </div>
          </div>
          <div className={`client-nav-dropdown ${openCatalogMenu === "year" ? "open" : ""}`}>
            <button
              type="button"
              className="client-nav-dropdown-trigger"
              aria-expanded={openCatalogMenu === "year"}
              onClick={() => setOpenCatalogMenu((current) => current === "year" ? null : "year")}
            >
              Năm phát hành <span aria-hidden="true">⌄</span>
            </button>
            <div className="client-mega-menu year-menu" aria-hidden={openCatalogMenu !== "year"}>
              <div className="client-mega-menu-title"><span>Khám phá theo</span><strong>Năm phát hành</strong></div>
              <div className="client-mega-menu-grid year-grid">
                {availableReleaseYears.map((year) => (
                  <button type="button" key={year} onClick={() => handleHeaderFilter("year", year)}>{year}</button>
                ))}
              </div>
            </div>
          </div>
          <NavLink to="/lich-chieu" onClick={navigateHome}>Lịch chiếu</NavLink>
          <NavLink to="/uu-dai" onClick={navigateHome}>Ưu đãi & Tin tức</NavLink>
          <NavLink to="/lien-he" onClick={navigateHome}>Liên hệ</NavLink>
        </nav>

        <div className="client-actions">
          <button type="button" className="client-search-button" onClick={openFilterPanel} aria-label="Tìm kiếm phim">
            ⌕
          </button>
          {auth ? (
            <>
              <button type="button" className="client-user-link" onClick={() => setView("account")}>
                ▣ {auth.fullName || "Tài khoản"}
              </button>
              <button type="button" className="client-logout-link" onClick={handleLogout}>Đăng xuất</button>
            </>
          ) : (
            <button type="button" className="client-login-link" onClick={() => openAuthModal("login")}>
              Đăng nhập
            </button>
          )}
          <Link className="client-ticket-link" to="/lich-chieu" onClick={navigateHome}>Mua vé</Link>
        </div>
      </div>
    </header>
  );
}

export default ClientHeader;
