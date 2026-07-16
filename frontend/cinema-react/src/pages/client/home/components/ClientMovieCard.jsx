import {
  formatDuration,
  getAgeDescription,
  getAgeRating,
  getPoster,
  normalizeClientText,
} from "../clientHomeUtils";

function ClientMovieCard({ movie, onOpen }) {
  const rating = getAgeRating(movie);

  const openWithKeyboard = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onOpen(movie);
  };

  return (
    <article className="client-movie-card" role="button" tabIndex={0} onClick={() => onOpen(movie)} onKeyDown={openWithKeyboard}>
      <div className="movie-poster">
        {getPoster(movie) ? <img src={getPoster(movie)} alt={movie.title} /> : <span>Chưa có ảnh</span>}
      </div>
      <div className="movie-info">
        <h3>{normalizeClientText(movie.title)}</h3>
        <p className="duration">{formatDuration(movie.duration)}</p>
        <p>Thể loại: {normalizeClientText(movie.genre || "Đang cập nhật")}</p>
        <p>Đạo diễn: {normalizeClientText(movie.director || "Đang cập nhật")}</p>
        <p>Diễn viên: {normalizeClientText(movie.cast || movie.actors || "Đang cập nhật")}</p>
        <p className="movie-rating">Phân loại: <span>{rating}</span> - {getAgeDescription(rating)}</p>
      </div>
    </article>
  );
}

export default ClientMovieCard;
