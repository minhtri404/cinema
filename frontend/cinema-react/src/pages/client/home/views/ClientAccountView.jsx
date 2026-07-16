import ClientTransactionHistory from "../components/ClientTransactionHistory";

function ClientAccountView({ controller }) {
  const {
    accountTab,
    auth,
    handleResendVerificationEmail,
    memberCode,
    setAccountTab,
    verificationMessage,
    verificationSending,
  } = controller;

  return (
    <main className="client-account-page">
      <section className="account-card">
        <aside className="account-sidebar">
          <h2>{auth?.fullName || "Thành viên"}</h2>
          <button type="button" className={accountTab === "profile" ? "active" : ""} onClick={() => setAccountTab("profile")}>
            🏠 Tài khoản
          </button>
          <button type="button" className={accountTab === "password" ? "active" : ""} onClick={() => setAccountTab("password")}>🔑 Mật khẩu</button>
          <button type="button" className={accountTab === "history" ? "active" : ""} onClick={() => setAccountTab("history")}>↺ Lịch sử giao dịch</button>
        </aside>

        <div className="account-content">
          {accountTab === "profile" && (
            <>
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
                <label><span>Họ tên</span><input value={auth?.fullName || ""} readOnly /></label>
                <div className="profile-row">
                  <label><span>Email</span><input value={auth?.email || ""} readOnly /></label>
                  <label><span>Số điện thoại</span><input value={auth?.phone || ""} readOnly /></label>
                </div>

                {auth?.emailVerified === false && (
                  <div className="verify-note">
                    <div>
                      <strong>Xác nhận email để nhận ưu đãi</strong>
                      <span>Bạn vẫn có thể dùng website bình thường. Email chỉ cần xác nhận khi muốn nhận khuyến mãi và ưu đãi thành viên.</span>
                    </div>
                    <button type="button" onClick={handleResendVerificationEmail} disabled={verificationSending}>
                      {verificationSending ? "Đang gửi..." : "Gửi email xác nhận"}
                    </button>
                  </div>
                )}
                {verificationMessage && <p className="verify-message">{verificationMessage}</p>}
              </div>

              <div className="member-stats">
                <div><strong>Cấp độ thẻ</strong><span>Thành viên</span></div>
                <div><strong>Tổng chi tiêu</strong><span>0 VNĐ</span></div>
                <div><strong>Điểm</strong><span>0 P</span></div>
              </div>
              <button type="button" className="account-update">Cập nhật</button>
            </>
          )}

          {accountTab === "password" && (
            <section className="account-password-placeholder">
              <h2>Đổi mật khẩu</h2>
              <p>Chức năng đổi mật khẩu sẽ được cấu hình ở bước tài khoản tiếp theo.</p>
            </section>
          )}
          {accountTab === "history" && <ClientTransactionHistory auth={auth} />}
        </div>
      </section>
    </main>
  );
}

export default ClientAccountView;
