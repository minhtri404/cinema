import { useEffect, useMemo, useState } from "react";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AdminLayout from "../../../layouts/admin/AdminLayout";
import {
  createTheater,
  deleteTheater,
  getTheaters,
  updateTheater,
} from "../../../api/theaterApi";
import "../../../styles/theater.css";

const emptyForm = {
  name: "",
  address: "",
  city: "",
  location: "",
  roomCount: "",
  status: "ONLINE",
};

function TheaterListPage() {
  const [theaters, setTheaters] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingTheater, setEditingTheater] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadTheaters = async () => {
    try {
      setLoading(true);
      const res = await getTheaters();
      setTheaters(res.data || []);
    } catch (error) {
      console.error("Lỗi tải danh sách rạp:", error);
      alert("Không tải được danh sách rạp.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTheaters();
  }, []);

  const filteredTheaters = useMemo(() => {
    const value = keyword.toLowerCase().trim();

    if (!value) return theaters;

    return theaters.filter((theater) => {
      return (
        theater.name?.toLowerCase().includes(value) ||
        theater.address?.toLowerCase().includes(value) ||
        theater.city?.toLowerCase().includes(value)
      );
    });
  }, [theaters, keyword]);

  const openCreateModal = () => {
    setEditingTheater(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (theater) => {
    setEditingTheater(theater);
    setForm({
      name: theater.name || "",
      address: theater.address || "",
      city: theater.city || "",
      location: theater.location || "",
      roomCount: theater.roomCount || "",
      status: theater.status || "ONLINE",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTheater(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Tên rạp không được để trống.");
      return;
    }

    if (!form.address.trim()) {
      alert("Địa chỉ rạp không được để trống.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        location: form.location.trim(),
        roomCount: Number(form.roomCount || 0),
        status: form.status,
      };

      if (editingTheater) {
        await updateTheater(editingTheater.id, payload);
        alert("Cập nhật rạp thành công!");
      } else {
        await createTheater(payload);
        alert("Thêm rạp thành công!");
      }

      closeModal();
      loadTheaters();
    } catch (error) {
      console.error("Lỗi lưu rạp:", error);
      alert("Lưu rạp thất bại. Kiểm tra backend hoặc dữ liệu nhập.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa rạp này?");

    if (!confirmDelete) return;

    try {
      await deleteTheater(id);
      alert("Xóa rạp thành công!");
      loadTheaters();
    } catch (error) {
      console.error("Lỗi xóa rạp:", error);
      alert("Xóa rạp thất bại. Có thể rạp đang được lịch chiếu sử dụng.");
    }
  };

  return (
    <AdminLayout>
      <section className="theater-page">
        <div className="theater-card">
          <div className="theater-header">
            <div>
              <span className="page-label">CINEMA MANAGEMENT</span>
              <h2>Rạp</h2>
              <p>Quản lý danh sách rạp chiếu phim trong hệ thống.</p>
            </div>

            <button className="theater-add-btn" onClick={openCreateModal}>
              + Thêm rạp
            </button>
          </div>

          <div className="theater-toolbar">
            <input
              className="theater-search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên rạp, địa chỉ, thành phố..."
            />
          </div>

          {loading ? (
            <div className="theater-empty">Đang tải dữ liệu...</div>
          ) : (
            <table className="theater-table">
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>ID</th>
                  <th>Tên rạp</th>
                  <th>Địa chỉ</th>
                  <th>Thành phố</th>
                  <th style={{ width: "110px" }}>Số phòng</th>
                  <th style={{ width: "130px" }}>Trạng thái</th>
                  <th style={{ width: "120px" }}>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredTheaters.length > 0 ? (
                  filteredTheaters.map((theater) => (
                    <tr key={theater.id}>
                      <td>{theater.id}</td>
                      <td>
                        <span className="theater-name">{theater.name}</span>
                        <br />
                        <span className="theater-muted">
                          {theater.location || "Chưa có vị trí"}
                        </span>
                      </td>
                      <td>{theater.address}</td>
                      <td>{theater.city || "Chưa cập nhật"}</td>
                      <td>{theater.roomCount || 0}</td>
                      <td>
                        <span
                          className={`theater-status ${
                            theater.status === "ONLINE" ? "online" : "offline"
                          }`}
                        >
                          {theater.status || "ONLINE"}
                        </span>
                      </td>
                      <td>
                        <div className="theater-actions">
                          <button
                            className="theater-icon-btn"
                            onClick={() => openEditModal(theater)}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </button>

                          <button
                            className="theater-icon-btn danger"
                            onClick={() => handleDelete(theater.id)}
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="theater-empty">
                      Không có rạp phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {showModal && (
        <div className="theater-modal-overlay">
          <div className="theater-modal">
            <div className="theater-modal-header">
              <h3>{editingTheater ? "Sửa rạp" : "Thêm rạp"}</h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="theater-form">
                <div className="theater-form-grid">
                  <div className="theater-form-group">
                    <label>Tên rạp</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Ví dụ: Rạp Cao Lỗ"
                      required
                    />
                  </div>

                  <div className="theater-form-group">
                    <label>Thành phố</label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Ví dụ: Hồ Chí Minh"
                    />
                  </div>

                  <div className="theater-form-group full">
                    <label>Địa chỉ</label>
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Ví dụ: 123 Cao Lỗ, Quận 8"
                      required
                    />
                  </div>

                  <div className="theater-form-group full">
                    <label>Vị trí / mô tả vị trí</label>
                    <input
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="Ví dụ: Tầng 3 trung tâm thương mại"
                    />
                  </div>

                  <div className="theater-form-group">
                    <label>Số phòng chiếu</label>
                    <input
                      type="number"
                      name="roomCount"
                      value={form.roomCount}
                      onChange={handleChange}
                      placeholder="Ví dụ: 4"
                    />
                  </div>

                  <div className="theater-form-group">
                    <label>Trạng thái</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="ONLINE">ONLINE</option>
                      <option value="OFFLINE">OFFLINE</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="theater-modal-actions">
                <button
                  type="button"
                  className="theater-cancel-btn"
                  onClick={closeModal}
                >
                  Đóng
                </button>

                <button className="theater-save-btn" disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default TheaterListPage;