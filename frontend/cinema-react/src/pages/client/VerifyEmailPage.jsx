import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../../api/authApi";
import "../../styles/client-home.css";

const saveClientAuth = (auth) => {
  const payload = JSON.stringify(auth);
  localStorage.setItem("clientAuth", payload);
  sessionStorage.removeItem("clientAuth");
};

const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  return data?.message || "Xác nhận email thất bại.";
};

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Đang xác nhận email...");
  const verifyingTokenRef = useRef("");

  useEffect(() => {
    const token = searchParams.get("token")?.trim();
    if (!token) {
      setStatus("error");
      setMessage("Thiếu mã xác nhận email.");
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
        setMessage(response.data?.message || "Xác nhận email thành công. Mã ưu đãi MEMBER20 đã được gửi qua email.");
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
          <h1>Xác nhận email nhận ưu đãi</h1>
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
