import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { confirmVnpayReturn } from "../../api/paymentApi";
import "../../styles/client-home.css";

function VnpayReturnPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Đang xác nhận thanh toán VNPAY...");

  const params = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);

  useEffect(() => {
    confirmVnpayReturn(params)
      .then((response) => {
        const success = response.data?.success === true;
        setStatus(success ? "success" : "error");
        setMessage(response.data?.message || (success ? "Thanh toán thành công." : "Thanh toán không thành công."));
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error.response?.data?.message || "Không xác nhận được giao dịch VNPAY.");
      });
  }, [params]);

  return (
    <main className="verify-email-page">
      <section className={`verify-email-card ${status === "success" ? "success" : status === "error" ? "error" : ""}`}>
        <span className="verify-email-icon">{status === "success" ? "✓" : status === "error" ? "!" : "…"}</span>
        <h1>Kết quả thanh toán VNPAY</h1>
        <p>{message}</p>
        <Link to="/" className="verify-email-action">
          Về trang chủ
        </Link>
      </section>
    </main>
  );
}

export default VnpayReturnPage;
