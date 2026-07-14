import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../../layouts/admin/AdminLayout";
import { getGenres } from "../../../api/genreApi";
import {
  getMovieById,
  updateMovie,
  uploadMoviePoster,
} from "../../../api/movieApi";
import { cleanupMediaByUrl } from "../../../api/mediaApi";
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
          setError(err.response?.data?.message || "Không tải được thông tin phim.");
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
      alert("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh không được vượt quá 5MB.");
      return;
    }

    setPosterFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const previousPosterUrl = form.posterUrl;
    let uploadedPosterUrl = "";

    try {
      let finalPosterUrl = form.posterUrl;

      if (posterFile) {
        const uploadRes = await uploadMoviePoster(posterFile);
        finalPosterUrl = uploadRes.data?.url || finalPosterUrl;
        uploadedPosterUrl = finalPosterUrl;
      }

      await updateMovie(id, {
        ...form,
        posterUrl: finalPosterUrl,
        duration: Number(form.duration),
      });

      if (previousPosterUrl && previousPosterUrl !== finalPosterUrl) {
        await cleanupMediaByUrl(previousPosterUrl);
      }

      navigate("/admin/movies");
    } catch (err) {
      if (uploadedPosterUrl) await cleanupMediaByUrl(uploadedPosterUrl);
      console.error("Lỗi sửa phim:", err);
      alert(err.response?.data?.message || "Sửa phim thất bại. Vui lòng kiểm tra dữ liệu đã nhập.");
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
              <span className="page-label">QUẢN LÝ RẠP CHIẾU PHIM</span>
              <h2>Sửa phim</h2>
              <p>Cập nhật thông tin phim và áp phích.</p>
            </div>

            <Link to="/admin/movies" className="movie-back-btn">
              Quay lại
            </Link>
          </div>

          {loading ? (
            <p className="movie-empty">Đang tải dữ liệu...</p>
          ) : error ? (
            <div className="movie-error">
              <strong>Không mở được phim</strong>
              <p>{error}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="movie-form-layout">
              <div className="movie-form-main">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Tên phim</label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Thể loại</label>
                    <select
                      name="genre"
                      value={form.genre}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Chọn thể loại</option>
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
                    <label>Thời lượng</label>
                    <input
                      type="number"
                      name="duration"
                      value={form.duration}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Đạo diễn</label>
                    <input
                      name="director"
                      value={form.director}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Ngày phát hành</label>
                    <input
                      type="date"
                      name="releaseDate"
                      value={form.releaseDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Trạng thái</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                      <option value="NOW_SHOWING">Đang chiếu</option>
                      <option value="COMING_SOON">Sắp chiếu</option>
                      <option value="STOPPED">Ngừng chiếu</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Đường dẫn ảnh áp phích</label>
                  <input
                    name="posterUrl"
                    value={form.posterUrl}
                    onChange={handleChange}
                    placeholder="Dán đường dẫn ảnh nếu không tải tệp lên"
                  />
                </div>

                <div className="form-group">
                  <label>Đoạn giới thiệu trên YouTube</label>
                  <input
                    name="trailerUrl"
                    value={form.trailerUrl}
                    onChange={handleChange}
                    placeholder="Dán đường dẫn YouTube hoặc mã video"
                  />
                  {trailerEmbedUrl && (
                    <div className="trailer-preview">
                      <iframe
                        src={trailerEmbedUrl}
                        title="Xem trước đoạn giới thiệu"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="5"
                  />
                </div>

                <div className="form-actions">
                  <Link to="/admin/movies" className="cancel-btn">
                    Hủy
                  </Link>

                  <button className="save-btn" disabled={saving}>
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </div>

              <div className="movie-poster-panel">
                <h5>Áp phích phim</h5>
                <p>Chọn ảnh mới nếu muốn thay áp phích hiện tại.</p>

                <label className="poster-upload-box">
                  {previewUrl || form.posterUrl ? (
                    <img src={previewUrl || form.posterUrl} alt="Xem trước áp phích" />
                  ) : (
                    <div className="poster-placeholder">
                      <span>+</span>
                      <strong>Chọn ảnh áp phích</strong>
                      <small>JPG, PNG, WEBP - tối đa 5MB</small>
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
