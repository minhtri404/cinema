import { Link } from "react-router-dom";
import ClientMovieCard from "../components/ClientMovieCard";
import {
  formatShowtimeTime,
  movieMatchesTab,
  normalizeClientText,
  parseLocalDate,
} from "../clientHomeUtils";

function MovieCollection({ eyebrow, movies, onOpen, title, viewAll }) {
  return (
    <section className="home-catalog-section">
      <div className="home-catalog-heading">
        <div><span>{eyebrow}</span><h2>{title}</h2></div>
        <Link to={viewAll}>Xem tất cả <span aria-hidden="true">↗</span></Link>
      </div>
      <div className="home-catalog-grid">
        {movies.map((movie) => <ClientMovieCard key={movie.id} movie={movie} onOpen={onOpen} />)}
      </div>
    </section>
  );
}

function ClientHomeView({ controller }) {
  const {
    bannerIndex,
    changeBanner,
    currentBanner,
    displayBanners,
    displayMovies,
    openBookingFlow,
    openMovieDetail,
    quickDates,
    quickShowtimes,
    scheduleMovies,
    selectedQuickDate,
    selectedQuickMovie,
    selectedQuickShowtime,
    setBannerIndex,
    setQuickDate,
    setQuickMovieId,
    setQuickShowtimeId,
    theaterMap,
  } = controller;

  const recommendedMovies = displayMovies.slice(0, 5);
  const nowShowingMovies = displayMovies.filter((movie) => movieMatchesTab(movie, "now")).slice(0, 8);
  const comingSoonMovies = displayMovies.filter((movie) => movieMatchesTab(movie, "coming")).slice(0, 5);
  const currentMovies = nowShowingMovies.length > 0 ? nowShowingMovies : displayMovies.slice(0, 8);
  const upcomingMovies = comingSoonMovies.length > 0 ? comingSoonMovies : displayMovies.slice(-5);

  return (
    <main className="client-main home-landing">
      <section className="client-hero" aria-label="Banner phim">
        <button type="button" className="hero-arrow left" onClick={() => changeBanner(-1)}>‹</button>
        {currentBanner.imageUrl ? <img src={currentBanner.imageUrl} alt={currentBanner.title || "Ảnh quảng bá rạp chiếu"} /> : <div className="hero-art-fallback" aria-hidden="true"><span>HM</span></div>}
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-caption">
          <span>HMCinema / Đề cử hôm nay</span>
          <strong>{currentBanner.title || "Mỗi bộ phim, một trải nghiệm đáng nhớ"}</strong>
          <p>Những câu chuyện nổi bật đang chờ bạn trên màn ảnh lớn.</p>
          <div className="hero-actions"><Link to="/lich-chieu">Mua vé ngay</Link><Link to="/phim" className="secondary">Khám phá phim</Link></div>
        </div>
        <button type="button" className="hero-arrow right" onClick={() => changeBanner(1)}>›</button>
        {displayBanners.length > 1 && <div className="hero-dots" aria-label="Chọn banner">{displayBanners.map((banner, index) => (
          <button key={banner.id || banner.imageUrl || index} type="button" className={index === bannerIndex % displayBanners.length ? "active" : ""} aria-label={`Ảnh quảng bá ${index + 1}`} onClick={() => setBannerIndex(index)} />
        ))}</div>}
      </section>

      <section className="quick-booking" id="quick-booking" aria-labelledby="quick-booking-title">
        <div className="quick-booking-heading"><span>01 / Đặt vé</span><h2 id="quick-booking-title">Mua vé nhanh</h2></div>
        <div className="quick-booking-fields">
          <label><span>Chọn phim</span><select value={selectedQuickMovie?.id || ""} onChange={(event) => { setQuickMovieId(event.target.value); setQuickDate(""); setQuickShowtimeId(""); }} disabled={scheduleMovies.length === 0}>
            {scheduleMovies.length === 0 ? <option value="">Chưa có phim</option> : scheduleMovies.map((movie) => <option key={movie.id} value={movie.id}>{normalizeClientText(movie.title)}</option>)}
          </select></label>
          <label><span>Chọn ngày</span><select value={selectedQuickDate} onChange={(event) => { setQuickDate(event.target.value); setQuickShowtimeId(""); }} disabled={quickDates.length === 0}>
            {quickDates.length === 0 ? <option value="">Chưa có lịch</option> : quickDates.map((date) => <option key={date} value={date}>{parseLocalDate(date).toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" })}</option>)}
          </select></label>
          <label><span>Chọn suất</span><select value={selectedQuickShowtime?.id || ""} onChange={(event) => setQuickShowtimeId(event.target.value)} disabled={quickShowtimes.length === 0}>
            {quickShowtimes.length === 0 ? <option value="">Chưa có suất</option> : quickShowtimes.map((showtime) => <option key={showtime.id} value={showtime.id}>{formatShowtimeTime(showtime.startTime)} · {theaterMap.get(Number(showtime.theaterId))?.name || "HMCinema"}</option>)}
          </select></label>
          <button type="button" className="quick-booking-submit" disabled={!selectedQuickShowtime} onClick={() => openBookingFlow(selectedQuickShowtime, selectedQuickMovie)}>Đặt vé <span aria-hidden="true">↗</span></button>
        </div>
      </section>

      <div className="home-catalog-shell">
        <MovieCollection eyebrow="HMCinema đề cử" title="Phim nổi bật" movies={recommendedMovies} onOpen={openMovieDetail} viewAll="/phim" />
        <MovieCollection eyebrow="Mới cập nhật" title="Phim đang chiếu" movies={currentMovies} onOpen={openMovieDetail} viewAll="/phim" />
        <MovieCollection eyebrow="Sắp ra mắt" title="Phim sắp chiếu" movies={upcomingMovies} onOpen={openMovieDetail} viewAll="/phim" />
      </div>

      <section className="home-schedule-cta">
        <div><span>Không bỏ lỡ suất chiếu</span><h2>Chọn phim.<br />Chọn giờ.<br />Tận hưởng.</h2></div>
        <Link to="/lich-chieu">Xem toàn bộ lịch chiếu <span aria-hidden="true">↗</span></Link>
      </section>
    </main>
  );
}

export default ClientHomeView;
