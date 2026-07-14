import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../../api/authApi";
import "../../styles/client-home.css";

const saveClientAuth = (auth) => {
  const payload = JSON.stringify(auth);
  localStorage.setItem("clientAuth", payload);
  localStorage.setItem("auth", payload);
  sessionStorage.removeItem("clientAuth");
  sessionStorage.removeItem("auth");
};

const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  return data?.message || "Kích hoạt tài khoản thất bại.";
};

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Đang kích hoạt tài khoản...");
  const verifyingTokenRef = useRef("");

  useEffect(() => {
    const token = searchParams.get("token")?.trim();
    if (!token) {
      setStatus("error");
      setMessage("Thiếu mã kích hoạt email.");
      return;
    }

    if (verifyingTokenRef.current === token) {
      return;
    }

    verifyingTokenRef.current = token;

    verifyEmail(token)
      .then((response) => {
        saveClientAuth(response.data);
        setStatus("success");
        setMessage(response.data?.message || "Kích hoạt tài khoản thành công.");
      })
      .catch((error) => {
        verifyingTokenRef.current = "";
        setStatus("error");
        setMessage(getErrorMessage(error));
      });
  }, [searchParams]);

  return (
    <div className="client-home">
      <header className="client-header">
        <div className="client-nav-wrap">
          <Link to="/" className="client-brand">
            HMCinema
          </Link>
        </div>
      </header>

      <main className="verify-email-page">
        <section className={`verify-email-card ${status}`}>
          <span className="verify-email-icon">{status === "success" ? "✓" : status === "error" ? "!" : "…"}</span>
          <h1>Kích hoạt thành viên</h1>
          <p>{message}</p>
          <Link to="/" className="verify-email-action">
            Về trang chủ
          </Link>
        </section>
      </main>
    </div>
  );
}

export default VerifyEmailPage;
