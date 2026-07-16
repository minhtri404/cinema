import { useLocation } from "react-router-dom";
import ClientAuthModal from "./ClientAuthModal";
import ClientFooter from "./ClientFooter";
import ClientHeader from "../views/ClientHeader";
import ClientMovieFilter from "../views/ClientMovieFilter";
import "../../../../styles/client-home.css";

function ClientShell({ children, controller }) {
  const location = useLocation();
  const isSchedulePage = location.pathname === "/lich-chieu";

  return (
    <div className={`client-home ${isSchedulePage ? "client-theme-schedule" : "client-theme-warm"}`}>
      <ClientHeader controller={controller} />
      {children}
      <ClientMovieFilter controller={controller} />
      <ClientFooter />
      <ClientAuthModal
        authMode={controller.authMode}
        loginForm={controller.loginForm}
        setLoginForm={controller.setLoginForm}
        registerForm={controller.registerForm}
        setRegisterForm={controller.setRegisterForm}
        authError={controller.authError}
        authInfo={controller.authInfo}
        authLoading={controller.authLoading}
        closeAuthModal={controller.closeAuthModal}
        openAuthModal={controller.openAuthModal}
        handleLogin={controller.handleLogin}
        handleRegister={controller.handleRegister}
        setAuthInfo={controller.setAuthInfo}
      />
    </div>
  );
}

export default ClientShell;
