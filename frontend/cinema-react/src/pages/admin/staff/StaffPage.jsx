import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useEffect, useMemo, useState } from "react";
import Pagination from "../../../components/common/Pagination";
import usePagination from "../../../hooks/usePagination";
import { createUser, deleteUser, getStaffUsers, updateUser } from "../../../api/userApi";
import "../../../styles/staff.css";

const emptyForm = () => ({
  fullName: "",
  email: "",
  phone: "",
  role: "STAFF",
  password: "",
});

const errorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  return data?.message || fallback;
};

const roleLabel = (role) => {
  if (role === "ADMIN") return "Quản trị viên";
  if (role === "STAFF") return "Nhân viên";
  return role || "—";
};

function StaffPage() {
  const auth = JSON.parse(localStorage.getItem("auth") || sessionStorage.getItem("auth") || "{}");
  const currentUserId = Number(auth.userId);
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getStaffUsers();
      setUsers(response.data || []);
    } catch (error) {
      alert(errorMessage(error, "Không tải được danh sách nhân viên."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const staffAccounts = useMemo(
    () => users.filter((user) => ["ADMIN", "STAFF"].includes(String(user.role || "").toUpperCase())),
    [users],
  );

  const filteredStaff = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    return staffAccounts.filter((user) => {
      const matchesKeyword =
        !value ||
        [user.fullName, user.email, user.phone, user.role]
          .filter(Boolean)
          .some((item) => item.toLowerCase().includes(value));

      return matchesKeyword && (!roleFilter || user.role === roleFilter);
    });
  }, [staffAccounts, keyword, roleFilter]);
  const pagination = usePagination(filteredStaff, 10);

  const summary = useMemo(() => {
    const admins = staffAccounts.filter((user) => user.role === "ADMIN").length;
    const staff = staffAccounts.filter((user) => user.role === "STAFF").length;
    return { total: staffAccounts.length, admins, staff };
  }, [staffAccounts]);

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
      role: user.role || "STAFF",
      password: "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setEditingUser(null);
    setForm(emptyForm());
    setModalOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const payloadFromForm = () => ({
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    role: form.role,
    password: form.password,
  });

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
      if (editingUser) {
        await updateUser(editingUser.id, payloadFromForm());
        alert("Cập nhật tài khoản nội bộ thành công.");
      } else {
        await createUser(payloadFromForm());
        alert("Thêm tài khoản nội bộ thành công.");
      }

      setEditingUser(null);
      setForm(emptyForm());
      setModalOpen(false);
      await loadUsers();
    } catch (error) {
      alert(errorMessage(error, "Lưu tài khoản nội bộ thất bại."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (Number(user.id) === currentUserId) {
      alert("Không thể xóa tài khoản đang đăng nhập.");
      return;
    }
    if (!window.confirm(`Xóa tài khoản "${user.fullName}"?`)) return;
    try {
      await deleteUser(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      alert("Xóa tài khoản nội bộ thành công.");
    } catch (error) {
      alert(errorMessage(error, "Xóa tài khoản nội bộ thất bại."));
    }
  };

  return (
    <section className="staff-page">
      <div className="staff-card">
        <header className="staff-header">
          <div>
            <span className="page-label">QUẢN LÝ RẠP CHIẾU PHIM</span>
            <h2>Nhân viên và quản trị viên</h2>
            <p>Quản lý tài khoản nội bộ và phân quyền truy cập hệ thống.</p>
          </div>
          <button type="button" onClick={openCreate}>
            <AddRoundedIcon fontSize="small" />
            Thêm tài khoản
          </button>
        </header>

        <div className="staff-summary">
          <div>
            <span>Tổng tài khoản</span>
            <strong>{summary.total}</strong>
          </div>
          <div>
            <span>Quản trị viên</span>
            <strong>{summary.admins}</strong>
          </div>
          <div>
            <span>Nhân viên</span>
            <strong>{summary.staff}</strong>
          </div>
        </div>

        <div className="staff-toolbar">
          <label className="staff-search">
            <SearchRoundedIcon fontSize="small" />
            <input
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo họ tên, email, số điện thoại..."
            />
          </label>

          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="">Tất cả vai trò</option>
            <option value="ADMIN">Quản trị viên</option>
            <option value="STAFF">Nhân viên</option>
          </select>
        </div>

        <div className="staff-table-wrap">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Quyền truy cập</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="staff-empty">Đang tải dữ liệu...</td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr><td colSpan="7" className="staff-empty">Chưa có tài khoản nội bộ phù hợp.</td></tr>
              ) : (
                pagination.paginatedItems.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="staff-name">
                        <span className="staff-avatar">
                          <ManageAccountsOutlinedIcon fontSize="small" />
                        </span>
                        <strong>{user.fullName}</strong>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || "—"}</td>
                    <td>
                      <span className={`staff-role ${user.role?.toLowerCase()}`}>
                        {roleLabel(user.role)}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="staff-permission" onClick={() => openEdit(user)}>
                        Quyền truy cập <EditOutlinedIcon fontSize="small" />
                      </button>
                    </td>
                    <td>
                      <span className="staff-status">Đang hoạt động</span>
                    </td>
                    <td>
                      <div className="staff-actions">
                        <button type="button" onClick={() => openEdit(user)} title="Sửa">
                          <EditOutlinedIcon fontSize="small" />
                        </button>
                        <button type="button" className="danger" onClick={() => handleDelete(user)} disabled={Number(user.id) === currentUserId} title={Number(user.id) === currentUserId ? "Không thể xóa tài khoản đang đăng nhập" : "Xóa"}>
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </button>
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
        <div className="staff-modal-overlay" onMouseDown={closeModal}>
          <div className="staff-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="staff-modal-header">
              <div>
                <h3>{editingUser ? "Sửa tài khoản nội bộ" : "Thêm tài khoản nội bộ"}</h3>
                <p>Chọn vai trò nhân viên hoặc quản trị viên cho tài khoản.</p>
              </div>
              <button type="button" onClick={closeModal} aria-label="Đóng">×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="staff-form-grid">
                <label>
                  <span>Họ tên *</span>
                  <input name="fullName" value={form.fullName} onChange={handleChange} required />
                </label>
                <label>
                  <span>Email *</span>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required />
                </label>
                <label>
                  <span>Số điện thoại</span>
                  <input name="phone" value={form.phone} onChange={handleChange} />
                </label>
                <label>
                  <span>Vai trò</span>
                  <select name="role" value={form.role} onChange={handleChange} disabled={Number(editingUser?.id) === currentUserId}>
                    <option value="STAFF">Nhân viên</option>
                    <option value="ADMIN">Quản trị viên</option>
                  </select>
                </label>
                <label className="full">
                  <span>{editingUser ? "Mật khẩu mới" : "Mật khẩu *"}</span>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required={!editingUser}
                    minLength={form.password ? 6 : undefined}
                    placeholder={editingUser ? "Để trống nếu không đổi mật khẩu" : "Tối thiểu 6 ký tự"}
                  />
                </label>
              </div>

              <div className="staff-modal-actions">
                <button type="button" className="secondary" onClick={closeModal}>Hủy</button>
                <button type="submit" className="primary" disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default StaffPage;

