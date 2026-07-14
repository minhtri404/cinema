import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../../layouts/admin/AdminLayout";
import { getGenreById, updateGenre } from "../../../api/genreApi";
import "../../../styles/genre.css";

function GenreEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    active: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadGenre = async () => {
      try {
        const res = await getGenreById(id);
        const genre = res.data;

        setForm({
          name: genre.name || "",
          description: genre.description || "",
          active: genre.active ?? true,
        });
      } catch (error) {
        console.error("Lỗi tải thể loại:", error);
        alert("Không tải được thông tin thể loại.");
      } finally {
        setLoading(false);
      }
    };

    loadGenre();
  }, [id]);

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

      await updateGenre(id, {
        name: form.name.trim(),
        description: form.description.trim(),
        active: form.active,
      });

      alert("Cập nhật thể loại thành công!");
      navigate("/admin/genres");
    } catch (error) {
      console.error("Lỗi cập nhật thể loại:", error);
      alert("Cập nhật thể loại thất bại. Kiểm tra lại dữ liệu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <section className="genre-page">
          <div className="genre-card">Đang tải dữ liệu thể loại...</div>
        </section>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <section className="genre-page">
        <div className="genre-card">
          <div className="genre-header">
            <div>
              <span className="page-label">QUẢN LÝ RẠP CHIẾU PHIM</span>
              <h2>Sửa thể loại</h2>
              <p>Cập nhật thông tin thể loại phim trong hệ thống.</p>
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
                placeholder="Ví dụ: Hành động, Hài, Chính kịch..."
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
                {saving ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </AdminLayout>
  );
}

export default GenreEditPage;
