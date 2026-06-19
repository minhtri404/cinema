import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EventSeatOutlinedIcon from "@mui/icons-material/EventSeatOutlined";
import { getRooms } from "../../../api/roomApi";
import {
  createTheater,
  deleteTheater,
  getTheaters,
  updateTheater,
} from "../../../api/theaterApi";
import "../../../styles/theater.css";

const emptyForm = {
  name: "",
  address: "",
  city: "",
  location: "",
  roomCount: "",
  status: "ONLINE",
};

function TheaterListPage() {
  const [theaters, setTheaters] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTheater, setEditingTheater] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadTheaters = async () => {
    try {
      setLoading(true);
      const [theaterRes, roomRes] = await Promise.all([
        getTheaters(),
        getRooms(),
      ]);

      setTheaters(theaterRes.data || []);
      setRooms(roomRes.data || []);
    } catch (error) {
      console.error("Loi tai danh sach rap:", error);
      alert("Khong tai duoc danh sach rap.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTheaters();
  }, []);

  const filteredTheaters = useMemo(() => {
    const value = keyword.toLowerCase().trim();

    if (!value) return theaters;

    return theaters.filter((theater) => {
      return (
        theater.name?.toLowerCase().includes(value) ||
        theater.address?.toLowerCase().includes(value) ||
        theater.city?.toLowerCase().includes(value)
      );
    });
  }, [theaters, keyword]);

  const roomsByTheaterId = useMemo(() => {
    return rooms.reduce((groups, room) => {
      const theaterId = String(room.theaterId);
      return {
        ...groups,
        [theaterId]: [...(groups[theaterId] || []), room],
      };
    }, {});
  }, [rooms]);

  const openCreateModal = () => {
    setEditingTheater(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (theater) => {
    setEditingTheater(theater);
    setForm({
      name: theater.name || "",
      address: theater.address || "",
      city: theater.city || "",
      location: theater.location || "",
      roomCount: theater.roomCount || "",
      status: theater.status || "ONLINE",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTheater(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Ten rap khong duoc de trong.");
      return;
    }

    if (!form.address.trim()) {
      alert("Dia chi rap khong duoc de trong.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        location: form.location.trim(),
        roomCount: Number(form.roomCount || 0),
        status: form.status,
      };

      if (editingTheater) {
        await updateTheater(editingTheater.id, payload);
        alert("Cap nhat rap thanh cong!");
      } else {
        await createTheater(payload);
        alert("Them rap thanh cong!");
      }

      closeModal();
      loadTheaters();
    } catch (error) {
      console.error("Loi luu rap:", error);
      alert("Luu rap that bai. Kiem tra backend hoac du lieu nhap.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Ban co chac muon xoa rap nay?");

    if (!confirmDelete) return;

    try {
      await deleteTheater(id);
      alert("Xoa rap thanh cong!");
      loadTheaters();
    } catch (error) {
      console.error("Loi xoa rap:", error);
      alert("Xoa rap that bai. Co the rap dang duoc lich chieu su dung.");
    }
  };

  return (
    <section className="theater-page">
      <div className="theater-card">
        <div className="theater-header">
          <div>
            <span className="page-label">CINEMA MANAGEMENT</span>
            <h2>Rap</h2>
            <p>Quan ly danh sach rap chieu phim trong he thong.</p>
          </div>

          <button className="theater-add-btn" onClick={openCreateModal}>
            + Them rap
          </button>
        </div>

        <div className="theater-toolbar">
          <input
            className="theater-search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tim theo ten rap, dia chi, thanh pho..."
          />
        </div>

        {loading ? (
          <div className="theater-empty">Dang tai du lieu...</div>
        ) : (
          <table className="theater-table">
            <thead>
              <tr>
                <th style={{ width: "70px" }}>ID</th>
                <th>Rap</th>
                <th>Dia chi</th>
                <th>Thanh pho</th>
                <th style={{ width: "90px" }}>So phong</th>
                <th style={{ width: "260px" }}>So do ghe</th>
                <th style={{ width: "120px" }}>Trang thai</th>
                <th style={{ width: "110px" }}>Thao tac</th>
              </tr>
            </thead>

            <tbody>
              {filteredTheaters.length > 0 ? (
                filteredTheaters.map((theater) => {
                  const theaterRooms = roomsByTheaterId[String(theater.id)] || [];

                  return (
                    <tr key={theater.id}>
                      <td>{theater.id}</td>
                      <td>
                        <span className="theater-name">{theater.name}</span>
                        <br />
                        <span className="theater-muted">
                          {theater.location || "Chua co vi tri"}
                        </span>
                      </td>
                      <td>{theater.address}</td>
                      <td>{theater.city || "Chua cap nhat"}</td>
                      <td>{theater.roomCount || theaterRooms.length || 0}</td>
                      <td>
                        <div className="theater-room-links">
                          {theaterRooms.length > 0 ? (
                            theaterRooms.map((room) => (
                              <Link
                                key={room.id}
                                className="theater-seat-link"
                                to={`/admin/rooms/${room.id}/seats`}
                                title={`So do ghe ${room.name}`}
                              >
                                <EventSeatOutlinedIcon fontSize="small" />
                                <span>{room.name || `Phong ${room.id}`}</span>
                              </Link>
                            ))
                          ) : (
                            <span className="theater-muted">Chua co phong</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`theater-status ${
                            theater.status === "ONLINE" ? "online" : "offline"
                          }`}
                        >
                          {theater.status || "ONLINE"}
                        </span>
                      </td>
                      <td>
                        <div className="theater-actions">
                          <button
                            className="theater-icon-btn"
                            onClick={() => openEditModal(theater)}
                            type="button"
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </button>

                          <button
                            className="theater-icon-btn danger"
                            onClick={() => handleDelete(theater.id)}
                            type="button"
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="theater-empty">
                    Khong co rap phu hop.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="theater-modal-overlay">
          <div className="theater-modal">
            <div className="theater-modal-header">
              <h3>{editingTheater ? "Sua rap" : "Them rap"}</h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="theater-form">
                <div className="theater-form-grid">
                  <div className="theater-form-group">
                    <label>Ten rap</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Vi du: Rap Cao Lo"
                      required
                    />
                  </div>

                  <div className="theater-form-group">
                    <label>Thanh pho</label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Vi du: Ho Chi Minh"
                    />
                  </div>

                  <div className="theater-form-group full">
                    <label>Dia chi</label>
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Vi du: 123 Cao Lo, Quan 8"
                      required
                    />
                  </div>

                  <div className="theater-form-group full">
                    <label>Vi tri / mo ta vi tri</label>
                    <input
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="Vi du: Tang 3 trung tam thuong mai"
                    />
                  </div>

                  <div className="theater-form-group">
                    <label>So phong chieu</label>
                    <input
                      type="number"
                      name="roomCount"
                      value={form.roomCount}
                      onChange={handleChange}
                      placeholder="Vi du: 4"
                    />
                  </div>

                  <div className="theater-form-group">
                    <label>Trang thai</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="ONLINE">ONLINE</option>
                      <option value="OFFLINE">OFFLINE</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="theater-modal-actions">
                <button
                  type="button"
                  className="theater-cancel-btn"
                  onClick={closeModal}
                >
                  Dong
                </button>

                <button className="theater-save-btn" disabled={saving}>
                  {saving ? "Dang luu..." : "Luu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default TheaterListPage;
