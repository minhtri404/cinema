function ClientAuthModal({
  authMode,
  loginForm,
  setLoginForm,
  registerForm,
  setRegisterForm,
  authError,
  authInfo,
  authLoading,
  closeAuthModal,
  openAuthModal,
  handleLogin,
  handleRegister,
  setAuthInfo,
}) {
  if (!authMode) return null;

  return (
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
  );
}

export default ClientAuthModal;
