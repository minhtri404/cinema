import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAdvertisements } from "../../api/advertisementApi";
import { loginUser, logoutUser, registerUser } from "../../api/authApi";
import { getMovies } from "../../api/movieApi";
import "../../styles/client-home.css";

const fallbackBanners = [
  {
    id: "fallback-inception",
    title: "Inception",
    imageUrl:
      "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1600&q=85",
  },
];

const fallbackMovies = [
  {
    id: "oppenheimer",
    title: "OPPENHEIMER",
    duration: 70,
    genre: "Hành Động | Lịch Sử | Tâm Lý",
    director: "Christopher Nolan",
    ageRating: "C16",
    posterUrl:
      "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=520&q=80",
    status: "NOW_SHOWING",
  },
  {
    id: "blue-whale",
    title: "BLUE WHALE: THỬ THÁCH CÁ VOI XANH",
    duration: 100,
    genre: "Hành Động | Kinh Dị",
    director: "Anna Zaytseva",
    ageRating: "C18",
    posterUrl:
      "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=520&q=80",
    status: "NOW_SHOWING",
  },
  {
    id: "detective",
    title: "THANH TRA SÁT NHÂN",
    duration: 180,
    genre: "Hành Động",
    director: "Đang cập nhật",
    ageRating: "C16",
    posterUrl:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=520&q=80",
    status: "NOW_SHOWING",
  },
  {
    id: "fanti",
    title: "FANTI",
    duration: 140,
    genre: "Tâm Lý",
    director: "Đang cập nhật",
    ageRating: "C16",
    posterUrl:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=520&q=80",
    status: "NOW_SHOWING",
  },
];

const initialLoginForm = {
  email: "",
  password: "",
  remember: true,
};

const initialRegisterForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const formatDuration = (duration) => {
  if (!duration) return "Đang cập nhật";
  return `${duration} phút`;
};

const isAdvanceMovie = (movie) => {
  const status = String(movie.status || "").toUpperCase();
  if (status.includes("COMING")) return true;
  if (!movie.releaseDate) return false;
  return new Date(movie.releaseDate).getTime() > Date.now();
};

const getPoster = (movie) => {
  const value = movie.posterUrl || movie.imageUrl || movie.thumbnailUrl || movie.poster || "";
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("/")) return value;
  if (value.startsWith("uploads/") || value.startsWith("media/")) return `/${value}`;
  return value;
};

const getAgeRating = (movie) => movie.ageRating || movie.rating || movie.ageLimit || "C16";

const getAgeNumber = (rating) => String(rating).replace(/\D/g, "") || "16";

