import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import AdminDashboardPage from "../pages/admin/dashboard/AdminDashboardPage";
import AdminLayout from "../layouts/admin/AdminLayout";
import MovieCreatePage from "../pages/admin/movies/MovieCreatePage";
import MovieEditPage from "../pages/admin/movies/MovieEditPage";
import MovieListPage from "../pages/admin/movies/MovieListPage";
import GenreListPage from "../pages/admin/genres/GenreListPage";
import GenreCreatePage from "../pages/admin/genres/GenreCreatePage";
import GenreEditPage from "../pages/admin/genres/GenreEditPage";
import TheaterListPage from "../pages/admin/theaters/TheaterListPage";
const withAdminLayout = (page) => <AdminLayout>{page}</AdminLayout>;

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={withAdminLayout(<AdminDashboardPage />)} />
        <Route path="/admin/movies" element={withAdminLayout(<MovieListPage />)} />
        <Route path="/admin/movies/create" element={<MovieCreatePage />} />
        <Route path="/admin/movies/edit/:id" element={<MovieEditPage />} />
        <Route path="/admin/showtimes" element={withAdminLayout(<AdminDashboardPage />)} />
        <Route path="/admin/bookings" element={withAdminLayout(<AdminDashboardPage />)} />
        <Route path="/admin/users" element={withAdminLayout(<AdminDashboardPage />)} />
        <Route path="/admin/genres" element={withAdminLayout(<GenreListPage />)} />
        <Route path="/admin/genres/create" element={withAdminLayout(<GenreCreatePage />)} />
        <Route path="/admin/genres/edit/:id" element={withAdminLayout(<GenreEditPage />)} />
        <Route path="/admin/theaters" element={withAdminLayout(<TheaterListPage />)} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
