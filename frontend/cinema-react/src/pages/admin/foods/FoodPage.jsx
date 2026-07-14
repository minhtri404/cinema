import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useEffect, useMemo, useState } from "react";
import { createFood, deleteFood, getFoods, updateFood, updateFoodStock, uploadFoodImage } from "../../../api/foodApi";
import "../../../styles/food.css";

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
  lowStockThreshold: "10",
  status: "ACTIVE",
  displayOrder: "0",
});

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const errorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  return data?.message || fallback;
};

function FoodPage() {
  const [foods, setFoods] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const loadFoods = async () => {
    try {
      setLoading(true);
      const response = await getFoods();
      setFoods(response.data || []);
    } catch (error) {
      alert(errorMessage(error, "Không tải được danh sách thức ăn."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFoods();
  }, []);

  const filteredFoods = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    return foods.filter((food) => {
      const matchesKeyword =
        !value ||
        [food.sku, food.name, food.description]
          .filter(Boolean)
          .some((item) => item.toLowerCase().includes(value));
      return matchesKeyword && (!categoryFilter || food.category === categoryFilter) && (!statusFilter || food.status === statusFilter);
    });
  }, [foods, keyword, categoryFilter, statusFilter]);

  const summary = useMemo(() => {
    const active = foods.filter((food) => food.status === "ACTIVE").length;
    const lowStock = foods.filter((food) => Number(food.stockQuantity || 0) <= Number(food.lowStockThreshold || 0)).length;
    const inventoryValue = foods.reduce((total, food) => total + Number(food.price || 0) * Number(food.stockQuantity || 0), 0);
    return { total: foods.length, active, lowStock, inventoryValue };
  }, [foods]);

  const resetImage = () => {
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl("");
  };

  const openCreate = () => {
    resetImage();
    setEditingFood(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (food) => {
    resetImage();
    setEditingFood(food);
    setForm({
      sku: food.sku || "",
      name: food.name || "",
      description: food.description || "",
      category: food.category || "COMBO",
      size: food.size || "NONE",
      price: food.price ?? "",
      costPrice: food.costPrice ?? "",
      imageUrl: food.imageUrl || "",
      stockQuantity: food.stockQuantity ?? "0",
      lowStockThreshold: food.lowStockThreshold ?? "10",
      status: food.status || "ACTIVE",
      displayOrder: food.displayOrder ?? "0",
    });
    setPreviewUrl(food.imageUrl || "");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    resetImage();
    setEditingFood(null);
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
    price: Number(form.price),
    costPrice: form.costPrice === "" ? null : Number(form.costPrice),
    stockQuantity: Number(form.stockQuantity || 0),
    lowStockThreshold: Number(form.lowStockThreshold || 0),
    displayOrder: Number(form.displayOrder || 0),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      let imageUrl = form.imageUrl;
      if (imageFile) {
        const uploadResponse = await uploadFoodImage(imageFile);
        imageUrl = uploadResponse.data?.url || "";
      }
      const payload = { ...payloadFromForm(), imageUrl };
      if (editingFood) {
        await updateFood(editingFood.id, payload);
        alert("Cập nhật thức ăn thành công.");
      } else {
        await createFood(payload);
        alert("Thêm thức ăn thành công.");
      }
      closeModal();
      await loadFoods();
    } catch (error) {
      alert(errorMessage(error, "Lưu thức ăn thất bại."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (food) => {
    if (!window.confirm(`Xóa món "${food.name}"?`)) return;
    try {
      await deleteFood(food.id);
      setFoods((current) => current.filter((item) => item.id !== food.id));
      alert("Xóa thức ăn thành công.");
    } catch (error) {
      alert(errorMessage(error, "Xóa thức ăn thất bại."));
    }
  };

  const quickUpdateStock = async (food) => {
    const value = window.prompt("Nhập số lượng tồn kho mới:", food.stockQuantity ?? 0);
    if (value === null) return;
    const quantity = Number(value);
    if (!Number.isInteger(quantity) || quantity < 0) {
      alert("Số lượng tồn kho không hợp lệ.");
      return;
    }
    await updateFoodStock(food.id, quantity);
    await loadFoods();
  };

  return (
    <section className="food-page">
      <div className="food-card">
        <header className="food-header">
          <div>
            <span className="page-label">CINEMA MANAGEMENT</span>
            <h2>Thức ăn & Combo</h2>
            <p>Quản lý bắp nước, snack, combo bán kèm vé và tồn kho.</p>
          </div>
          <button type="button" onClick={openCreate}>
            <AddRoundedIcon fontSize="small" />
            Thêm món
          </button>
        </header>

        <div className="food-summary">
          <div><span>Tổng món</span><strong>{summary.total}</strong></div>
          <div><span>Đang bán</span><strong>{summary.active}</strong></div>
          <div><span>Sắp hết</span><strong>{summary.lowStock}</strong></div>
          <div><span>Giá trị tồn</span><strong>{money(summary.inventoryValue)}</strong></div>
        </div>

        <div className="food-toolbar">
          <label className="food-search">
            <SearchRoundedIcon fontSize="small" />
            <input type="search" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm theo SKU, tên hoặc mô tả..." />
          </label>
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="">Tất cả loại</option>
            <option value="POPCORN">Bắp</option>
            <option value="DRINK">Nước</option>
            <option value="COMBO">Combo</option>
            <option value="SNACK">Snack</option>
            <option value="OTHER">Khác</option>
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
          </select>
        </div>

        <div className="food-table-wrap">
          <table className="food-table">
            <thead>
              <tr>
                <th>Món</th>
                <th>Loại</th>
                <th>Giá bán</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th>Thứ tự</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="food-empty">Đang tải dữ liệu...</td></tr>
              ) : filteredFoods.length === 0 ? (
                <tr><td colSpan="7" className="food-empty">Chưa có món phù hợp.</td></tr>
              ) : (
                filteredFoods.map((food) => {
                  const lowStock = Number(food.stockQuantity || 0) <= Number(food.lowStockThreshold || 0);
                  return (
                    <tr key={food.id}>
                      <td>
                        <div className="food-info">
                          {food.imageUrl ? <img src={food.imageUrl} alt={food.name} /> : <div className="food-no-image"><RestaurantMenuOutlinedIcon /></div>}
                          <div>
                            <span className="food-sku">{food.sku}</span>
                            <strong>{food.name}</strong>
                            <p>{food.description || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td><strong>{food.category}</strong><span className="food-muted">Size {food.size || "NONE"}</span></td>
                      <td><strong>{money(food.price)}</strong><span className="food-muted">Giá vốn {food.costPrice ? money(food.costPrice) : "—"}</span></td>
                      <td>
                        <button type="button" className={`food-stock ${lowStock ? "low" : ""}`} onClick={() => quickUpdateStock(food)}>{food.stockQuantity}</button>
                        <span className="food-muted">Ngưỡng {food.lowStockThreshold}</span>
                      </td>
                      <td><span className={`food-status ${food.status?.toLowerCase().replaceAll("_", "-")}`}>{food.status}</span></td>
                      <td>{food.displayOrder}</td>
                      <td>
                        <div className="food-actions">
                          <button type="button" onClick={() => openEdit(food)} title="Sửa"><EditOutlinedIcon fontSize="small" /></button>
                          <button type="button" className="danger" onClick={() => handleDelete(food)} title="Xóa"><DeleteOutlineRoundedIcon fontSize="small" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="food-modal-overlay" onMouseDown={closeModal}>
          <div className="food-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="food-modal-header">
              <div>
                <h3>{editingFood ? "Sửa thức ăn" : "Thêm thức ăn"}</h3>
                <p>Thiết lập thông tin món bán kèm vé.</p>
              </div>
              <button type="button" onClick={closeModal} aria-label="Đóng">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="food-form-grid">
                <label><span>SKU *</span><input name="sku" value={form.sku} onChange={handleChange} required /></label>
                <label><span>Tên món *</span><input name="name" value={form.name} onChange={handleChange} required /></label>
                <label className="full"><span>Mô tả</span><textarea name="description" value={form.description} onChange={handleChange} rows="3" /></label>
                <label><span>Loại</span><select name="category" value={form.category} onChange={handleChange}><option value="POPCORN">Bắp</option><option value="DRINK">Nước</option><option value="COMBO">Combo</option><option value="SNACK">Snack</option><option value="OTHER">Khác</option></select></label>
                <label><span>Size</span><select name="size" value={form.size} onChange={handleChange}><option value="NONE">NONE</option><option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option></select></label>
                <label><span>Giá bán *</span><input type="number" min="1" step="1000" name="price" value={form.price} onChange={handleChange} required /></label>
                <label><span>Giá vốn</span><input type="number" min="0" step="1000" name="costPrice" value={form.costPrice} onChange={handleChange} /></label>
                <label><span>Tồn kho</span><input type="number" min="0" name="stockQuantity" value={form.stockQuantity} onChange={handleChange} /></label>
                <label><span>Ngưỡng cảnh báo</span><input type="number" min="0" name="lowStockThreshold" value={form.lowStockThreshold} onChange={handleChange} /></label>
                <label><span>Trạng thái</span><select name="status" value={form.status} onChange={handleChange}><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option><option value="OUT_OF_STOCK">OUT_OF_STOCK</option></select></label>
                <label><span>Thứ tự</span><input type="number" min="0" name="displayOrder" value={form.displayOrder} onChange={handleChange} /></label>
                <label className="full"><span>URL ảnh</span><input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." /></label>
                <div className="food-upload-field full">
                  <label>
                    <span>Ảnh món</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
                    <small>Chọn ảnh từ máy. JPG, PNG, WEBP tối đa 5MB.</small>
                  </label>
                  {previewUrl || form.imageUrl ? (
                    <img src={previewUrl || form.imageUrl} alt="Xem trước món" />
                  ) : (
                    <div className="food-upload-empty"><RestaurantMenuOutlinedIcon /></div>
                  )}
                </div>
              </div>
              <div className="food-modal-actions">
                <button type="button" className="secondary" onClick={closeModal}>Hủy</button>
                <button type="submit" className="primary" disabled={saving}>{saving ? "Đang lưu..." : "Lưu món"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default FoodPage;