const readClientAuth = () => {
  try {
    const raw = localStorage.getItem("clientAuth") || sessionStorage.getItem("clientAuth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem("clientAuth");
    sessionStorage.removeItem("clientAuth");
    return null;
  }
};

const saveClientAuth = (auth, remember = true) => {
  const payload = JSON.stringify(auth);
  localStorage.removeItem("clientAuth");
  sessionStorage.removeItem("clientAuth");
  localStorage.removeItem("auth");
  sessionStorage.removeItem("auth");

  if (remember) {
    localStorage.setItem("clientAuth", payload);
    localStorage.setItem("auth", payload);
  } else {
    sessionStorage.setItem("clientAuth", payload);
    sessionStorage.setItem("auth", payload);
  }
};

const clearClientAuth = () => {
  localStorage.removeItem("clientAuth");
  sessionStorage.removeItem("clientAuth");
  localStorage.removeItem("auth");
  sessionStorage.removeItem("auth");
};

const errorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  return data?.message || fallback;
};

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [banners, setBanners] = useState([]);
  const [activeTab, setActiveTab] = useState("now");
  const [bannerIndex, setBannerIndex] = useState(0);
  const [auth, setAuth] = useState(readClientAuth);
  const [view, setView] = useState("home");
  const [authMode, setAuthMode] = useState(null);
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [authError, setAuthError] = useState("");
  const [authInfo, setAuthInfo] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.allSettled([getMovies(), getAdvertisements()]).then(([movieResult, adResult]) => {
      if (!active) return;

      if (movieResult.status === "fulfilled") {
        setMovies(movieResult.value.data || []);
      }

      if (adResult.status === "fulfilled") {
        const onlineHomeBanners = (adResult.value.data || []).filter(
          (ad) =>
            String(ad.status || "").toUpperCase() !== "OFFLINE" &&
            String(ad.placement || "").toUpperCase().includes("HOME") &&
            ad.imageUrl,
        );
        setBanners(onlineHomeBanners);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const displayBanners = banners.length > 0 ? banners : fallbackBanners;
  const currentBanner = displayBanners[bannerIndex % displayBanners.length];
  const displayMovies = movies.length > 0 ? movies : fallbackMovies;

  const filteredMovies = useMemo(() => {
    const list =
      activeTab === "now"
        ? displayMovies.filter((movie) => !isAdvanceMovie(movie))
        : displayMovies.filter(isAdvanceMovie);
    return list.length > 0 ? list : displayMovies.slice(0, 6);
  }, [activeTab, displayMovies]);

  const memberCode = useMemo(() => {
    const source = `${auth?.userId || ""}${auth?.fullName || ""}${auth?.email || ""}`;
    let hash = 0;
    for (let index = 0; index < source.length; index += 1) {
      hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
    }
    return String(900000000000000 + hash).slice(0, 15);
  }, [auth]);

  const changeBanner = (direction) => {
    setBannerIndex((current) => {
      const next = current + direction;
      if (next < 0) return displayBanners.length - 1;
      return next % displayBanners.length;
    });
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setAuthError("");
    setAuthInfo("");
  };

  const closeAuthModal = () => {
    if (authLoading) return;
    setAuthMode(null);
    setAuthError("");
    setAuthInfo("");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setAuthError("");
    setAuthInfo("");

    if (!loginForm.email.trim() || !loginForm.password) {
      setAuthError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    try {
      setAuthLoading(true);
      const response = await loginUser({
        email: loginForm.email.trim().toLowerCase(),
        password: loginForm.password,
      });
      const nextAuth = {
        ...response.data,
        email: response.data?.email || loginForm.email.trim().toLowerCase(),
      };
      saveClientAuth(nextAuth, loginForm.remember);
      setAuth(nextAuth);
      setAuthMode(null);
      setView("account");
    } catch (error) {
      setAuthError(errorMessage(error, "Đăng nhập thất bại."));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setAuthError("");
    setAuthInfo("");

    if (!registerForm.fullName.trim()) {
      setAuthError("Vui lòng nhập họ tên.");
      return;
    }
    if (!registerForm.email.includes("@")) {
      setAuthError("Email không hợp lệ.");
      return;
    }
    if (registerForm.password.length < 6) {
      setAuthError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setAuthError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setAuthLoading(true);
      const response = await registerUser({
        fullName: registerForm.fullName.trim(),
        email: registerForm.email.trim().toLowerCase(),
        phone: registerForm.phone.trim(),
        password: registerForm.password,
      });
      setRegisterForm(initialRegisterForm);
      setAuthInfo(
        response.data?.message ||
          "Đăng ký thành công. Vui lòng kiểm tra email và bấm link kích hoạt để xác nhận thành viên.",
      );
    } catch (error) {
      setAuthError(errorMessage(error, "Đăng ký thất bại."));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (auth?.refreshToken) {
        await logoutUser(auth.refreshToken);
      }
    } catch {
      // Client cleanup is still required even if server logout fails.
    } finally {
      clearClientAuth();
      setAuth(null);
      setView("home");
    }
  };

  const renderHome = () => (
    <main className="client-main">
      <section className="client-hero" aria-label="Banner phim">
        <button type="button" className="hero-arrow left" onClick={() => changeBanner(-1)}>
          ‹
        </button>
        <img src={currentBanner.imageUrl} alt={currentBanner.title || "Cinema banner"} />
        <button type="button" className="hero-arrow right" onClick={() => changeBanner(1)}>
          ›
        </button>
      </section>

      <section className="client-movies" id="movies">
        <div className="movie-tabs">
          <button
            type="button"
            className={activeTab === "now" ? "active" : ""}
            onClick={() => setActiveTab("now")}
          >
            Phim đang chiếu
          </button>
          <button
            type="button"
            className={activeTab === "coming" ? "active" : ""}
            onClick={() => setActiveTab("coming")}
          >
            Phim sắp chiếu
          </button>
          <button
            type="button"
            className={activeTab === "advance" ? "active" : ""}
            onClick={() => setActiveTab("advance")}
          >
            Vé Bán Trước
          </button>
          <button type="button" className="filter-toggle">
            <span aria-hidden="true">▼</span> Bộ lọc
          </button>
        </div>

        <div className="client-movie-grid">
          {filteredMovies.map((movie) => {
            const rating = getAgeRating(movie);
            return (
              <article className="client-movie-card" key={movie.id}>
                <div className="movie-poster">
                  {getPoster(movie) ? <img src={getPoster(movie)} alt={movie.title} /> : <span>No Image</span>}
                </div>

                <div className="movie-info">
                  <h3>{movie.title}</h3>
                  <p className="duration">{formatDuration(movie.duration)}</p>
                  <p>
                    Thể loại: <a href="#movies">{movie.genre || "Đang cập nhật"}</a>
                  </p>
                  <p>Đạo diễn: {movie.director || "Đang cập nhật"}</p>
                  <p>Diễn viên: {movie.cast || movie.actors || "Đang cập nhật"}</p>
                  <p className="movie-rating">
                    Rated: <span>{rating}</span> - PHIM ĐƯỢC PHỔ BIẾN ĐẾN NGƯỜI XEM TỪ ĐỦ{" "}
                    {getAgeNumber(rating)} TUỔI TRỞ LÊN ({getAgeNumber(rating)}+)
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="client-placeholder" id="schedule">
        <h2>Lịch chiếu phim</h2>
        <p>Chọn phim và suất chiếu để đặt vé nhanh tại HMCinema.</p>
      </section>

      <section className="client-placeholder" id="news">
        <h2>Tin tức / Sự kiện</h2>
        <p>Cập nhật khuyến mãi, sự kiện điện ảnh và thông tin rạp mới nhất.</p>
      </section>
    </main>
  );

  const renderAccount = () => (
    <main className="client-account-page">
      <section className="account-card">
        <aside className="account-sidebar">
          <h2>{auth?.fullName || "Thành viên"}</h2>
          <button type="button" className="active">
            🏠 Tài khoản
          </button>
          <button type="button">🔑 Mật khẩu</button>
          <button type="button">↺ Lịch sử giao dịch</button>
        </aside>

        <div className="account-content">
          <div className="member-card">
            <h1>Thẻ thành viên</h1>
            <div className="barcode" aria-label="Mã thành viên">
              {Array.from({ length: 36 }).map((_, index) => (
                <span key={index} style={{ width: index % 4 === 0 ? 4 : 2 }} />
              ))}
            </div>
            <p>{memberCode}</p>
          </div>

          <div className="profile-form">
            <label>
              <span>Họ tên</span>
              <input value={auth?.fullName || ""} readOnly />
            </label>

            <div className="profile-row">
              <label>
                <span>Email</span>
                <input value={auth?.email || ""} readOnly />
              </label>
              <label>
                <span>Số điện thoại</span>
                <input value={auth?.phone || ""} readOnly />
              </label>
            </div>

            {auth?.emailVerified === false && (
              <p className="verify-note">Vui lòng kích hoạt email để nhận các ưu đãi từ HMCinema!</p>
            )}
          </div>

          <div className="member-stats">
            <div>
              <strong>Cấp độ thẻ</strong>
              <span>Member</span>
            </div>
            <div>
              <strong>Tổng chi tiêu</strong>
              <span>0 VNĐ</span>
            </div>
            <div>
              <strong>Điểm</strong>
              <span>0 P</span>
            </div>
          </div>

          <button type="button" className="account-update">
            Cập nhật
          </button>
        </div>
      </section>
    </main>
  );

  return (
    <div className="client-home">
      <header className="client-header">
        <div className="client-nav-wrap">
          <Link to="/" className="client-brand" onClick={() => setView("home")}>
            HMCinema
          </Link>

          <nav className="client-nav" aria-label="Điều hướng khách hàng">
            <button type="button" onClick={() => setView("home")}>
              TÌM KIẾM THEO BỘ LỌC
            </button>
            <a href="#schedule" onClick={() => setView("home")}>
              TÌM KIẾM THEO LỊCH CHIẾU
            </a>
            <a href="#news" onClick={() => setView("home")}>
              TIN TỨC/SỰ KIỆN
            </a>
            <a href="#support">LIÊN HỆ/HỖ TRỢ</a>
          </nav>

          <div className="client-actions">
            {auth ? (
              <>
                <button type="button" className="client-user-link" onClick={() => setView("account")}>
                  ▣ {auth.fullName || "Tài khoản"}
                </button>
                <button type="button" className="client-logout-link" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <button type="button" className="client-login-link" onClick={() => openAuthModal("login")}>
                Đăng Nhập
              </button>
            )}
            <span>Ngôn ngữ:</span>
            <span className="flag-vn">★</span>
          </div>
        </div>
      </header>

      {view === "account" && auth ? renderAccount() : renderHome()}

      <footer className="client-footer" id="support">
        <div>© HMCinema</div>
        <div>Liên hệ / Hỗ trợ khách hàng</div>
      </footer>

      {authMode && (
        <div className="client-auth-overlay" onMouseDown={closeAuthModal}>
          <div className="client-auth-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="auth-modal-head">
              <h2>{authMode === "login" ? "ĐĂNG NHẬP" : "ĐĂNG KÝ"}</h2>
              <button type="button" onClick={closeAuthModal} aria-label="Đóng">
                ×
              </button>
            </div>

            {authMode === "login" ? (
              <form className="client-auth-form" onSubmit={handleLogin}>
                <input
                  type="email"
                  placeholder="Email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                  autoFocus
                />
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                />
                <label className="remember-row">
                  <input
                    type="checkbox"
                    checked={loginForm.remember}
                    onChange={(event) => setLoginForm((current) => ({ ...current, remember: event.target.checked }))}
                  />
                  <span>Nhớ mật khẩu</span>
                </label>

                {authError && <p className="auth-error">{authError}</p>}
                {authInfo && <p className="auth-info">{authInfo}</p>}

                <button type="submit" className="auth-submit" disabled={authLoading}>
                  {authLoading ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP"}
                </button>

                <p className="auth-switch">
                  Chưa có tài khoản ?{" "}
                  <button type="button" onClick={() => openAuthModal("register")}>
                    Đăng Ký
                  </button>
                </p>
                <button
                  type="button"
                  className="forgot-password"
                  onClick={() => setAuthInfo("Chức năng quên mật khẩu sẽ được bổ sung sau.")}
                >
                  Quên mật khẩu?
                </button>
              </form>
            ) : (
              <form className="client-auth-form" onSubmit={handleRegister}>
                <input
                  placeholder="Họ tên"
                  value={registerForm.fullName}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, fullName: event.target.value }))}
                  autoFocus
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={registerForm.email}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                />
                <input
                  placeholder="Số điện thoại"
                  value={registerForm.phone}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, phone: event.target.value }))}
                />
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  value={registerForm.password}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                />
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={registerForm.confirmPassword}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, confirmPassword: event.target.value }))
                  }
                />

                {authError && <p className="auth-error">{authError}</p>}
                {authInfo && (
                  <div className="register-success-box">
                    <strong>Đăng ký thành công!</strong>
                    <span>{authInfo}</span>
                    <small>Nếu chưa thấy email, hãy kiểm tra mục Spam/Thư rác.</small>
                  </div>
                )}

                <button type="submit" className="auth-submit" disabled={authLoading}>
                  {authLoading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ"}
                </button>

                <p className="auth-switch">
                  Đã có tài khoản ?{" "}
                  <button type="button" onClick={() => openAuthModal("login")}>
                    Đăng Nhập
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
