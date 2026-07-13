import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useEffect, useMemo, useState } from "react";
import { createUser, deleteUser, getUsers, updateUser } from "../../../api/userApi";
import "../../../styles/user.css";

const emptyForm = () => ({
  fullName: "",
  email: "",
  phone: "",
  role: "CUSTOMER",
  password: "demo_password_change_me",
});

const errorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  return data?.message || fallback;
};

const formatDate = (value) => {
  if (!value) return "â€”";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

function UserPage() {
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");
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
      alert(errorMessage(error, "KhÃ´ng táº£i Ä‘Æ°á»£c danh sÃ¡ch ngÆ°á»i dÃ¹ng."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const customers = useMemo(
    () => users.filter((user) => user.role === "CUSTOMER"),
    [users],
  );

  const filteredUsers = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    return customers.filter((user) => {
      if (!value) return true;
      return [user.fullName, user.email, user.phone]
        .filter(Boolean)
        .some((item) => item.toLowerCase().includes(value));
    });
  }, [customers, keyword]);

  const summary = useMemo(() => {
    const withPhone = customers.filter((user) => Boolean(user.phone)).length;
    return {
      total: customers.length,
      active: customers.length,
      withPhone,
    };
  }, [customers]);

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
    role: "CUSTOMER",
    password: form.password,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      if (editingUser) {
        await updateUser(editingUser.id, payloadFromForm());
        alert("Cáº­p nháº­t ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng.");
      } else {
        await createUser(payloadFromForm());
        alert("ThÃªm ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng.");
      }

      closeModal();
      await loadUsers();
    } catch (error) {
      alert(errorMessage(error, "LÆ°u ngÆ°á»i dÃ¹ng tháº¥t báº¡i."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`XÃ³a ngÆ°á»i dÃ¹ng "${user.fullName}"?`)) return;
    try {
      await deleteUser(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      alert("XÃ³a ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng.");
    } catch (error) {
      alert(errorMessage(error, "XÃ³a ngÆ°á»i dÃ¹ng tháº¥t báº¡i."));
    }
  };

  return (
    <section className="user-page">
      <div className="user-card">
        <header className="user-header">
          <div>
            <span className="page-label">CINEMA MANAGEMENT</span>
            <h2>NgÆ°á»i dÃ¹ng</h2>
            <p>Quáº£n lÃ½ tÃ i khoáº£n khÃ¡ch hÃ ng Ä‘Ã£ Ä‘Äƒng kÃ½ trong há»‡ thá»‘ng.</p>
          </div>
          <button type="button" onClick={openCreate}>
            <AddRoundedIcon fontSize="small" />
            ThÃªm ngÆ°á»i dÃ¹ng
          </button>
        </header>

        <div className="user-summary">
          <div>
            <span>Tá»•ng ngÆ°á»i dÃ¹ng</span>
            <strong>{summary.total}</strong>
          </div>
          <div>
            <span>Äang hoáº¡t Ä‘á»™ng</span>
            <strong>{summary.active}</strong>
          </div>
          <div>
            <span>CÃ³ sá»‘ Ä‘iá»‡n thoáº¡i</span>
            <strong>{summary.withPhone}</strong>
          </div>
        </div>

        <div className="user-toolbar">
          <label className="user-search">
            <SearchRoundedIcon fontSize="small" />
            <input
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="TÃ¬m theo há» tÃªn, email, sá»‘ Ä‘iá»‡n thoáº¡i..."
            />
          </label>
        </div>

        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>NgÆ°á»i dÃ¹ng</th>
                <th>Email</th>
                <th>Sá»‘ Ä‘iá»‡n thoáº¡i</th>
                <th>NgÃ y táº¡o</th>
                <th>Vai trÃ²</th>
                <th>Tráº¡ng thÃ¡i</th>
                <th>Thao tÃ¡c</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="user-empty">Äang táº£i dá»¯ liá»‡u...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="user-empty">ChÆ°a cÃ³ ngÆ°á»i dÃ¹ng phÃ¹ há»£p.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <span className="user-avatar">
                          <PersonOutlineRoundedIcon fontSize="small" />
                        </span>
                        <strong>{user.fullName}</strong>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || "â€”"}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td><span className="user-role">KhÃ¡ch hÃ ng</span></td>
                    <td><span className="user-status">ACTIVE</span></td>
                    <td>
                      <div className="user-actions">
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
        <div className="user-modal-overlay" onMouseDown={closeModal}>
          <div className="user-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="user-modal-header">
              <div>
                <h3>{editingUser ? "Sá»­a ngÆ°á»i dÃ¹ng" : "ThÃªm ngÆ°á»i dÃ¹ng"}</h3>
                <p>TÃ i khoáº£n khÃ¡ch hÃ ng dÃ¹ng Ä‘á»ƒ Ä‘Äƒng nháº­p vÃ  Ä‘áº·t vÃ©.</p>
              </div>
              <button type="button" onClick={closeModal} aria-label="ÄÃ³ng">Ã—</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="user-form-grid">
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
                  <input value="KhÃ¡ch hÃ ng" disabled />
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

              <div className="user-modal-actions">
                <button type="button" className="secondary" onClick={closeModal}>Há»§y</button>
                <button type="submit" className="primary" disabled={saving}>
                  {saving ? "Äang lÆ°u..." : "LÆ°u ngÆ°á»i dÃ¹ng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default UserPage;

