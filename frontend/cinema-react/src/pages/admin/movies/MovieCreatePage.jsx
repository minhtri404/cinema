import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/admin/AdminLayout";
import { getGenres } from "../../../api/genreApi";
import { createMovie, uploadMoviePoster } from "../../../api/movieApi";
import { getYouTubeEmbedUrl } from "../../../utils/youtube";
import "../../../styles/movie.css";

function MovieCreatePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    genre: "",
    duration: "",
    director: "",
    releaseDate: "",
    posterUrl: "",
    trailerUrl: "",
    status: "NOW_SHOWING",
  });

  const [posterFile, setPosterFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [genres, setGenres] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const trailerEmbedUrl = getYouTubeEmbedUrl(form.trailerUrl);

  useEffect(() => {
    let ignore = false;

    getGenres()
      .then((response) => {
        if (ignore) return;
        const activeGenres = Array.isArray(response.data)
          ? response.data.filter((genre) => genre.active !== false)
          : [];
        setGenres(activeGenres);
      })
      .catch((error) => {
        console.error("Khong tai duoc the loai:", error);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert("Ảnh không được vượt quá 3MB.");
      return;
    }

    setPosterFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      let finalPosterUrl = form.posterUrl;

      if (posterFile) {
        setUploading(true);
        const uploadRes = await uploadMoviePoster(posterFile);
        finalPosterUrl = uploadRes.url || uploadRes.data?.url;
        setUploading(false);
      }

      await createMovie({
        ...form,
        posterUrl: finalPosterUrl,
        duration: Number(form.duration),
      });

      navigate("/admin/movies");
    } catch (error) {
      console.error("Lỗi thêm phim:", error);
      alert("Thêm phim thất bại. Kiểm tra backend hoặc dữ liệu nhập.");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <AdminLayout>
      <section className="movie-page">
        <div className="movie-card">
          <div className="movie-header">
            <div>
              <span className="page-label">CINEMA MANAGEMENT</span>
              <h2>Thêm phim</h2>
              <p>Nhập thông tin phim mới và chọn ảnh poster từ máy.</p>
            </div>

            <Link to="/admin/movies" className="movie-back-btn">
              Quay lại
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="movie-form-layout">
            <div className="movie-form-main">
              <div className="form-grid">
                <div className="form-group">
                  <label>Tên phim</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Ví dụ: Avengers Endgame"
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
                    placeholder="120"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Đạo diễn</label>
                  <input
                    name="director"
                    value={form.director}
                    onChange={handleChange}
                    placeholder="Tên đạo diễn"
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
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
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
                  placeholder="Có thể dán link ảnh nếu không upload file"
                />
              </div>

              <div className="form-group">
                <label>Trailer YouTube</label>
                <input
                  name="trailerUrl"
                  value={form.trailerUrl}
                  onChange={handleChange}
                  placeholder="Dan link YouTube hoac ID video, vi du CFWw9ubDgKI"
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
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Nhập mô tả phim..."
                />
              </div>

              <div className="form-actions">
                <Link to="/admin/movies" className="cancel-btn">
                  Hủy
                </Link>

                <button className="save-btn" disabled={saving || uploading}>
                  {uploading ? "Đang tải ảnh..." : saving ? "Đang lưu..." : "Chấp nhận"}
                </button>
              </div>
            </div>

            <div className="movie-poster-panel">
              <h5>Poster phim</h5>
              <p>Chọn ảnh từ máy để xem trước và tải lên hệ thống.</p>

              <label className="poster-upload-box">
                {previewUrl ? (
                  <img src={previewUrl} alt="Poster preview" />
                ) : form.posterUrl ? (
                  <img src={form.posterUrl} alt="Poster preview" />
                ) : (
                  <div className="poster-placeholder">
                    <span>+</span>
                    <strong>Chọn ảnh poster</strong>
                    <small>JPG, PNG, WEBP - tối đa 3MB</small>
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

              <div className="poster-note">
                Nên dùng ảnh dọc tỉ lệ 2:3, ví dụ 600x900 để hiển thị đẹp.
              </div>
            </div>
          </form>
        </div>
      </section>
    </AdminLayout>
  );
}

export default MovieCreatePage;
