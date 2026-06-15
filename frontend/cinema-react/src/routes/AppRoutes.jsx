import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import AdminLayout from "../components/layout/AdminLayout";
import MovieListPage from "../features/movies/pages/MovieListPage";

const withAdminLayout = (page) => <AdminLayout>{page}</AdminLayout>;

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={withAdminLayout(<DashboardPage />)} />
        <Route path="/admin/movies" element={withAdminLayout(<MovieListPage />)} />
        <Route path="/admin/showtimes" element={withAdminLayout(<DashboardPage />)} />
        <Route path="/admin/bookings" element={withAdminLayout(<DashboardPage />)} />
        <Route path="/admin/users" element={withAdminLayout(<DashboardPage />)} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
