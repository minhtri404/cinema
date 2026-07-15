import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../pages/client/HomePage";
import VerifyEmailPage from "../pages/client/VerifyEmailPage";
import VnpayReturnPage from "../pages/client/VnpayReturnPage";
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
import BookingPage from "../pages/admin/bookings/BookingPage";
import UserPage from "../pages/admin/users/UserPage";
import FoodPage from "../pages/admin/foods/FoodPage";
import ComboPage from "../pages/admin/combos/ComboPage";
import StaffPage from "../pages/admin/staff/StaffPage";
import AdvertisementPage from "../pages/admin/advertisements/AdvertisementPage";
import TicketScanPage from "../pages/admin/ticket-scan/TicketScanPage";
const withAdminLayout = (page) => <AdminLayout>{page}</AdminLayout>;

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/payment/vnpay-return" element={<VnpayReturnPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={withAdminLayout(<AdminDashboardPage />)} />
        <Route path="/admin/movies" element={withAdminLayout(<MovieListPage />)} />
        <Route path="/admin/movies/create" element={<MovieCreatePage />} />
        <Route path="/admin/movies/edit/:id" element={<MovieEditPage />} />
        <Route path="/admin/showtimes" element={withAdminLayout(<ShowtimePage />)} />
        <Route path="/admin/events" element={withAdminLayout(<EventPage />)} />
        <Route path="/admin/news" element={withAdminLayout(<NewsPage />)} />
        <Route path="/admin/promotions" element={withAdminLayout(<PromotionPage />)} />
        <Route path="/admin/advertisements" element={withAdminLayout(<AdvertisementPage />)} />
        <Route path="/admin/foods" element={withAdminLayout(<FoodPage />)} />
        <Route path="/admin/combos" element={withAdminLayout(<ComboPage />)} />
        <Route path="/admin/bookings" element={withAdminLayout(<BookingPage />)} />
        <Route path="/admin/ticket-scan" element={withAdminLayout(<TicketScanPage />)} />
        <Route path="/admin/users" element={withAdminLayout(<UserPage />)} />
        <Route path="/admin/staff" element={withAdminLayout(<StaffPage />)} />
        <Route path="/admin/genres" element={<GenreListPage />} />
        <Route path="/admin/genres/create" element={<GenreCreatePage />} />
        <Route path="/admin/genres/edit/:id" element={<GenreEditPage />} />
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
