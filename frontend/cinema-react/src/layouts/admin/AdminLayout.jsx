import Sidebar from "./AdminSidebar";
import Header from "./AdminHeader";
import { Navigate } from "react-router-dom";
import "./adminLayout.css";

function AdminLayout({ children }) {
  const auth = JSON.parse(localStorage.getItem("auth") || sessionStorage.getItem("auth") || "{}");
  const role = String(auth.role || "").toUpperCase();

  if (!auth.accessToken && !auth.token && !auth.jwtToken && !auth.jwt && !auth.bearerToken) {
    return <Navigate to="/login" replace />;
  }

  if (!["ADMIN", "STAFF"].includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-page">
        <Header />

        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
