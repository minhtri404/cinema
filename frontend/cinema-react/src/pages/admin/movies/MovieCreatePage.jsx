import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/admin/AdminLayout";
import { getGenres } from "../../../api/genreApi";
import { createMovie, uploadMoviePoster } from "../../../api/movieApi";
import { cleanupMediaByUrl } from "../../../api/mediaApi";
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
        console.error("Không tải được thể loại:", error);
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

    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh không được vượt quá 5MB.");
      return;
    }

    setPosterFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let uploadedPosterUrl = "";

    try {
      setSaving(true);

      let finalPosterUrl = form.posterUrl;

      if (posterFile) {
        setUploading(true);
        const uploadRes = await uploadMoviePoster(posterFile);
        finalPosterUrl = uploadRes.url || uploadRes.data?.url;
        uploadedPosterUrl = finalPosterUrl;
        setUploading(false);
      }

      await createMovie({
        ...form,
        posterUrl: finalPosterUrl,
        duration: Number(form.duration),
      });

      navigate("/admin/movies");
    } catch (error) {
      if (uploadedPosterUrl) await cleanupMediaByUrl(uploadedPosterUrl);
      console.error("Lỗi thêm phim:", error);
      alert("Thêm phim thất bại. Vui lòng kiểm tra dữ liệu đã nhập.");
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
              <span className="page-label">QUẢN LÝ RẠP CHIẾU PHIM</span>
              <h2>Thêm phim</h2>
              <p>Nhập thông tin phim mới và chọn ảnh áp phích từ máy.</p>
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
                  placeholder="Có thể dán đường dẫn ảnh nếu không tải tệp lên"
                />
              </div>

              <div className="form-group">
                <label>Đoạn giới thiệu trên YouTube</label>
                <input
                  name="trailerUrl"
                  value={form.trailerUrl}
                  onChange={handleChange}
                  placeholder="Dán đường dẫn YouTube hoặc mã video, ví dụ CFWw9ubDgKI"
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
              <h5>Áp phích phim</h5>
              <p>Chọn ảnh từ máy để xem trước và tải lên hệ thống.</p>

              <label className="poster-upload-box">
                {previewUrl ? (
                  <img src={previewUrl} alt="Xem trước áp phích" />
                ) : form.posterUrl ? (
                  <img src={form.posterUrl} alt="Xem trước áp phích" />
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
