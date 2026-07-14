import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useEffect, useMemo, useState } from "react";
import {
  createPromotion,
  deletePromotion,
  getPromotions,
  updatePromotion,
  uploadPromotionImage,
} from "../../../api/promotionApi";
import { cleanupMediaByUrl } from "../../../api/mediaApi";
import "../../../styles/promotion.css";
import { promotionStatusLabel } from "../../../utils/displayLabels";

const localDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const emptyForm = () => ({
  code: "",
  name: "",
  description: "",
  imageUrl: "",
  discountType: "PERCENT",
  discountValue: "",
  minOrderAmount: "0",
  maxDiscountAmount: "",
  startDate: localDate(),
  endDate: addDays(30),
  usageLimit: "",
  status: "ONLINE",
});

const errorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  return data?.message || fallback;
};

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

function PromotionPage() {
  const [promotions, setPromotions] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const response = await getPromotions();
      setPromotions(response.data || []);
    } catch (error) {
      console.error("Lỗi tải khuyến mãi:", error);
      alert(errorMessage(error, "Không tải được danh sách khuyến mãi."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getPromotions()
      .then((response) => {
        if (active) setPromotions(response.data || []);
      })
      .catch((error) => {
        console.error("Lỗi tải khuyến mãi:", error);
        if (active) alert(errorMessage(error, "Không tải được danh sách khuyến mãi."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredPromotions = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    return promotions.filter((promotion) => {
      const matchesKeyword =
        !value ||
        [promotion.code, promotion.name, promotion.description]
          .filter(Boolean)
          .some((item) => item.toLowerCase().includes(value));
      return matchesKeyword && (!statusFilter || promotion.status === statusFilter);
    });
  }, [promotions, keyword, statusFilter]);

  const resetImage = () => {
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl("");
  };

  const openCreate = () => {
    resetImage();
    setEditingPromotion(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (promotion) => {
    resetImage();
    setEditingPromotion(promotion);
    setForm({
      code: promotion.code || "",
      name: promotion.name || "",
      description: promotion.description || "",
      imageUrl: promotion.imageUrl || "",
      discountType: promotion.discountType || "PERCENT",
      discountValue: promotion.discountValue ?? "",
      minOrderAmount: promotion.minOrderAmount ?? "0",
      maxDiscountAmount: promotion.maxDiscountAmount ?? "",
      startDate: promotion.startDate || localDate(),
      endDate: promotion.endDate || addDays(30),
      usageLimit: promotion.usageLimit ?? "",
      status: promotion.status || "ONLINE",
    });
    setPreviewUrl(promotion.imageUrl || "");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    resetImage();
    setEditingPromotion(null);
    setForm(emptyForm());
    setModalOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => {
      const next = {
        ...current,
        [name]: name === "code" ? value.toUpperCase().replace(/\s+/g, "") : value,
      };
      if (name === "discountType" && value === "FIXED") {
        next.maxDiscountAmount = "";
      }
      return next;
    });
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

    const previousImageUrl = editingPromotion?.imageUrl || "";
    let uploadedImageUrl = "";

    try {
      setSaving(true);
      let imageUrl = form.imageUrl;
      if (imageFile) {
        const uploadResponse = await uploadPromotionImage(imageFile);
        imageUrl = uploadResponse.data?.url || "";
        uploadedImageUrl = imageUrl;
      }

      const payload = {
        ...form,
        imageUrl,
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount || 0),
        maxDiscountAmount:
          form.discountType === "PERCENT" && form.maxDiscountAmount !== ""
            ? Number(form.maxDiscountAmount)
            : null,
        usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),
      };

      if (editingPromotion) {
        await updatePromotion(editingPromotion.id, payload);
        if (previousImageUrl && previousImageUrl !== imageUrl) {
          await cleanupMediaByUrl(previousImageUrl);
        }
        alert("Cập nhật khuyến mãi thành công.");
      } else {
        await createPromotion(payload);
        alert("Thêm khuyến mãi thành công.");
      }

      resetImage();
      setModalOpen(false);
      setEditingPromotion(null);
      await loadPromotions();
    } catch (error) {
      if (uploadedImageUrl) await cleanupMediaByUrl(uploadedImageUrl);
      console.error("Lỗi lưu khuyến mãi:", error);
      alert(errorMessage(error, "Lưu khuyến mãi thất bại."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (promotion) => {
    if (!window.confirm(`Xóa mã khuyến mãi "${promotion.code}"?`)) return;
    try {
      await deletePromotion(promotion.id);
      await cleanupMediaByUrl(promotion.imageUrl);
      setPromotions((current) =>
        current.filter((item) => item.id !== promotion.id),
      );
      alert("Xóa khuyến mãi thành công.");
    } catch (error) {
      alert(errorMessage(error, "Xóa khuyến mãi thất bại."));
    }
  };

  const discountLabel = (promotion) =>
    promotion.discountType === "PERCENT"
      ? `${Number(promotion.discountValue)}%`
      : money(promotion.discountValue);

  return (
    <>
      <section className="promotion-page">
        <div className="promotion-card">
          <header className="promotion-header">
            <div>
              <span className="page-label">QUẢN LÝ RẠP CHIẾU PHIM</span>
              <h2>Khuyến mãi</h2>
              <p>Quản lý mã giảm giá và điều kiện áp dụng khi đặt vé.</p>
            </div>
            <button type="button" onClick={openCreate}>
              <AddRoundedIcon fontSize="small" />
              Thêm khuyến mãi
            </button>
          </header>

          <div className="promotion-toolbar">
            <label className="promotion-search">
              <SearchRoundedIcon fontSize="small" />
              <input
                type="search"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm theo mã, tên hoặc mô tả..."
              />
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ONLINE">Đang áp dụng</option>
              <option value="OFFLINE">Tạm ngừng</option>
              <option value="EXPIRED">Hết hạn</option>
            </select>
          </div>

          <div className="promotion-table-wrap">
            <table className="promotion-table">
              <thead>
                <tr>
                  <th>Khuyến mãi</th>
                  <th>Mức giảm</th>
                  <th>Điều kiện</th>
                  <th>Thời gian</th>
                  <th>Lượt dùng</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="promotion-empty">Đang tải dữ liệu...</td></tr>
                ) : filteredPromotions.length === 0 ? (
                  <tr><td colSpan="7" className="promotion-empty">Chưa có khuyến mãi phù hợp.</td></tr>
                ) : (
                  filteredPromotions.map((promotion) => (
                    <tr key={promotion.id}>
                      <td>
                        <div className="promotion-info">
                          {promotion.imageUrl ? (
                            <img src={promotion.imageUrl} alt={promotion.name} />
                          ) : (
                            <div className="promotion-no-image"><ImageOutlinedIcon /></div>
                          )}
                          <div>
                            <span className="promotion-code">{promotion.code}</span>
                            <strong>{promotion.name}</strong>
                            <p>{promotion.description || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong className="promotion-value">{discountLabel(promotion)}</strong>
                        <span className="promotion-muted">
                          {promotion.discountType === "PERCENT"
                            ? `Tối đa ${promotion.maxDiscountAmount ? money(promotion.maxDiscountAmount) : "không giới hạn"}`
                            : "Giảm trực tiếp"}
                        </span>
                      </td>
                      <td>
                        <strong>Đơn từ {money(promotion.minOrderAmount)}</strong>
                      </td>
                      <td className="promotion-period">
                        <strong>{promotion.startDate}</strong>
                        <span>đến {promotion.endDate}</span>
                      </td>
                      <td>
                        <strong>{promotion.usedCount || 0}</strong>
                        <span className="promotion-muted">
                          / {promotion.usageLimit ?? "Không giới hạn"}
                        </span>
                      </td>
                      <td>
                        <span className={`promotion-status ${promotion.status?.toLowerCase()}`}>
                          {promotionStatusLabel(promotion.status)}
                        </span>
                      </td>
                      <td>
                        <div className="promotion-actions">
                          <button type="button" onClick={() => openEdit(promotion)} title="Sửa">
                            <EditOutlinedIcon fontSize="small" />
                          </button>
                          <button
                            type="button"
                            className="danger"
                            onClick={() => handleDelete(promotion)}
                            title="Xóa"
                          >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {modalOpen && (
        <div className="promotion-modal-overlay" onMouseDown={closeModal}>
          <div
            className="promotion-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="promotion-modal-header">
              <div>
                <h3>{editingPromotion ? "Sửa khuyến mãi" : "Thêm khuyến mãi"}</h3>
                <p>Cấu hình mức giảm và điều kiện sử dụng mã.</p>
              </div>
              <button type="button" onClick={closeModal} aria-label="Đóng">×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="promotion-form-grid">
                <label>
                  <span>Mã khuyến mãi *</span>
                  <input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="WELCOME10"
                    pattern="[A-Z0-9_-]{3,50}"
                    required
                  />
                </label>
                <label>
                  <span>Tên khuyến mãi *</span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Chào thành viên mới"
                    required
                  />
                </label>

                <label className="full">
                  <span>Mô tả</span>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Mô tả ngắn về chương trình..."
                  />
                </label>

                <label>
                  <span>Loại giảm *</span>
                  <select
                    name="discountType"
                    value={form.discountType}
                    onChange={handleChange}
                  >
                    <option value="PERCENT">Phần trăm (%)</option>
                    <option value="FIXED">Số tiền cố định</option>
                  </select>
                </label>
                <label>
                  <span>Giá trị giảm *</span>
                  <input
                    type="number"
                    min="1"
                    max={form.discountType === "PERCENT" ? "100" : undefined}
                    name="discountValue"
                    value={form.discountValue}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  <span>Giá trị đơn tối thiểu</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    name="minOrderAmount"
                    value={form.minOrderAmount}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  <span>Giảm tối đa</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    name="maxDiscountAmount"
                    value={form.maxDiscountAmount}
                    onChange={handleChange}
                    disabled={form.discountType === "FIXED"}
                    placeholder={form.discountType === "FIXED" ? "Không áp dụng" : "50000"}
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

                <label>
                  <span>Giới hạn lượt dùng</span>
                  <input
                    type="number"
                    min="0"
                    name="usageLimit"
                    value={form.usageLimit}
                    onChange={handleChange}
                    placeholder="Để trống nếu không giới hạn"
                  />
                </label>
                <label>
                  <span>Trạng thái</span>
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="ONLINE">Đang áp dụng</option>
                    <option value="OFFLINE">Tạm ngừng</option>
                    <option value="EXPIRED">Hết hạn</option>
                  </select>
                </label>

                <div className="promotion-image-field full">
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
                    <img src={previewUrl} alt="Xem trước" />
                  ) : (
                    <div className="promotion-preview-empty"><ImageOutlinedIcon /></div>
                  )}
                </div>
              </div>

              <div className="promotion-modal-actions">
                <button type="button" className="secondary" onClick={closeModal}>Hủy</button>
                <button type="submit" className="primary" disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu khuyến mãi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default PromotionPage;
