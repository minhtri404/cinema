import TheatersRoundedIcon from "@mui/icons-material/TheatersRounded";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../../api/authApi";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginAdmin({ email, password });
      localStorage.setItem("auth", JSON.stringify(response.data));
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Dang nhap that bai");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-screen">
      <section className="login-panel">
        <div className="login-brand">
          <span className="login-brand-mark">
            <TheatersRoundedIcon />
          </span>
          <div>
            <h1>Cinema </h1>
    
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="login-label" htmlFor="email">
              Tai khoan
            </label>
            <input
              id="email"
              className="login-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="mb-4">
            <div className="d-flex align-items-center justify-content-between">
              <label className="login-label" htmlFor="password">
                Mat khau
              </label>
              <button className="forgot-link" type="button">
                Quen mat khau?
              </button>
            </div>
            <input
              id="password"
              className="login-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Dang dang nhap..." : "Dang nhap"}
          </button>

          <p className="register-text">
            Chua co tai khoan? <button type="button">Dang ky ngay</button>
          </p>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
