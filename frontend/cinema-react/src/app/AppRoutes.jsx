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
import RoomListPage from "../pages/admin/rooms/RoomListPage";
import SeatMapPage from "../pages/admin/seats/SeatMapPage";
import ShowtimePage from "../pages/admin/showtimes/ShowtimePage";
import TicketPricingPage from "../pages/admin/ticket-pricing/TicketPricingPage";
import EventPage from "../pages/admin/events/EventPage";
import NewsPage from "../pages/admin/news/NewsPage";
import PromotionPage from "../pages/admin/promotions/PromotionPage";
import FoodPage from "../pages/admin/foods/FoodPage";
import ComboPage from "../pages/admin/combos/ComboPage";
import StaffPage from "../pages/admin/staff/StaffPage";
import UserPage from "../pages/admin/users/UserPage";
import BookingPage from "../pages/admin/bookings/BookingPage";
const withAdminLayout = (page) => <AdminLayout>{page}</AdminLayout>;

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={withAdminLayout(<AdminDashboardPage />)} />
        <Route path="/admin/movies" element={withAdminLayout(<MovieListPage />)} />
        <Route path="/admin/movies/create" element={withAdminLayout(<MovieCreatePage />)} />
        <Route path="/admin/movies/edit/:id" element={withAdminLayout(<MovieEditPage />)} />
        <Route path="/admin/showtimes" element={withAdminLayout(<ShowtimePage />)} />
        <Route path="/admin/events" element={withAdminLayout(<EventPage />)} />
        <Route path="/admin/news" element={withAdminLayout(<NewsPage />)} />
        <Route path="/admin/promotions" element={withAdminLayout(<PromotionPage />)} />
        <Route path="/admin/foods" element={withAdminLayout(<FoodPage />)} />
        <Route path="/admin/combos" element={withAdminLayout(<ComboPage />)} />
        <Route path="/admin/bookings" element={withAdminLayout(<BookingPage />)} />
        <Route path="/admin/users" element={withAdminLayout(<UserPage />)} />
        <Route path="/admin/staff" element={withAdminLayout(<StaffPage />)} />
        <Route path="/admin/genres" element={withAdminLayout(<GenreListPage />)} />
        <Route path="/admin/genres/create" element={withAdminLayout(<GenreCreatePage />)} />
        <Route path="/admin/genres/edit/:id" element={withAdminLayout(<GenreEditPage />)} />
        <Route path="/admin/theaters" element={withAdminLayout(<TheaterListPage />)} />
        <Route path="/admin/rooms" element={withAdminLayout(<RoomListPage />)} />
        <Route path="/admin/rooms/:roomId/seats" element={withAdminLayout(<SeatMapPage />)} />
        <Route path="/admin/seats" element={withAdminLayout(<SeatMapPage />)} />
        <Route path="/admin/ticket-pricing" element={<TicketPricingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
