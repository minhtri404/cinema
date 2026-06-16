import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/admin/AdminLayout";
import { createGenre } from "../../../api/genreApi";
import "../../../styles/genre.css";

function GenreCreatePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    active: true,
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Tên thể loại không được để trống.");
      return;
    }

    try {
      setSaving(true);

      await createGenre({
        name: form.name.trim(),
        description: form.description.trim(),
        active: form.active,
      });

      alert("Thêm thể loại thành công!");
      navigate("/admin/genres");
    } catch (error) {
      console.error("Lỗi thêm thể loại:", error);
      alert("Thêm thể loại thất bại. Có thể tên thể loại đã tồn tại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <section className="genre-page">
        <div className="genre-card">
          <div className="genre-header">
            <div>
              <span className="page-label">CINEMA MANAGEMENT</span>
              <h2>Thêm thể loại</h2>
              <p>Tạo thể loại phim mới để sử dụng khi quản lý phim.</p>
            </div>

            <Link to="/admin/genres" className="genre-back-btn">
              Quay lại
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="genre-form">
            <div className="form-group">
              <label>Tên thể loại</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ví dụ: Action, Comedy, Drama..."
                required
              />
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="5"
                placeholder="Nhập mô tả ngắn cho thể loại phim..."
              />
            </div>

            <label className="genre-check-row">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
              />
              <span>Đang sử dụng</span>
            </label>

            <div className="form-actions">
              <Link to="/admin/genres" className="cancel-btn">
                Hủy
              </Link>

              <button className="save-btn" disabled={saving}>
                {saving ? "Đang lưu..." : "Chấp nhận"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </AdminLayout>
  );
}

export default GenreCreatePage;