import Sidebar from "./Sidebar";
import Header from "./Header";
import "../../styles/layout.css";

function AdminLayout({ children }) {
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