import {
  buildScheduleDates,
  formatDuration,
  formatShowtimeTime,
  getAgeDescription,
  getAgeRating,
  getPoster,
  getTrailerEmbedUrl,
  normalizeClientText,
  parseLocalDate,
  toDateInputValue,
} from "../clientHomeUtils";

function ClientMovieDetailView({ controller }) {
  const {
    activeShowtimes,
    detailScheduleDate,
    openBookingFlow,
    selectedMovie,
    setDetailScheduleDate,
    setView,
    theaterMap,
  } = controller;

  if (!selectedMovie) return null;

  const rating = getAgeRating(selectedMovie);
  const trailerEmbedUrl = getTrailerEmbedUrl(selectedMovie);
  const movieShowtimeDates = Array.from(
    new Set(
      activeShowtimes
        .filter((showtime) => Number(showtime.movieId) === Number(selectedMovie.id))
        .map((showtime) => showtime.showDate)
        .filter(Boolean),
    ),
  ).sort();
  const today = toDateInputValue(new Date());
  const firstDateWithShowtime = movieShowtimeDates.find((date) => date >= today) || movieShowtimeDates[0];
  const detailDates = buildScheduleDates(parseLocalDate(firstDateWithShowtime || today), 8);
  const detailShowtimes = activeShowtimes.filter(
    (showtime) => Number(showtime.movieId) === Number(selectedMovie.id) && showtime.showDate === detailScheduleDate,
  );
  const detailGroups = Array.from(
    detailShowtimes.reduce((groups, showtime) => {
      const key = `${showtime.theaterId}-${showtime.formatType || "2D"}`;
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          theater: theaterMap.get(Number(showtime.theaterId)),
          formatType: showtime.formatType || "2D",
          times: [],
        });
      }
      groups.get(key).times.push(showtime);
      return groups;
    }, new Map()).values(),
  ).map((group) => ({
    ...group,
    times: group.times.sort((a, b) => String(a.startTime).localeCompare(String(b.startTime))),
  }));

  return (
    <main className="client-main movie-detail-page">
      <button type="button" className="movie-detail-back" onClick={() => setView("home")}>← Quay lại danh sách phim</button>
      <section className="movie-detail-hero">
        <div className="movie-detail-poster">
          {getPoster(selectedMovie) ? <img src={getPoster(selectedMovie)} alt={selectedMovie.title} /> : <span>Chưa có ảnh</span>}
        </div>
        <div className="movie-detail-content">
          <h1>{normalizeClientText(selectedMovie.title)}</h1>
          <p className="duration">{formatDuration(selectedMovie.duration)}</p>
          <p><strong>Thể loại:</strong> {normalizeClientText(selectedMovie.genre || "Đang cập nhật")}</p>
          <p><strong>Đạo diễn:</strong> {normalizeClientText(selectedMovie.director || "Đang cập nhật")}</p>
          <p><strong>Diễn viên:</strong> {normalizeClientText(selectedMovie.cast || selectedMovie.actors || "Đang cập nhật")}</p>
          <p className="movie-rating"><strong>Giới hạn độ tuổi:</strong> <span>{rating}</span> - {getAgeDescription(rating)}</p>
          <div className="movie-detail-description">
            <h2>Nội dung</h2>
            <p>{normalizeClientText(selectedMovie.description || "Nội dung phim đang được cập nhật.")}</p>
          </div>
        </div>
      </section>

      <section className="movie-detail-trailer">
        <h2>Trailer</h2>
        {trailerEmbedUrl ? (
          <iframe src={trailerEmbedUrl} title={`Trailer ${selectedMovie.title}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        ) : <div className="trailer-empty">Phim này chưa có trailer.</div>}
      </section>

      <section className="movie-detail-schedule">
        <h2>Lịch Chiếu Phim</h2>
        {movieShowtimeDates.length === 0 ? (
          <div className="schedule-empty" role="status">Phim này chưa có lịch chiếu.</div>
        ) : (
          <>
            <div className="schedule-date-row">
              {detailDates.map((date) => (
                <button key={date.value} type="button" className={detailScheduleDate === date.value ? "active" : ""} onClick={() => setDetailScheduleDate(date.value)}>{date.label}</button>
              ))}
            </div>
            {detailGroups.length === 0 ? (
              <div className="schedule-empty" role="status">Chưa có lịch chiếu ngày này.</div>
            ) : detailGroups.map((group) => (
              <div className="schedule-row" key={group.key}>
                <div className="schedule-row-title">{normalizeClientText(group.theater?.name || `Rạp #${group.times[0]?.theaterId}`)}</div>
                <div className="schedule-row-times">
                  <strong>{group.formatType}</strong>
                  <div>{group.times.map((showtime) => (
                    <button key={showtime.id} type="button" onClick={() => openBookingFlow(showtime, selectedMovie)}>{formatShowtimeTime(showtime.startTime)}</button>
                  ))}</div>
                </div>
              </div>
            ))}
          </>
        )}
      </section>
    </main>
  );
}

export default ClientMovieDetailView;
