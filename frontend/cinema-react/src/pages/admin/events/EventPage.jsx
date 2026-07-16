import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useEffect, useMemo, useState } from "react";
import Pagination from "../../../components/common/Pagination";
import usePagination from "../../../hooks/usePagination";
import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
  uploadEventImage,
} from "../../../api/eventApi";
import { cleanupMediaByUrl } from "../../../api/mediaApi";
import "../../../styles/event.css";
import { eventStatusLabel } from "../../../utils/displayLabels";

const localDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const currentStaff = () => {
  try {
    return JSON.parse(localStorage.getItem("auth"))?.fullName || "Admin Cinema";
  } catch {
    return "Admin Cinema";
  }
};

const emptyForm = () => ({
  title: "",
  imageUrl: "",
  content: "",
  applyCondition: "",
  startDate: localDate(),
  endDate: localDate(),
  status: "ONLINE",
  staffName: currentStaff(),
});

const getEffectiveStatus = (event) => {
  if (event.effectiveStatus) return event.effectiveStatus;
  if (event.endDate && event.endDate < localDate()) return "EXPIRED";
  return event.status || "ONLINE";
};

const getStatusLabel = eventStatusLabel;

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  return data?.message || fallback;
};

function EventPage() {
  const [events, setEvents] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await getEvents();
      setEvents(response.data || []);
    } catch (error) {
      console.error("Lỗi tải sự kiện:", error);
      alert(getErrorMessage(error, "Không tải được danh sách sự kiện."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getEvents()
      .then((response) => {
        if (active) setEvents(response.data || []);
      })
      .catch((error) => {
        console.error("Lỗi tải sự kiện:", error);
        if (active) alert(getErrorMessage(error, "Không tải được danh sách sự kiện."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredEvents = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    return events.filter((event) => {
      const matchesKeyword =
        !value ||
        [event.title, event.content, event.applyCondition, event.staffName]
          .filter(Boolean)
          .some((item) => item.toLowerCase().includes(value));
      const matchesStatus = !statusFilter || getEffectiveStatus(event) === statusFilter;
      return matchesKeyword && matchesStatus;
    });
  }, [events, keyword, statusFilter]);
  const pagination = usePagination(filteredEvents, 10);

  const resetImage = () => {
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl("");
  };

  const openCreate = () => {
    resetImage();
    setEditingEvent(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (event) => {
    resetImage();
    setEditingEvent(event);
    setForm({
      title: event.title || "",
      imageUrl: event.imageUrl || "",
      content: event.content || "",
      applyCondition: event.applyCondition || "",
      startDate: event.startDate || localDate(),
      endDate: event.endDate || localDate(),
      status: event.status || "ONLINE",
      staffName: event.staffName || currentStaff(),
    });
    setPreviewUrl(event.imageUrl || "");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    resetImage();
    setModalOpen(false);
    setEditingEvent(null);
    setForm(emptyForm());
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (name === "imageUrl" && !imageFile) setPreviewUrl(value);
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh không được vượt quá 5MB.");
      event.target.value = "";
      return;
    }

    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.endDate < form.startDate) {
      alert("Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.");
      return;
    }

    const previousImageUrl = editingEvent?.imageUrl || "";
    let uploadedImageUrl = "";

    try {
      setSaving(true);
      let imageUrl = form.imageUrl;
      if (imageFile) {
        const uploadResponse = await uploadEventImage(imageFile);
        imageUrl = uploadResponse.data?.url || "";
        uploadedImageUrl = imageUrl;
      }

      const payload = { ...form, imageUrl };
      if (editingEvent) {
        await updateEvent(editingEvent.id, payload);
        if (previousImageUrl && previousImageUrl !== imageUrl) {
          await cleanupMediaByUrl(previousImageUrl);
        }
        alert("Cập nhật sự kiện thành công.");
      } else {
        await createEvent(payload);
        alert("Thêm sự kiện thành công.");
      }

      resetImage();
      setModalOpen(false);
      setEditingEvent(null);
      await loadEvents();
    } catch (error) {
      if (uploadedImageUrl) await cleanupMediaByUrl(uploadedImageUrl);
      console.error("Lỗi lưu sự kiện:", error);
      alert(getErrorMessage(error, "Lưu sự kiện thất bại."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (event) => {
    if (!window.confirm(`Xóa sự kiện "${event.title}"?`)) return;
    try {
      await deleteEvent(event.id);
      await cleanupMediaByUrl(event.imageUrl);
      setEvents((current) => current.filter((item) => item.id !== event.id));
      alert("Xóa sự kiện thành công.");
    } catch (error) {
      alert(getErrorMessage(error, "Xóa sự kiện thất bại."));
    }
  };

  return (
    <>
      <section className="event-page">
        <div className="event-card">
          <header className="event-header">
            <div>
              <span className="page-label">QUẢN LÝ RẠP CHIẾU PHIM</span>
              <h2>Sự kiện</h2>
              <p>Quản lý chương trình khuyến mãi và quyền lợi khách hàng.</p>
            </div>
            <button type="button" onClick={openCreate}>
              <AddRoundedIcon fontSize="small" />
              Thêm sự kiện
            </button>
          </header>

          <div className="event-toolbar">
            <label className="event-search">
              <SearchRoundedIcon fontSize="small" />
              <input
                type="search"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm tiêu đề, nội dung, nhân viên..."
              />
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ONLINE">Mua trực tuyến</option>
              <option value="OFFLINE">Mua tại quầy</option>
              <option value="EXPIRED">Hết hạn</option>
            </select>
          </div>

          <div className="event-table-wrap">
            <table className="event-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Hình ảnh</th>
                  <th>Nội dung</th>
                  <th>Điều kiện áp dụng</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th>Nhân viên</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="event-empty">Đang tải dữ liệu...</td>
                  </tr>
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="event-empty">Chưa có sự kiện phù hợp.</td>
                  </tr>
                ) : (
                  pagination.paginatedItems.map((event) => {
                    const effectiveStatus = getEffectiveStatus(event);
                    return (
                      <tr key={event.id}>
                        <td className="event-title-cell">{event.title}</td>
                        <td>
                          {event.imageUrl ? (
                            <img
                              className="event-banner"
                              src={event.imageUrl}
                              alt={event.title}
                              onError={(e) => {
                                e.currentTarget.hidden = true;
                              }}
                            />
                          ) : (
                            <div className="event-no-image"><ImageOutlinedIcon /></div>
                          )}
                        </td>
                        <td><p className="event-clamp">{event.content || "—"}</p></td>
                        <td><p className="event-clamp">{event.applyCondition || "—"}</p></td>
                        <td className="event-time">
                          <strong>{event.startDate}</strong>
                          <span>đến {event.endDate}</span>
                        </td>
                        <td>
                          <span className={`event-status ${effectiveStatus.toLowerCase()}`}>
                            {getStatusLabel(effectiveStatus)}
                          </span>
                        </td>
                        <td>{event.staffName || "—"}</td>
                        <td>
                          <div className="event-actions">
                            <button type="button" onClick={() => openEdit(event)} title="Sửa">
                              <EditOutlinedIcon fontSize="small" />
                            </button>
                            <button
                              type="button"
                              className="danger"
                              onClick={() => handleDelete(event)}
                              title="Xóa"
                            >
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <Pagination {...pagination} />
          </div>
        </div>
      </section>

      {modalOpen && (
        <div className="event-modal-overlay" onMouseDown={closeModal}>
          <div className="event-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="event-modal-header">
              <div>
                <h3>{editingEvent ? "Sửa sự kiện" : "Thêm sự kiện"}</h3>
                <p>Nhập nội dung, thời gian và ảnh bìa chương trình.</p>
              </div>
              <button type="button" onClick={closeModal} aria-label="Đóng">×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="event-form-grid">
                <label className="full">
                  <span>Tiêu đề *</span>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Ví dụ: Ngày vui - Thứ Ba vui vẻ"
                    required
                  />
                </label>

                <label>
                  <span>Ngày bắt đầu *</span>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  <span>Ngày kết thúc *</span>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="full">
                  <span>Nội dung</span>
                  <textarea
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Mô tả quyền lợi hoặc chương trình..."
                  />
                </label>

                <label className="full">
                  <span>Điều kiện áp dụng</span>
                  <textarea
                    name="applyCondition"
                    value={form.applyCondition}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Đối tượng, ngày áp dụng, phương thức thanh toán..."
                  />
                </label>

                <label>
                  <span>Trạng thái</span>
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="ONLINE">Mua vé trực tuyến</option>
                    <option value="OFFLINE">Mua vé tại quầy</option>
                  </select>
                </label>
                <label>
                  <span>Nhân viên</span>
                  <input
                    name="staffName"
                    value={form.staffName}
                    onChange={handleChange}
                  />
                </label>

                <div className="event-image-field full">
                  <div>
                    <span>Ảnh bìa</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                    />
                    <input
                      name="imageUrl"
                      value={form.imageUrl}
                      onChange={handleChange}
                      placeholder="Hoặc dán đường dẫn ảnh"
                    />
                  </div>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Xem trước banner" />
                  ) : (
                    <div className="event-preview-empty"><ImageOutlinedIcon /></div>
                  )}
                </div>
              </div>

              <div className="event-modal-actions">
                <button type="button" className="secondary" onClick={closeModal}>Hủy</button>
                <button type="submit" className="primary" disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu sự kiện"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default EventPage;
