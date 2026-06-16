import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../../layouts/admin/AdminLayout";
import { getGenres } from "../../../api/genreApi";
import {
  getMovieById,
  updateMovie,
  uploadMoviePoster,
} from "../../../api/movieApi";
import { getYouTubeEmbedUrl } from "../../../utils/youtube";
import "../../../styles/movie.css";

const emptyForm = {
  title: "",
  description: "",
  genre: "",
  duration: "",
  director: "",
  releaseDate: "",
  posterUrl: "",
  trailerUrl: "",
  status: "NOW_SHOWING",
};

function MovieEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [posterFile, setPosterFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const trailerEmbedUrl = getYouTubeEmbedUrl(form.trailerUrl);

  useEffect(() => {
    let ignore = false;

    Promise.all([getMovieById(id), getGenres()])
      .then(([movieResponse, genresResponse]) => {
        if (ignore) return;
        const movie = movieResponse.data || {};
        const activeGenres = Array.isArray(genresResponse.data)
          ? genresResponse.data.filter((genre) => genre.active !== false)
          : [];

        setForm({
          title: movie.title || "",
          description: movie.description || "",
          genre: movie.genre || "",
          duration: movie.duration ? String(movie.duration) : "",
          director: movie.director || "",
          releaseDate: movie.releaseDate || "",
          posterUrl: movie.posterUrl || "",
          trailerUrl: movie.trailerUrl || "",
          status: movie.status || "NOW_SHOWING",
        });
        setGenres(activeGenres);
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.response?.data?.message || "Khong tai duoc thong tin phim.");
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
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePosterChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Chi chap nhan anh JPG, PNG hoac WEBP.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert("Anh khong duoc vuot qua 3MB.");
      return;
    }

    setPosterFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      let finalPosterUrl = form.posterUrl;

      if (posterFile) {
        const uploadRes = await uploadMoviePoster(posterFile);
        finalPosterUrl = uploadRes.data?.url || finalPosterUrl;
      }

      await updateMovie(id, {
        ...form,
        posterUrl: finalPosterUrl,
        duration: Number(form.duration),
      });

      navigate("/admin/movies");
    } catch (err) {
      console.error("Loi sua phim:", err);
      alert(err.response?.data?.message || "Sua phim that bai. Kiem tra backend hoac du lieu nhap.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <section className="movie-page">
        <div className="movie-card">
          <div className="movie-header">
            <div>
              <span className="page-label">CINEMA MANAGEMENT</span>
              <h2>Sua phim</h2>
              <p>Cap nhat thong tin phim va poster.</p>
            </div>

            <Link to="/admin/movies" className="movie-back-btn">
              Quay lai
            </Link>
          </div>

          {loading ? (
            <p className="movie-empty">Dang tai du lieu...</p>
          ) : error ? (
            <div className="movie-error">
              <strong>Khong mo duoc phim</strong>
              <p>{error}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="movie-form-layout">
              <div className="movie-form-main">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Ten phim</label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>The loai</label>
                    <select
                      name="genre"
                      value={form.genre}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Chon the loai</option>
                      {form.genre &&
                        !genres.some((genre) => genre.name === form.genre) && (
                          <option value={form.genre}>{form.genre}</option>
                        )}
                      {genres.map((genre) => (
                        <option key={genre.id} value={genre.name}>
                          {genre.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Thoi luong</label>
                    <input
                      type="number"
                      name="duration"
                      value={form.duration}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Dao dien</label>
                    <input
                      name="director"
                      value={form.director}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Ngay phat hanh</label>
                    <input
                      type="date"
                      name="releaseDate"
                      value={form.releaseDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Trang thai</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                      <option value="NOW_SHOWING">NOW_SHOWING</option>
                      <option value="COMING_SOON">COMING_SOON</option>
                      <option value="STOPPED">STOPPED</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Poster URL</label>
                  <input
                    name="posterUrl"
                    value={form.posterUrl}
                    onChange={handleChange}
                    placeholder="Dan link anh neu khong upload file"
                  />
                </div>

                <div className="form-group">
                  <label>Trailer YouTube</label>
                  <input
                    name="trailerUrl"
                    value={form.trailerUrl}
                    onChange={handleChange}
                    placeholder="Dan link YouTube hoac ID video"
                  />
                  {trailerEmbedUrl && (
                    <div className="trailer-preview">
                      <iframe
                        src={trailerEmbedUrl}
                        title="Trailer preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Mo ta</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="5"
                  />
                </div>

                <div className="form-actions">
                  <Link to="/admin/movies" className="cancel-btn">
                    Huy
                  </Link>

                  <button className="save-btn" disabled={saving}>
                    {saving ? "Dang luu..." : "Luu thay doi"}
                  </button>
                </div>
              </div>

              <div className="movie-poster-panel">
                <h5>Poster phim</h5>
                <p>Chon anh moi neu muon thay poster hien tai.</p>

                <label className="poster-upload-box">
                  {previewUrl || form.posterUrl ? (
                    <img src={previewUrl || form.posterUrl} alt="Poster preview" />
                  ) : (
                    <div className="poster-placeholder">
                      <span>+</span>
                      <strong>Chon anh poster</strong>
                      <small>JPG, PNG, WEBP - toi da 3MB</small>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handlePosterChange}
                    hidden
                  />
                </label>

                {posterFile && (
                  <div className="poster-file-info">
                    <strong>{posterFile.name}</strong>
                    <span>{(posterFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                )}
              </div>
            </form>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}

export default MovieEditPage;
