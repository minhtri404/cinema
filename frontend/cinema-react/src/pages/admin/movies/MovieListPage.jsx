import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteMovie, getMovies } from "../../../api/movieApi";
import { cleanupMediaByUrl } from "../../../api/mediaApi";
import { movieStatusLabel } from "../../../utils/displayLabels";
import "../../../styles/movie.css";

function MovieListPage() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const normalizeMovies = (data) => {
    return Array.isArray(data) ? data : [];
  };

  const getLoadErrorMessage = (err) => {
    return (
      err.response?.data?.message ||
      "Không tải được danh sách phim. Vui lòng kiểm tra các dịch vụ hệ thống."
    );
  };

  const loadMovies = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getMovies();
      setMovies(normalizeMovies(response.data));
    } catch (err) {
      setError(getLoadErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (movie) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa phim này?");
    if (!confirmDelete) return;

    await deleteMovie(movie.id);
    await cleanupMediaByUrl(movie.posterUrl);
    loadMovies();
  };

  const filteredMovies = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return movies;

    return movies.filter((movie) => {
      return [movie.title, movie.genre, movie.director, movie.status]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedKeyword));
    });
  }, [keyword, movies]);

  useEffect(() => {
    let active = true;
    getMovies()
      .then((response) => {
        if (active) setMovies(normalizeMovies(response.data));
      })
      .catch((err) => {
        if (active) setError(getLoadErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="movie-page">
      <div className="movie-header">
        <div>
          <p className="movie-eyebrow">QUẢN LÝ RẠP CHIẾU PHIM</p>
          <h1>Phim</h1>
          <p>Quản lý danh sách phim đang có trong hệ thống.</p>
        </div>

        <button
          className="movie-add-btn"
          onClick={() => navigate("/admin/movies/create")}
          type="button"
        >
          <AddRoundedIcon />
          <span>Thêm phim</span>
        </button>
      </div>

      <div className="movie-toolbar">
        <label className="movie-search">
          <SearchRoundedIcon />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm theo tên phim, thể loại, đạo diễn..."
            type="search"
          />
        </label>

        <button className="movie-refresh-btn" onClick={loadMovies} type="button">
          <RefreshRoundedIcon />
          <span>Tải lại</span>
        </button>
      </div>

      <div className="movie-card">
        {loading ? (
          <p className="movie-empty">Đang tải dữ liệu...</p>
        ) : error ? (
          <div className="movie-error">
            <strong>Không hiển thị được phim</strong>
            <p>{error}</p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <p className="movie-empty">Chưa có phim nào.</p>
        ) : (
          <div className="movie-table-wrapper">
            <table className="movie-table">
              <thead>
                <tr>
                  <th>Phim</th>
                  <th>Thể loại</th>
                  <th>Đạo diễn</th>
                  <th>Thời lượng</th>
                  <th>Ngày phát hành</th>
                  <th>Trạng thái</th>
                  <th aria-label="Tác vụ"></th>
                </tr>
              </thead>

              <tbody>
                {filteredMovies.map((movie) => (
                  <tr key={movie.id}>
                    <td>
                      <div className="movie-info">
                        {movie.posterUrl ? (
                          <img
                            className="movie-poster"
                            src={movie.posterUrl}
                            alt={movie.title || "Áp phích phim"}
                            onError={(event) => {
                              event.currentTarget.src =
                                "https://placehold.co/120x160?text=Kh%C3%B4ng+c%C3%B3+%E1%BA%A3nh";
                            }}
                          />
                        ) : (
                          <div className="movie-no-image">Không có ảnh</div>
                        )}
                        <div>
                          <div className="movie-title">
                            {movie.title || "Chưa có tên phim"}
                          </div>
                          <p>{movie.description || "Chưa có mô tả"}</p>
                        </div>
                      </div>
                    </td>
                    <td>{movie.genre || "Chưa có"}</td>
                    <td>{movie.director || "Chưa có"}</td>
                    <td>{movie.duration ? `${movie.duration} phút` : "Chưa có"}</td>
                    <td>{movie.releaseDate || "Chưa có"}</td>
                    <td>
                      <span className="movie-status">
                        {movieStatusLabel(movie.status || "NOW_SHOWING")}
                      </span>
                    </td>
                    <td>
                      <div className="movie-actions">
                        <button
                          className="icon-btn"
                          onClick={() => navigate(`/admin/movies/edit/${movie.id}`)}
                          type="button"
                          aria-label="Sửa phim"
                        >
                          <EditOutlinedIcon />
                        </button>
                        <button
                          className="icon-btn danger"
                          onClick={() => handleDelete(movie)}
                          type="button"
                          aria-label="Xóa phim"
                        >
                          <DeleteOutlineOutlinedIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default MovieListPage;
