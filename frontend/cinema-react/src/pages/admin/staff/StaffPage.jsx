import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useEffect, useMemo, useState } from "react";
import { createUser, deleteUser, getUsers, updateUser } from "../../../api/userApi";
import "../../../styles/staff.css";

const emptyForm = () => ({
  fullName: "",
  email: "",
  phone: "",
  role: "STAFF",
  password: "demo_password_change_me",
});

const errorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  return data?.message || fallback;
};

const roleLabel = (role) => {
  if (role === "ADMIN") return "Quáº£n trá»‹";
  if (role === "STAFF") return "NhÃ¢n viÃªn";
  return role || "â€”";
};

function StaffPage() {
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
      const response = await getUsers();
      setUsers(response.data || []);
    } catch (error) {
      alert(errorMessage(error, "KhÃ´ng táº£i Ä‘Æ°á»£c danh sÃ¡ch nhÃ¢n viÃªn."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const staffAccounts = useMemo(
    () => users.filter((user) => ["ADMIN", "STAFF"].includes(user.role)),
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
    try {
      setSaving(true);
      if (editingUser) {
        await updateUser(editingUser.id, payloadFromForm());
        alert("Cáº­p nháº­t tÃ i khoáº£n nhÃ¢n viÃªn thÃ nh cÃ´ng.");
      } else {
        await createUser(payloadFromForm());
        alert("ThÃªm tÃ i khoáº£n nhÃ¢n viÃªn thÃ nh cÃ´ng.");
      }

      closeModal();
      await loadUsers();
    } catch (error) {
      alert(errorMessage(error, "LÆ°u tÃ i khoáº£n nhÃ¢n viÃªn tháº¥t báº¡i."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`XÃ³a tÃ i khoáº£n "${user.fullName}"?`)) return;
    try {
      await deleteUser(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      alert("XÃ³a tÃ i khoáº£n nhÃ¢n viÃªn thÃ nh cÃ´ng.");
    } catch (error) {
      alert(errorMessage(error, "XÃ³a tÃ i khoáº£n nhÃ¢n viÃªn tháº¥t báº¡i."));
    }
  };

  return (
    <section className="staff-page">
      <div className="staff-card">
        <header className="staff-header">
          <div>
            <span className="page-label">CINEMA MANAGEMENT</span>
            <h2>TÃ i khoáº£n nhÃ¢n viÃªn</h2>
            <p>Quáº£n lÃ½ tÃ i khoáº£n admin, nhÃ¢n viÃªn ráº¡p vÃ  quyá»n truy cáº­p há»‡ thá»‘ng.</p>
          </div>
          <button type="button" onClick={openCreate}>
            <AddRoundedIcon fontSize="small" />
            ThÃªm nhÃ¢n viÃªn
          </button>
        </header>

        <div className="staff-summary">
          <div>
            <span>Tá»•ng tÃ i khoáº£n</span>
            <strong>{summary.total}</strong>
          </div>
          <div>
            <span>Quáº£n trá»‹</span>
            <strong>{summary.admins}</strong>
          </div>
          <div>
            <span>NhÃ¢n viÃªn</span>
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
              placeholder="TÃ¬m theo há» tÃªn, email, sá»‘ Ä‘iá»‡n thoáº¡i..."
            />
          </label>

          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="">Táº¥t cáº£ vai trÃ²</option>
            <option value="ADMIN">Quáº£n trá»‹</option>
            <option value="STAFF">NhÃ¢n viÃªn</option>
          </select>
        </div>

        <div className="staff-table-wrap">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Há» tÃªn</th>
                <th>Email</th>
                <th>Sá»‘ Ä‘iá»‡n thoáº¡i</th>
                <th>Vai trÃ²</th>
                <th>Quyá»n truy cáº­p</th>
                <th>Tráº¡ng thÃ¡i</th>
                <th>Thao tÃ¡c</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="staff-empty">Äang táº£i dá»¯ liá»‡u...</td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="7" className="staff-empty">ChÆ°a cÃ³ tÃ i khoáº£n nhÃ¢n viÃªn phÃ¹ há»£p.</td>
                </tr>
              ) : (
                filteredStaff.map((user) => (
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
                    <td>{user.phone || "â€”"}</td>
                    <td>
                      <span className={`staff-role ${user.role?.toLowerCase()}`}>
                        {roleLabel(user.role)}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="staff-permission" onClick={() => openEdit(user)}>
                        Quyá»n truy cáº­p <EditOutlinedIcon fontSize="small" />
                      </button>
                    </td>
                    <td>
                      <span className="staff-status">ONLINE</span>
                    </td>
                    <td>
                      <div className="staff-actions">
                        <button type="button" onClick={() => openEdit(user)} title="Sá»­a">
                          <EditOutlinedIcon fontSize="small" />
                        </button>
                        <button type="button" className="danger" onClick={() => handleDelete(user)} title="XÃ³a">
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

      {modalOpen && (
        <div className="staff-modal-overlay" onMouseDown={closeModal}>
          <div className="staff-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="staff-modal-header">
              <div>
                <h3>{editingUser ? "Sá»­a tÃ i khoáº£n nhÃ¢n viÃªn" : "ThÃªm tÃ i khoáº£n nhÃ¢n viÃªn"}</h3>
                <p>Máº­t kháº©u máº·c Ä‘á»‹nh khi táº¡o má»›i lÃ  demo_password_change_me, cÃ³ thá»ƒ thay Ä‘á»•i trong form.</p>
              </div>
              <button type="button" onClick={closeModal} aria-label="ÄÃ³ng">Ã—</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="staff-form-grid">
                <label>
                  <span>Há» tÃªn *</span>
                  <input name="fullName" value={form.fullName} onChange={handleChange} required />
                </label>
                <label>
                  <span>Email *</span>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required />
                </label>
                <label>
                  <span>Sá»‘ Ä‘iá»‡n thoáº¡i</span>
                  <input name="phone" value={form.phone} onChange={handleChange} />
                </label>
                <label>
                  <span>Vai trÃ²</span>
                  <select name="role" value={form.role} onChange={handleChange}>
                    <option value="STAFF">NhÃ¢n viÃªn</option>
                    <option value="ADMIN">Quáº£n trá»‹</option>
                  </select>
                </label>
                <label className="full">
                  <span>{editingUser ? "Máº­t kháº©u má»›i" : "Máº­t kháº©u *"}</span>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required={!editingUser}
                    placeholder={editingUser ? "Äá»ƒ trá»‘ng náº¿u khÃ´ng Ä‘á»•i máº­t kháº©u" : "demo_password_change_me"}
                  />
                </label>
              </div>

              <div className="staff-modal-actions">
                <button type="button" className="secondary" onClick={closeModal}>Há»§y</button>
                <button type="submit" className="primary" disabled={saving}>
                  {saving ? "Äang lÆ°u..." : "LÆ°u tÃ i khoáº£n"}
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

