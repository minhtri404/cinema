import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useEffect, useMemo, useState } from "react";
import Pagination from "../../../components/common/Pagination";
import usePagination from "../../../hooks/usePagination";
import {
  createUser,
  deleteUser,
  getCustomers,
  updateUser,
} from "../../../api/userApi";
import "../../../styles/user.css";

const emptyForm = () => ({
  fullName: "",
  email: "",
  phone: "",
  role: "CUSTOMER",
  password: "",
});

const errorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  return data?.message || fallback;
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const initials = (name) =>
  String(name || "U")
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

function UserPage() {
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getCustomers();
      setUsers(response.data || []);
    } catch (error) {
      alert(errorMessage(error, "Không tải được danh sách người dùng."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getCustomers()
      .then((response) => {
        if (active) setUsers(response.data || []);
      })
      .catch((error) => {
        if (active) alert(errorMessage(error, "Không tải được danh sách người dùng."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    return [...users]
      .filter((user) => {
        return (
          !value ||
          [user.id, user.fullName, user.email, user.phone]
            .filter((item) => item !== null && item !== undefined)
            .some((item) => String(item).toLowerCase().includes(value))
        );
      })
      .sort((a, b) => Number(a.id) - Number(b.id));
  }, [keyword, users]);
  const pagination = usePagination(filteredUsers, 10);

  const stats = useMemo(
    () => ({
      total: users.length,
      withPhone: users.filter((user) => Boolean(user.phone?.trim())).length,
      withoutPhone: users.filter((user) => !user.phone?.trim()).length,
    }),
    [users],
  );

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      role: "CUSTOMER",
      password: "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingUser(null);
    setForm(emptyForm());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!editingUser && form.password.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (editingUser && form.password && form.password.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    try {
      setSaving(true);
      const payload = { ...form, role: "CUSTOMER" };
      const response = editingUser
        ? await updateUser(editingUser.id, payload)
        : await createUser(payload);
      setUsers((current) =>
        editingUser
          ? current.map((item) => (item.id === editingUser.id ? response.data : item))
          : [...current, response.data],
      );
      setModalOpen(false);
      setEditingUser(null);
      setForm(emptyForm());
      alert(editingUser ? "Cập nhật khách hàng thành công." : "Thêm khách hàng thành công.");
    } catch (error) {
      alert(errorMessage(error, "Không thể lưu khách hàng."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Xóa tài khoản “${user.fullName}” (${user.email})?`)) return;
    try {
      setDeletingId(user.id);
      await deleteUser(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      alert("Đã xóa khách hàng.");
    } catch (error) {
      alert(errorMessage(error, "Không thể xóa khách hàng."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="user-page">
      <div className="user-card">
        <header className="user-header">
          <div>
            <span className="page-label">QUẢN LÝ RẠP CHIẾU PHIM</span>
            <h2>Quản lý khách hàng</h2>
            <p>Quản lý thông tin và tài khoản khách hàng đặt vé trực tuyến.</p>
          </div>
          <button type="button" onClick={openCreate}>
            <AddRoundedIcon fontSize="small" /> Thêm khách hàng
          </button>
        </header>

        <div className="user-stats">
          <article><span className="blue"><GroupOutlinedIcon /></span><div><small>Tổng khách hàng</small><strong>{stats.total}</strong></div></article>
          <article><span className="green"><PersonOutlineRoundedIcon /></span><div><small>Có số điện thoại</small><strong>{stats.withPhone}</strong></div></article>
          <article><span className="amber"><PersonOutlineRoundedIcon /></span><div><small>Chưa có số điện thoại</small><strong>{stats.withoutPhone}</strong></div></article>
        </div>

        <div className="user-toolbar">
          <label className="user-search">
            <SearchRoundedIcon fontSize="small" />
            <input type="search" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm họ tên, email, số điện thoại..." />
          </label>
          <button type="button" className="refresh" onClick={loadUsers}>Làm mới</button>
        </div>

        <div className="user-table-wrap">
          <table className="user-table">
            <thead><tr><th>Khách hàng</th><th>Liên hệ</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="user-empty">Đang tải dữ liệu...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="4" className="user-empty">Không có khách hàng phù hợp.</td></tr>
              ) : pagination.paginatedItems.map((user) => {
                return (
                  <tr key={user.id}>
                    <td><div className="user-identity"><span className="user-avatar-large customer">{initials(user.fullName)}</span><div><strong>{user.fullName}</strong><small>#{user.id}</small></div></div></td>
                    <td><strong>{user.email}</strong><small>{user.phone || "Chưa có số điện thoại"}</small></td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td><div className="user-actions"><button type="button" onClick={() => openEdit(user)} title="Chỉnh sửa"><EditOutlinedIcon fontSize="small" /></button><button type="button" className="delete" onClick={() => handleDelete(user)} disabled={deletingId === user.id} title="Xóa"><DeleteOutlineRoundedIcon fontSize="small" /></button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination {...pagination} />
        </div>
      </div>

      {modalOpen && (
        <div className="user-modal-overlay" onMouseDown={closeModal}>
          <form className="user-modal" onSubmit={handleSubmit} onMouseDown={(event) => event.stopPropagation()}>
            <div className="user-modal-header"><div><span>{editingUser ? "CHỈNH SỬA KHÁCH HÀNG" : "TẠO TÀI KHOẢN KHÁCH HÀNG"}</span><h3>{editingUser ? editingUser.fullName : "Thêm khách hàng"}</h3></div><button type="button" onClick={closeModal}>×</button></div>
            <div className="user-form-grid">
              <label className="full"><span>Họ và tên *</span><input required value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} /></label>
              <label><span>Email *</span><input required type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></label>
              <label><span>Số điện thoại</span><input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} /></label>
              <label><span>{editingUser ? "Mật khẩu mới" : "Mật khẩu *"}</span><input type="password" required={!editingUser} minLength={form.password ? 6 : undefined} value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder={editingUser ? "Để trống nếu không đổi" : "Tối thiểu 6 ký tự"} /></label>
            </div>
            <div className="user-modal-actions"><button type="button" className="secondary" onClick={closeModal}>Hủy</button><button type="submit" className="primary" disabled={saving}>{saving ? "Đang lưu..." : editingUser ? "Lưu thay đổi" : "Tạo tài khoản"}</button></div>
          </form>
        </div>
      )}
    </section>
  );
}

export default UserPage;
