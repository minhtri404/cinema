import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useEffect, useMemo, useState } from "react";
import { deleteMovie, getMovies } from "../../../api/movieApi";
import "../../../styles/movie.css";

function MovieListPage() {
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
      "Khong tai duoc danh sach phim. Kiem tra movie-service va API gateway."
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

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Ban co chac muon xoa phim nay?");
    if (!confirmDelete) return;

    await deleteMovie(id);
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
    let ignore = false;

    getMovies()
      .then((response) => {
        if (!ignore) {
          setMovies(normalizeMovies(response.data));
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(getLoadErrorMessage(err));
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section className="movie-page">
      <div className="movie-header">
        <div>
          <p className="movie-eyebrow">Cinema Management</p>
          <h1>Phim</h1>
          <p>Quan ly danh sach phim dang co trong he thong.</p>
        </div>

        <button className="movie-add-btn" type="button">
          <AddRoundedIcon />
          <span>Them phim</span>
        </button>
      </div>

      <div className="movie-toolbar">
        <label className="movie-search">
          <SearchRoundedIcon />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tim theo ten phim, the loai, dao dien..."
            type="search"
          />
        </label>

        <button className="movie-refresh-btn" onClick={loadMovies} type="button">
          <RefreshRoundedIcon />
          <span>Tai lai</span>
        </button>
      </div>

      <div className="movie-card">
        {loading ? (
          <p className="movie-empty">Dang tai du lieu...</p>
        ) : error ? (
          <div className="movie-error">
            <strong>Khong hien thi duoc phim</strong>
            <p>{error}</p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <p className="movie-empty">Chua co phim nao.</p>
        ) : (
          <div className="movie-table-wrapper">
            <table className="movie-table">
              <thead>
                <tr>
                  <th>Phim</th>
                  <th>The loai</th>
                  <th>Dao dien</th>
                  <th>Thoi luong</th>
                  <th>Ngay phat hanh</th>
                  <th>Trang thai</th>
                  <th aria-label="Tac vu"></th>
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
                            alt={movie.title || "Poster phim"}
                          />
                        ) : (
                          <div className="movie-no-image">No image</div>
                        )}
                        <div>
                          <div className="movie-title">
                            {movie.title || "Chua co ten phim"}
                          </div>
                          <p>{movie.description || "Chua co mo ta"}</p>
                        </div>
                      </div>
                    </td>
                    <td>{movie.genre || "Chua co"}</td>
                    <td>{movie.director || "Chua co"}</td>
                    <td>{movie.duration ? `${movie.duration} phut` : "Chua co"}</td>
                    <td>{movie.releaseDate || "Chua co"}</td>
                    <td>
                      <span className="movie-status">
                        {movie.status || "ACTIVE"}
                      </span>
                    </td>
                    <td>
                      <div className="movie-actions">
                        <button className="icon-btn" type="button" aria-label="Sua phim">
                          <EditOutlinedIcon />
                        </button>
                        <button
                          className="icon-btn danger"
                          onClick={() => handleDelete(movie.id)}
                          type="button"
                          aria-label="Xoa phim"
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
