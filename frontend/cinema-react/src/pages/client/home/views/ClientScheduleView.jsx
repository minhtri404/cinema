import Pagination from "../../../../components/common/Pagination";
import usePagination from "../../../../hooks/usePagination";
import {
  formatDuration,
  formatShowtimeTime,
  getAgeDescription,
  getAgeRating,
  getPoster,
  getTrailerEmbedUrl,
  normalizeClientText,
} from "../clientHomeUtils";

function ClientScheduleView({ controller }) {
  const {
    hasScheduleData,
    hasSelectedScheduleTarget,
    openBookingFlow,
    scheduleDates,
    scheduleGroups,
    scheduleMode,
    scheduleMovies,
    scheduleTheaters,
    selectedScheduleDate,
    selectedScheduleMovie,
    selectedScheduleTheater,
    setScheduleMode,
    setSelectedScheduleDate,
    setSelectedScheduleMovieId,
    setSelectedScheduleTheaterId,
  } = controller;
  const pagination = usePagination(scheduleGroups, 6);

  return (
    <main className="client-route-main schedule-route">
      <header className="client-page-intro dark">
        <span>HMCinema / Suất chiếu</span>
        <h1>Lịch chiếu</h1>
        <p>Chọn phim, cụm rạp và thời gian phù hợp để bắt đầu hành trình điện ảnh của bạn.</p>
      </header>

      <section className="client-schedule route-schedule">
        <div className="schedule-tabs">
          <button type="button" className={scheduleMode === "movie" ? "active" : ""} onClick={() => setScheduleMode("movie")}>Lịch chiếu theo phim</button>
          <button type="button" className={scheduleMode === "theater" ? "active" : ""} onClick={() => setScheduleMode("theater")}>Lịch chiếu theo rạp</button>
        </div>

        {!hasScheduleData ? <div className="schedule-empty">Chưa có lịch chiếu từ hệ thống.</div> : scheduleMode === "movie" ? (
          <>
            <div className="schedule-movie-strip">{scheduleMovies.map((movie) => (
              <button key={movie.id} type="button" className={Number(selectedScheduleMovie?.id) === Number(movie.id) ? "active" : ""} onClick={() => setSelectedScheduleMovieId(movie.id)}>
                {getPoster(movie) ? <img src={getPoster(movie)} alt={movie.title} /> : <span>Chưa có ảnh</span>}
              </button>
            ))}</div>
            {selectedScheduleMovie && (
              <div className="schedule-movie-detail">
                <div className="schedule-detail-poster">{getPoster(selectedScheduleMovie) ? <img src={getPoster(selectedScheduleMovie)} alt={selectedScheduleMovie.title} /> : <span>Chưa có ảnh</span>}</div>
                <div className="schedule-detail-info">
                  <h2>{normalizeClientText(selectedScheduleMovie.title)}</h2>
                  <p className="duration">{formatDuration(selectedScheduleMovie.duration)}</p>
                  <p>Thể loại: {normalizeClientText(selectedScheduleMovie.genre || "Đang cập nhật")}</p>
                  <p>Đạo diễn: {normalizeClientText(selectedScheduleMovie.director || "Đang cập nhật")}</p>
                  <p>Diễn viên: {normalizeClientText(selectedScheduleMovie.cast || selectedScheduleMovie.actors || "Đang cập nhật")}</p>
                  <p className="movie-rating">Giới hạn độ tuổi: <span>{getAgeRating(selectedScheduleMovie)}</span> - {getAgeDescription(getAgeRating(selectedScheduleMovie))}</p>
                </div>
                <div className="schedule-trailer"><h3>Trailer</h3>{getTrailerEmbedUrl(selectedScheduleMovie) ? (
                  <iframe src={getTrailerEmbedUrl(selectedScheduleMovie)} title={`Trailer ${selectedScheduleMovie.title}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                ) : <div className="trailer-empty">Phim này chưa có trailer.</div>}</div>
              </div>
            )}
          </>
        ) : (
          <div className="schedule-theater-select"><label><span>Chọn rạp</span><select value={selectedScheduleTheater?.id || ""} onChange={(event) => setSelectedScheduleTheaterId(event.target.value)}>
            {scheduleTheaters.map((theater) => <option key={theater.id} value={theater.id}>{theater.name}</option>)}
          </select></label></div>
        )}

        {hasScheduleData && hasSelectedScheduleTarget && (
          <>
            <div className="schedule-date-row">{scheduleDates.map((date) => (
              <button key={date.value} type="button" className={selectedScheduleDate === date.value ? "active" : ""} onClick={() => setSelectedScheduleDate(date.value)}>{date.label}</button>
            ))}</div>
            <div className="schedule-list"><h2>Lịch chiếu phim</h2>{scheduleGroups.length === 0 ? <div className="schedule-empty">Chưa có lịch chiếu ngày này.</div> : pagination.paginatedItems.map((group) => (
              <div className="schedule-row" key={group.key}>
                <div className="schedule-row-title">{scheduleMode === "movie" ? normalizeClientText(group.theater?.name || `Rạp #${group.times[0]?.theaterId}`) : normalizeClientText(group.movie?.title || group.times[0]?.movieName)}</div>
                <div className="schedule-row-times"><strong>{group.formatType}</strong><div>{group.times.map((showtime) => (
                  <button key={showtime.id} type="button" onClick={() => openBookingFlow(showtime, group.movie || selectedScheduleMovie)}>{formatShowtimeTime(showtime.startTime)}</button>
                ))}</div></div>
              </div>
            ))}<Pagination {...pagination} /></div>
          </>
        )}
      </section>
    </main>
  );
}

export default ClientScheduleView;
