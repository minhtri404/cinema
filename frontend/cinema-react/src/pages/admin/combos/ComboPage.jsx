import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FastfoodOutlinedIcon from "@mui/icons-material/FastfoodOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useEffect, useMemo, useState } from "react";
import Pagination from "../../../components/common/Pagination";
import usePagination from "../../../hooks/usePagination";
import { createFood, deleteFood, getFoods, updateFood, updateFoodStock, uploadComboImage } from "../../../api/foodApi";
import { cleanupMediaByUrl } from "../../../api/mediaApi";
import { inventoryStatusLabel } from "../../../utils/displayLabels";
import "../../../styles/combo.css";

const emptyForm = () => ({
  sku: "",
  name: "",
  description: "",
  category: "COMBO",
  size: "NONE",
  price: "",
  costPrice: "",
  imageUrl: "",
  stockQuantity: "0",
  lowStockThreshold: "5",
  status: "ACTIVE",
  displayOrder: "0",
});

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const errorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  return data?.message || fallback;
};

function ComboPage() {
  const [combos, setCombos] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const loadCombos = async () => {
    try {
      setLoading(true);
      const response = await getFoods();
      setCombos((response.data || []).filter((item) => item.category === "COMBO"));
    } catch (error) {
      alert(errorMessage(error, "Không tải được danh sách combo."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCombos();
  }, []);

  const filteredCombos = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    return combos.filter((combo) => {
      const matchesKeyword =
        !value ||
        [combo.sku, combo.name, combo.description]
          .filter(Boolean)
          .some((item) => item.toLowerCase().includes(value));
      return matchesKeyword && (!statusFilter || combo.status === statusFilter);
    });
  }, [combos, keyword, statusFilter]);
  const pagination = usePagination(filteredCombos, 8);

  const summary = useMemo(() => {
    const active = combos.filter((combo) => combo.status === "ACTIVE").length;
    const lowStock = combos.filter(
      (combo) => Number(combo.stockQuantity || 0) <= Number(combo.lowStockThreshold || 0),
    ).length;
    const inventoryValue = combos.reduce(
      (total, combo) => total + Number(combo.price || 0) * Number(combo.stockQuantity || 0),
      0,
    );
    return { total: combos.length, active, lowStock, inventoryValue };
  }, [combos]);

  const resetImage = () => {
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl("");
  };

  const openCreate = () => {
    resetImage();
    setEditingCombo(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (combo) => {
    resetImage();
    setEditingCombo(combo);
    setForm({
      sku: combo.sku || "",
      name: combo.name || "",
      description: combo.description || "",
      category: "COMBO",
      size: combo.size || "NONE",
      price: combo.price ?? "",
      costPrice: combo.costPrice ?? "",
      imageUrl: combo.imageUrl || "",
      stockQuantity: combo.stockQuantity ?? "0",
      lowStockThreshold: combo.lowStockThreshold ?? "5",
      status: combo.status || "ACTIVE",
      displayOrder: combo.displayOrder ?? "0",
    });
    setPreviewUrl(combo.imageUrl || "");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    resetImage();
    setEditingCombo(null);
    setForm(emptyForm());
    setModalOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === "sku" ? value.toUpperCase().replace(/\s+/g, "") : value,
    }));
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

  const payloadFromForm = () => ({
    ...form,
    category: "COMBO",
    size: "NONE",
    price: Number(form.price),
    costPrice: form.costPrice === "" ? null : Number(form.costPrice),
    stockQuantity: Number(form.stockQuantity || 0),
    lowStockThreshold: Number(form.lowStockThreshold || 0),
    displayOrder: Number(form.displayOrder || 0),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const previousImageUrl = editingCombo?.imageUrl || "";
    let uploadedImageUrl = "";

    try {
      setSaving(true);
      let imageUrl = form.imageUrl;
      if (imageFile) {
        const uploadResponse = await uploadComboImage(imageFile);
        imageUrl = uploadResponse.data?.url || "";
        uploadedImageUrl = imageUrl;
      }
      const payload = { ...payloadFromForm(), imageUrl };
      if (editingCombo) {
        await updateFood(editingCombo.id, payload);
        if (previousImageUrl && previousImageUrl !== imageUrl) {
          await cleanupMediaByUrl(previousImageUrl);
        }
        alert("Cập nhật combo thành công.");
      } else {
        await createFood(payload);
        alert("Thêm combo thành công.");
      }
      closeModal();
      await loadCombos();
    } catch (error) {
      if (uploadedImageUrl) await cleanupMediaByUrl(uploadedImageUrl);
      alert(errorMessage(error, "Lưu combo thất bại."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (combo) => {
    if (!window.confirm(`Xóa combo "${combo.name}"?`)) return;
    try {
      await deleteFood(combo.id);
      await cleanupMediaByUrl(combo.imageUrl);
      setCombos((current) => current.filter((item) => item.id !== combo.id));
      alert("Xóa combo thành công.");
    } catch (error) {
      alert(errorMessage(error, "Xóa combo thất bại."));
    }
  };

  const quickUpdateStock = async (combo) => {
    const value = window.prompt("Nhập số lượng combo tồn kho mới:", combo.stockQuantity ?? 0);
    if (value === null) return;
    const quantity = Number(value);
    if (!Number.isInteger(quantity) || quantity < 0) {
      alert("Số lượng tồn kho không hợp lệ.");
      return;
    }
    await updateFoodStock(combo.id, quantity);
    await loadCombos();
  };

  return (
    <section className="combo-page">
      <div className="combo-hero">
        <div>
          <span className="page-label">QUẢN LÝ RẠP CHIẾU PHIM</span>
          <h2>Combo</h2>
          <p>Quản lý combo bắp nước bán kèm vé, giá bán, tồn kho và trạng thái kinh doanh.</p>
        </div>
        <button type="button" onClick={openCreate}>
          <AddRoundedIcon fontSize="small" />
          Thêm combo
        </button>
      </div>

      <div className="combo-summary">
        <article>
          <FastfoodOutlinedIcon />
          <span>Tổng combo</span>
          <strong>{summary.total}</strong>
        </article>
        <article>
          <LocalOfferOutlinedIcon />
          <span>Đang bán</span>
          <strong>{summary.active}</strong>
        </article>
        <article>
          <Inventory2OutlinedIcon />
          <span>Sắp hết</span>
          <strong>{summary.lowStock}</strong>
        </article>
        <article>
          <LocalOfferOutlinedIcon />
          <span>Giá trị tồn</span>
          <strong>{money(summary.inventoryValue)}</strong>
        </article>
      </div>

      <div className="combo-card">
        <div className="combo-toolbar">
          <label className="combo-search">
            <SearchRoundedIcon fontSize="small" />
            <input
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo SKU, tên combo hoặc mô tả..."
            />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang bán</option>
            <option value="INACTIVE">Ngừng bán</option>
            <option value="OUT_OF_STOCK">Hết hàng</option>
          </select>
        </div>

        <div className="combo-grid">
          {loading ? (
            <div className="combo-empty">Đang tải dữ liệu...</div>
          ) : filteredCombos.length === 0 ? (
            <div className="combo-empty">Chưa có combo phù hợp.</div>
          ) : (
            pagination.paginatedItems.map((combo) => {
              const lowStock = Number(combo.stockQuantity || 0) <= Number(combo.lowStockThreshold || 0);
              return (
                <article className="combo-item" key={combo.id}>
                  <div className="combo-image">
                    {combo.imageUrl ? (
                      <img src={combo.imageUrl} alt={combo.name} />
                    ) : (
                      <FastfoodOutlinedIcon />
                    )}
                    <span className={`combo-status ${combo.status?.toLowerCase().replaceAll("_", "-")}`}>
                      {inventoryStatusLabel(combo.status)}
                    </span>
                  </div>

                  <div className="combo-body">
                    <div className="combo-title-row">
                      <span>{combo.sku}</span>
                      <strong>{money(combo.price)}</strong>
                    </div>
                    <h3>{combo.name}</h3>
                    <p>{combo.description || "Chưa có mô tả combo."}</p>

                    <div className="combo-meta">
                      <button
                        type="button"
                        className={`combo-stock ${lowStock ? "low" : ""}`}
                        onClick={() => quickUpdateStock(combo)}
                      >
                        Tồn: {combo.stockQuantity}
                      </button>
                      <span>Ngưỡng: {combo.lowStockThreshold}</span>
                      <span>Thứ tự: {combo.displayOrder}</span>
                    </div>

                    <div className="combo-actions">
                      <button type="button" onClick={() => openEdit(combo)}>
                        <EditOutlinedIcon fontSize="small" />
                        Sửa
                      </button>
                      <button type="button" className="danger" onClick={() => handleDelete(combo)}>
                        <DeleteOutlineRoundedIcon fontSize="small" />
                        Xóa
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
        <Pagination {...pagination} />
      </div>

      {modalOpen && (
        <div className="combo-modal-overlay" onMouseDown={closeModal}>
          <div className="combo-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="combo-modal-header">
              <div>
                <h3>{editingCombo ? "Sửa combo" : "Thêm combo"}</h3>
                <p>Combo luôn được lưu với loại COMBO để tách khỏi thức ăn lẻ.</p>
              </div>
              <button type="button" onClick={closeModal} aria-label="Đóng">×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="combo-form-grid">
                <label><span>SKU *</span><input name="sku" value={form.sku} onChange={handleChange} required /></label>
                <label><span>Tên combo *</span><input name="name" value={form.name} onChange={handleChange} required /></label>
                <label className="full"><span>Mô tả thành phần</span><textarea name="description" value={form.description} onChange={handleChange} rows="3" placeholder="Ví dụ: 1 bắp lớn + 2 nước size M" /></label>
                <label><span>Giá bán *</span><input type="number" min="1" step="1000" name="price" value={form.price} onChange={handleChange} required /></label>
                <label><span>Giá vốn</span><input type="number" min="0" step="1000" name="costPrice" value={form.costPrice} onChange={handleChange} /></label>
                <label><span>Tồn kho</span><input type="number" min="0" name="stockQuantity" value={form.stockQuantity} onChange={handleChange} /></label>
                <label><span>Ngưỡng cảnh báo</span><input type="number" min="0" name="lowStockThreshold" value={form.lowStockThreshold} onChange={handleChange} /></label>
                <label><span>Trạng thái</span><select name="status" value={form.status} onChange={handleChange}><option value="ACTIVE">Đang bán</option><option value="INACTIVE">Ngừng bán</option><option value="OUT_OF_STOCK">Hết hàng</option></select></label>
                <label><span>Thứ tự</span><input type="number" min="0" name="displayOrder" value={form.displayOrder} onChange={handleChange} /></label>
                <label className="full"><span>URL ảnh</span><input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." /></label>
                <div className="combo-upload-field full">
                  <label>
                    <span>Ảnh combo</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
                    <small>Chọn ảnh từ máy. JPG, PNG, WEBP tối đa 5MB.</small>
                  </label>
                  {previewUrl || form.imageUrl ? (
                    <img src={previewUrl || form.imageUrl} alt="Xem trước combo" />
                  ) : (
                    <div className="combo-upload-empty"><FastfoodOutlinedIcon /></div>
                  )}
                </div>
              </div>
              <div className="combo-modal-actions">
                <button type="button" className="secondary" onClick={closeModal}>Hủy</button>
                <button type="submit" className="primary" disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu combo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default ComboPage;
