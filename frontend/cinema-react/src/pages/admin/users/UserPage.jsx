import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useEffect, useMemo, useState } from "react";
import {
  createUser,
  deleteUser,
  getUsers,
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

const normalizeRole = (role) => {
  const value = String(role || "CUSTOMER").toUpperCase();
  return value === "USER" ? "CUSTOMER" : value;
};

const ROLE_LABELS = {
  CUSTOMER: "Khách hàng",
  STAFF: "Nhân viên",
  ADMIN: "Quản trị viên",
};

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
  const auth = JSON.parse(localStorage.getItem("auth") || "{}");
  const currentUserId = Number(auth.userId);
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.data || []);
    } catch (error) {
      alert(errorMessage(error, "Không tải được danh sách người dùng."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getUsers()
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
        const role = normalizeRole(user.role);
        const matchesKeyword =
          !value ||
          [user.id, user.fullName, user.email, user.phone]
            .filter((item) => item !== null && item !== undefined)
            .some((item) => String(item).toLowerCase().includes(value));
        return matchesKeyword && (!roleFilter || role === roleFilter);
      })
      .sort((a, b) => Number(a.id) - Number(b.id));
  }, [keyword, roleFilter, users]);

  const stats = useMemo(
    () => ({
      total: users.length,
      customers: users.filter((user) => normalizeRole(user.role) === "CUSTOMER").length,
      staff: users.filter((user) => normalizeRole(user.role) === "STAFF").length,
      admins: users.filter((user) => normalizeRole(user.role) === "ADMIN").length,
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
      role: normalizeRole(user.role),
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
      const response = editingUser
        ? await updateUser(editingUser.id, form)
        : await createUser(form);
      setUsers((current) =>
        editingUser
          ? current.map((item) => (item.id === editingUser.id ? response.data : item))
          : [...current, response.data],
      );
      setModalOpen(false);
      setEditingUser(null);
      setForm(emptyForm());
      alert(editingUser ? "Cập nhật người dùng thành công." : "Thêm người dùng thành công.");
    } catch (error) {
      alert(errorMessage(error, "Không thể lưu người dùng."));
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
      alert("Đã xóa người dùng.");
    } catch (error) {
      alert(errorMessage(error, "Không thể xóa người dùng."));
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
            <h2>Quản lý người dùng</h2>
            <p>Quản lý tài khoản khách hàng, nhân viên và quản trị viên.</p>
          </div>
          <button type="button" onClick={openCreate}>
            <AddRoundedIcon fontSize="small" /> Thêm người dùng
          </button>
        </header>

        <div className="user-stats">
          <article><span className="blue"><GroupOutlinedIcon /></span><div><small>Tổng tài khoản</small><strong>{stats.total}</strong></div></article>
          <article><span className="green"><PersonOutlineRoundedIcon /></span><div><small>Khách hàng</small><strong>{stats.customers}</strong></div></article>
          <article><span className="amber"><BadgeOutlinedIcon /></span><div><small>Nhân viên</small><strong>{stats.staff}</strong></div></article>
          <article><span className="violet"><AdminPanelSettingsOutlinedIcon /></span><div><small>Quản trị viên</small><strong>{stats.admins}</strong></div></article>
        </div>

        <div className="user-toolbar">
          <label className="user-search">
            <SearchRoundedIcon fontSize="small" />
            <input type="search" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm họ tên, email, số điện thoại..." />
          </label>
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="">Tất cả vai trò</option>
            <option value="CUSTOMER">Khách hàng</option>
            <option value="STAFF">Nhân viên</option>
            <option value="ADMIN">Quản trị viên</option>
          </select>
          <button type="button" className="refresh" onClick={loadUsers}>Làm mới</button>
        </div>

        <div className="user-table-wrap">
          <table className="user-table">
            <thead><tr><th>Người dùng</th><th>Liên hệ</th><th>Vai trò</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="user-empty">Đang tải dữ liệu...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="5" className="user-empty">Không có người dùng phù hợp.</td></tr>
              ) : filteredUsers.map((user) => {
                const role = normalizeRole(user.role);
                const isCurrent = Number(user.id) === currentUserId;
                return (
                  <tr key={user.id}>
                    <td><div className="user-identity"><span className={`user-avatar-large ${role.toLowerCase()}`}>{initials(user.fullName)}</span><div><strong>{user.fullName}</strong><small>#{user.id}{isCurrent ? " · Tài khoản của bạn" : ""}</small></div></div></td>
                    <td><strong>{user.email}</strong><small>{user.phone || "Chưa có số điện thoại"}</small></td>
                    <td><span className={`user-role ${role.toLowerCase()}`}>{ROLE_LABELS[role] || role}</span></td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td><div className="user-actions"><button type="button" onClick={() => openEdit(user)} title="Chỉnh sửa"><EditOutlinedIcon fontSize="small" /></button><button type="button" className="delete" onClick={() => handleDelete(user)} disabled={isCurrent || deletingId === user.id} title={isCurrent ? "Không thể xóa tài khoản đang đăng nhập" : "Xóa"}><DeleteOutlineRoundedIcon fontSize="small" /></button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="user-modal-overlay" onMouseDown={closeModal}>
          <form className="user-modal" onSubmit={handleSubmit} onMouseDown={(event) => event.stopPropagation()}>
            <div className="user-modal-header"><div><span>{editingUser ? "CHỈNH SỬA TÀI KHOẢN" : "TẠO TÀI KHOẢN"}</span><h3>{editingUser ? editingUser.fullName : "Thêm người dùng"}</h3></div><button type="button" onClick={closeModal}>×</button></div>
            <div className="user-form-grid">
              <label className="full"><span>Họ và tên *</span><input required value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} /></label>
              <label><span>Email *</span><input required type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></label>
              <label><span>Số điện thoại</span><input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} /></label>
              <label><span>Vai trò *</span><select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} disabled={Number(editingUser?.id) === currentUserId}><option value="CUSTOMER">Khách hàng</option><option value="STAFF">Nhân viên</option><option value="ADMIN">Quản trị viên</option></select></label>
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
