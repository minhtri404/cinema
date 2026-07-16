import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useEffect, useMemo, useState } from "react";
import Pagination from "../../../components/common/Pagination";
import usePagination from "../../../hooks/usePagination";
import {
  createAdvertisement,
  deleteAdvertisement,
  getAdvertisements,
  updateAdvertisement,
  uploadAdvertisementImage,
} from "../../../api/advertisementApi";
import { cleanupMediaByUrl } from "../../../api/mediaApi";
import { publicationStatusLabel } from "../../../utils/displayLabels";
import "../../../styles/advertisement.css";

const today = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const plusDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const emptyForm = () => ({
  title: "",
  imageUrl: "",
  targetUrl: "",
  description: "",
  placement: "HOME_BANNER",
  startDate: today(),
  endDate: plusDays(30),
  status: "ONLINE",
  displayOrder: "0",
});

const placementLabel = {
  HOME_BANNER: "Trang chủ",
  PROMOTION_BANNER: "Khuyến mãi",
  SIDEBAR_BANNER: "Thanh bên",
  POPUP: "Cửa sổ bật lên",
};

const errorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  return data?.message || fallback;
};

function AdvertisementPage() {
  const [advertisements, setAdvertisements] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [placementFilter, setPlacementFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const loadAdvertisements = async () => {
    try {
      setLoading(true);
      const response = await getAdvertisements();
      setAdvertisements(response.data || []);
    } catch (error) {
      alert(errorMessage(error, "Không tải được danh sách quảng cáo."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvertisements();
  }, []);

  const summary = useMemo(() => {
    const online = advertisements.filter((item) => item.status === "ONLINE").length;
    const offline = advertisements.filter((item) => item.status === "OFFLINE").length;
    const home = advertisements.filter((item) => item.placement === "HOME_BANNER").length;
    return { total: advertisements.length, online, offline, home };
  }, [advertisements]);

  const filteredAdvertisements = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    return advertisements.filter((item) => {
      const matchesKeyword =
        !value ||
        [item.title, item.description, item.targetUrl, item.placement]
          .filter(Boolean)
          .some((text) => text.toLowerCase().includes(value));
      return (
        matchesKeyword &&
        (!statusFilter || item.status === statusFilter) &&
        (!placementFilter || item.placement === placementFilter)
      );
    });
  }, [advertisements, keyword, statusFilter, placementFilter]);
  const pagination = usePagination(filteredAdvertisements, 10);

  const resetImage = () => {
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl("");
  };

  const openCreate = () => {
    resetImage();
    setEditingAd(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (advertisement) => {
    resetImage();
    setEditingAd(advertisement);
    setForm({
      title: advertisement.title || "",
      imageUrl: advertisement.imageUrl || "",
      targetUrl: advertisement.targetUrl || "",
      description: advertisement.description || "",
      placement: advertisement.placement || "HOME_BANNER",
      startDate: advertisement.startDate || today(),
      endDate: advertisement.endDate || plusDays(30),
      status: advertisement.status || "ONLINE",
      displayOrder: advertisement.displayOrder ?? "0",
    });
    setPreviewUrl(advertisement.imageUrl || "");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    resetImage();
    setEditingAd(null);
    setForm(emptyForm());
    setModalOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
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
    if (!imageFile && !form.imageUrl) {
      alert("Vui lòng chọn ảnh quảng cáo.");
      return;
    }

    const previousImageUrl = editingAd?.imageUrl || "";
    let uploadedImageUrl = "";

    try {
      setSaving(true);
      let imageUrl = form.imageUrl;
      if (imageFile) {
        const uploadResponse = await uploadAdvertisementImage(imageFile);
        imageUrl = uploadResponse.data?.url || "";
        uploadedImageUrl = imageUrl;
      }
      const payload = {
        ...form,
        imageUrl,
        displayOrder: Number(form.displayOrder || 0),
      };
      if (editingAd) {
        await updateAdvertisement(editingAd.id, payload);
        if (previousImageUrl && previousImageUrl !== imageUrl) {
          await cleanupMediaByUrl(previousImageUrl);
        }
        alert("Cập nhật quảng cáo thành công.");
      } else {
        await createAdvertisement(payload);
        alert("Thêm quảng cáo thành công.");
      }
      closeModal();
      await loadAdvertisements();
    } catch (error) {
      if (uploadedImageUrl) await cleanupMediaByUrl(uploadedImageUrl);
      alert(errorMessage(error, "Lưu quảng cáo thất bại."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (advertisement) => {
    if (!window.confirm(`Xóa quảng cáo "${advertisement.title}"?`)) return;
    try {
      await deleteAdvertisement(advertisement.id);
      await cleanupMediaByUrl(advertisement.imageUrl);
      setAdvertisements((current) => current.filter((item) => item.id !== advertisement.id));
      alert("Xóa quảng cáo thành công.");
    } catch (error) {
      alert(errorMessage(error, "Xóa quảng cáo thất bại."));
    }
  };

  return (
    <section className="advertisement-page">
      <div className="advertisement-hero">
        <div>
          <span className="page-label">QUẢN LÝ RẠP CHIẾU PHIM</span>
          <h2>Quảng cáo</h2>
          <p>Quản lý ảnh quảng cáo hiển thị trên trang chủ, khuyến mãi, thanh bên và cửa sổ bật lên.</p>
        </div>
        <button type="button" onClick={openCreate}>
          <AddRoundedIcon fontSize="small" />
          Thêm quảng cáo
        </button>
      </div>

      <div className="advertisement-summary">
        <article><span>Tổng banner</span><strong>{summary.total}</strong></article>
        <article><span>Đang hiển thị</span><strong>{summary.online}</strong></article>
        <article><span>Đang ẩn</span><strong>{summary.offline}</strong></article>
        <article><span>Trang chủ</span><strong>{summary.home}</strong></article>
      </div>

      <div className="advertisement-card">
        <div className="advertisement-toolbar">
          <label className="advertisement-search">
            <SearchRoundedIcon fontSize="small" />
            <input
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm tên, mô tả, vị trí hoặc link đích..."
            />
          </label>
          <select value={placementFilter} onChange={(event) => setPlacementFilter(event.target.value)}>
            <option value="">Tất cả vị trí</option>
            <option value="HOME_BANNER">Trang chủ</option>
            <option value="PROMOTION_BANNER">Khuyến mãi</option>
            <option value="SIDEBAR_BANNER">Thanh bên</option>
            <option value="POPUP">Cửa sổ bật lên</option>
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="ONLINE">Đang hiển thị</option>
            <option value="OFFLINE">Đang ẩn</option>
          </select>
        </div>

        <div className="advertisement-table-wrap">
          <table className="advertisement-table">
            <thead>
              <tr>
                <th>Quảng cáo</th>
                <th>Hình ảnh</th>
                <th>Vị trí</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Thứ tự</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="advertisement-empty">Đang tải dữ liệu...</td></tr>
              ) : filteredAdvertisements.length === 0 ? (
                <tr><td colSpan="7" className="advertisement-empty">Chưa có quảng cáo phù hợp.</td></tr>
              ) : (
                pagination.paginatedItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="advertisement-info">
                        <strong>{item.title}</strong>
                        <p>{item.description || "Chưa có mô tả."}</p>
                        {item.targetUrl && <span>{item.targetUrl}</span>}
                      </div>
                    </td>
                    <td>
                      {item.imageUrl ? (
                        <img className="advertisement-image" src={item.imageUrl} alt={item.title} />
                      ) : (
                        <div className="advertisement-no-image"><ImageOutlinedIcon /></div>
                      )}
                    </td>
                    <td><span className="advertisement-placement">{placementLabel[item.placement] || item.placement}</span></td>
                    <td className="advertisement-date"><strong>{item.startDate}</strong><span>đến {item.endDate}</span></td>
                    <td><span className={`advertisement-status ${item.status?.toLowerCase()}`}>{publicationStatusLabel(item.status)}</span></td>
                    <td>{item.displayOrder}</td>
                    <td>
                      <div className="advertisement-actions">
                        {item.targetUrl && (
                          <a href={item.targetUrl} target="_blank" rel="noreferrer" title="Xem link">
                            <VisibilityOutlinedIcon fontSize="small" />
                          </a>
                        )}
                        <button type="button" onClick={() => openEdit(item)} title="Sửa"><EditOutlinedIcon fontSize="small" /></button>
                        <button type="button" className="danger" onClick={() => handleDelete(item)} title="Xóa"><DeleteOutlineRoundedIcon fontSize="small" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination {...pagination} />
        </div>
      </div>

      {modalOpen && (
        <div className="advertisement-modal-overlay" onMouseDown={closeModal}>
          <div className="advertisement-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="advertisement-modal-header">
              <div>
                <h3>{editingAd ? "Sửa quảng cáo" : "Thêm quảng cáo"}</h3>
                <p>Upload ảnh banner và cấu hình vị trí hiển thị.</p>
              </div>
              <button type="button" onClick={closeModal} aria-label="Đóng">×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="advertisement-form-grid">
                <label className="full"><span>Tên quảng cáo *</span><input name="title" value={form.title} onChange={handleChange} required /></label>
                <label className="full"><span>Mô tả</span><textarea name="description" value={form.description} onChange={handleChange} rows="3" /></label>
                <label><span>Vị trí</span><select name="placement" value={form.placement} onChange={handleChange}><option value="HOME_BANNER">Trang chủ</option><option value="PROMOTION_BANNER">Khuyến mãi</option><option value="SIDEBAR_BANNER">Thanh bên</option><option value="POPUP">Cửa sổ bật lên</option></select></label>
                <label><span>Trạng thái</span><select name="status" value={form.status} onChange={handleChange}><option value="ONLINE">Đang hiển thị</option><option value="OFFLINE">Đang ẩn</option></select></label>
                <label><span>Ngày bắt đầu</span><input type="date" name="startDate" value={form.startDate} onChange={handleChange} required /></label>
                <label><span>Ngày kết thúc</span><input type="date" name="endDate" value={form.endDate} onChange={handleChange} required /></label>
                <label><span>Thứ tự hiển thị</span><input type="number" min="0" name="displayOrder" value={form.displayOrder} onChange={handleChange} /></label>
                <label><span>Đường dẫn đích</span><input name="targetUrl" value={form.targetUrl} onChange={handleChange} placeholder="/admin/promotions hoặc https://..." /></label>
                <label className="full hidden-image-url"><span>URL ảnh</span><input name="imageUrl" value={form.imageUrl} onChange={handleChange} /></label>
                <div className="advertisement-upload-field full">
                  <label>
                    <span>Ảnh quảng cáo *</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
                    <small>Chọn ảnh ngang, khuyến nghị 960x360. JPG, PNG, WEBP tối đa 5MB.</small>
                  </label>
                  {previewUrl || form.imageUrl ? (
                    <img src={previewUrl || form.imageUrl} alt="Xem trước quảng cáo" />
                  ) : (
                    <div className="advertisement-upload-empty"><ImageOutlinedIcon /></div>
                  )}
                </div>
              </div>

              <div className="advertisement-modal-actions">
                <button type="button" className="secondary" onClick={closeModal}>Hủy</button>
                <button type="submit" className="primary" disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu quảng cáo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdvertisementPage;
