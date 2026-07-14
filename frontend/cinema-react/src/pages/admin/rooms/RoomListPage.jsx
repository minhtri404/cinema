import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import EventSeatOutlinedIcon from "@mui/icons-material/EventSeatOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  createRoom,
  deleteRoom,
  getRooms,
  updateRoom,
} from "../../../api/roomApi";
import { getTheaters } from "../../../api/theaterApi";
import "../../../styles/room.css";
import { activityStatusLabel } from "../../../utils/displayLabels";

const emptyForm = {
  theaterId: "",
  name: "",
  seatCount: "",
  rowCount: "",
  columnCount: "",
  type: "2D",
  status: "ACTIVE",
};

function RoomListPage() {
  const [rooms, setRooms] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [selectedTheater, setSelectedTheater] = useState("");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const [roomRes, theaterRes] = await Promise.all([
        getRooms(),
        getTheaters(),
      ]);

      setRooms(roomRes.data || []);
      setTheaters(theaterRes.data || []);
    } catch (error) {
      console.error("Lỗi tải phòng chiếu:", error);
      alert("Không tải được danh sách phòng chiếu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([getRooms(), getTheaters()])
      .then(([roomRes, theaterRes]) => {
        if (!active) return;
        setRooms(roomRes.data || []);
        setTheaters(theaterRes.data || []);
      })
      .catch((error) => {
        console.error("Lỗi tải phòng chiếu:", error);
        if (active) alert("Không tải được danh sách phòng chiếu.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const getTheaterName = useCallback((theaterId) => {
    const theater = theaters.find((item) => Number(item.id) === Number(theaterId));
    return theater ? theater.name : "Chưa rõ rạp";
  }, [theaters]);

  const filteredRooms = useMemo(() => {
    const value = keyword.toLowerCase().trim();

    return rooms.filter((room) => {
      const matchKeyword =
        !value ||
        room.name?.toLowerCase().includes(value) ||
        room.type?.toLowerCase().includes(value) ||
        getTheaterName(room.theaterId).toLowerCase().includes(value);

      const matchTheater =
        !selectedTheater || Number(room.theaterId) === Number(selectedTheater);

      return matchKeyword && matchTheater;
    });
  }, [rooms, keyword, selectedTheater, getTheaterName]);

  const openCreateModal = () => {
    setEditingRoom(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);

    setForm({
      theaterId: room.theaterId || "",
      name: room.name || "",
      seatCount: room.seatCount || "",
      rowCount: room.rowCount || "",
      columnCount: room.columnCount || "",
      type: room.type || "2D",
      status: room.status || "ACTIVE",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRoom(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const nextForm = {
      ...form,
      [name]: value,
    };

    if (name === "rowCount" || name === "columnCount") {
      const rows = Number(name === "rowCount" ? value : nextForm.rowCount || 0);
      const cols = Number(name === "columnCount" ? value : nextForm.columnCount || 0);

      if (rows > 0 && cols > 0) {
        nextForm.seatCount = rows * cols;
      }
    }

    setForm(nextForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.theaterId) {
      alert("Vui lòng chọn rạp.");
      return;
    }

    if (!form.name.trim()) {
      alert("Tên phòng không được để trống.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        theaterId: Number(form.theaterId),
        name: form.name.trim(),
        seatCount: Number(form.seatCount || 0),
        rowCount: Number(form.rowCount || 0),
        columnCount: Number(form.columnCount || 0),
        type: form.type,
        status: form.status,
      };

      if (editingRoom) {
        await updateRoom(editingRoom.id, payload);
        alert("Cập nhật phòng chiếu thành công!");
      } else {
        await createRoom(payload);
        alert("Thêm phòng chiếu thành công!");
      }

      closeModal();
      loadData();
    } catch (error) {
      console.error("Lỗi lưu phòng chiếu:", error);
      alert("Lưu phòng chiếu thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa phòng chiếu này?");

    if (!confirmDelete) return;

    try {
      await deleteRoom(id);
      alert("Xóa phòng chiếu thành công!");
      loadData();
    } catch (error) {
      console.error("Lỗi xóa phòng:", error);
      alert("Xóa thất bại. Có thể phòng đang có lịch chiếu hoặc ghế.");
    }
  };

  return (
    <>
      <section className="room-page">
        <div className="room-card">
          <div className="room-header">
            <div>
              <span className="page-label">QUẢN LÝ RẠP CHIẾU PHIM</span>
              <h2>Phòng chiếu</h2>
              <p>Quản lý phòng chiếu theo từng rạp và tạo sơ đồ ghế.</p>
            </div>

            <button className="room-add-btn" onClick={openCreateModal}>
              + Thêm phòng
            </button>
          </div>

          <div className="room-toolbar">
            <input
              className="room-search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên phòng, loại phòng, rạp..."
            />

            <select
              className="room-filter"
              value={selectedTheater}
              onChange={(e) => setSelectedTheater(e.target.value)}
            >
              <option value="">Tất cả rạp</option>
              {theaters.map((theater) => (
                <option key={theater.id} value={theater.id}>
                  {theater.name}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="room-empty">Đang tải dữ liệu...</div>
          ) : (
            <div className="room-table-wrap">
              <table className="room-table">
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>Mã</th>
                  <th>Phòng</th>
                  <th>Rạp</th>
                  <th style={{ width: "120px" }}>Loại</th>
                  <th style={{ width: "120px" }}>Số ghế</th>
                  <th style={{ width: "140px" }}>Sơ đồ</th>
                  <th style={{ width: "130px" }}>Trạng thái</th>
                  <th style={{ width: "150px" }}>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredRooms.length > 0 ? (
                  filteredRooms.map((room) => (
                    <tr key={room.id}>
                      <td>{room.id}</td>

                      <td>
                        <div className="room-name-wrap">
                          <MeetingRoomOutlinedIcon fontSize="small" />
                          <div>
                            <div className="room-name">{room.name}</div>
                            <div className="room-muted">
                              {room.rowCount || 0} hàng × {room.columnCount || 0} cột
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>{getTheaterName(room.theaterId)}</td>
                      <td>
                        <span className="room-type">{room.type || "2D"}</span>
                      </td>
                      <td>{room.seatCount || 0}</td>

                      <td>
                        <Link
                          to={`/admin/rooms/${room.id}/seats`}
                          className="room-seat-btn"
                        >
                          <EventSeatOutlinedIcon fontSize="small" />
                          Sơ đồ ghế
                        </Link>
                      </td>

                      <td>
                        <span
                          className={`room-status ${
                            room.status === "ACTIVE" ? "active" : "inactive"
                          }`}
                        >
                          {activityStatusLabel(room.status || "ACTIVE")}
                        </span>
                      </td>

                      <td>
                        <div className="room-actions">
                          <button
                            className="room-icon-btn"
                            onClick={() => openEditModal(room)}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </button>

                          <button
                            className="room-icon-btn danger"
                            onClick={() => handleDelete(room.id)}
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="room-empty">
                      Chưa có phòng chiếu phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {showModal && (
        <div className="room-modal-overlay">
          <div className="room-modal">
            <div className="room-modal-header">
              <h3>{editingRoom ? "Sửa phòng chiếu" : "Thêm phòng chiếu"}</h3>
              <p>
                Khai báo số hàng và số cột để tạo sơ đồ ghế cho phòng chiếu.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="room-form">
                <div className="room-form-grid">
                  <div className="room-form-group full">
                    <label>Rạp</label>
                    <select
                      name="theaterId"
                      value={form.theaterId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Chọn rạp</option>
                      {theaters.map((theater) => (
                        <option key={theater.id} value={theater.id}>
                          {theater.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="room-form-group">
                    <label>Tên phòng</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Ví dụ: Phòng 1"
                      required
                    />
                  </div>

                  <div className="room-form-group">
                    <label>Loại phòng</label>
                    <select name="type" value={form.type} onChange={handleChange}>
                      <option value="2D">2D</option>
                      <option value="3D">3D</option>
                      <option value="IMAX">IMAX</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>

                  <div className="room-form-group">
                    <label>Số hàng ghế</label>
                    <input
                      type="number"
                      name="rowCount"
                      value={form.rowCount}
                      onChange={handleChange}
                      placeholder="Ví dụ: 8"
                    />
                  </div>

                  <div className="room-form-group">
                    <label>Số cột ghế</label>
                    <input
                      type="number"
                      name="columnCount"
                      value={form.columnCount}
                      onChange={handleChange}
                      placeholder="Ví dụ: 10"
                    />
                  </div>

                  <div className="room-form-group">
                    <label>Tổng số ghế</label>
                    <input
                      type="number"
                      name="seatCount"
                      value={form.seatCount}
                      onChange={handleChange}
                      placeholder="Tự tính theo hàng × cột"
                    />
                  </div>

                  <div className="room-form-group">
                    <label>Trạng thái</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="ACTIVE">Đang hoạt động</option>
                      <option value="INACTIVE">Ngừng hoạt động</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="room-modal-actions">
                <button
                  type="button"
                  className="room-cancel-btn"
                  onClick={closeModal}
                >
                  Đóng
                </button>

                <button className="room-save-btn" disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default RoomListPage;
