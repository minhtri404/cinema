import { useEffect, useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  createShowtime,
  deleteShowtime,
  getShowtimes,
  updateShowtime,
} from "../../../api/showtimeApi";
import { getMovies } from "../../../api/movieApi";
import { getRooms } from "../../../api/roomApi";
import { getTheaters } from "../../../api/theaterApi";
import "../../../styles/showtime.css";
import { showtimeStatusLabel } from "../../../utils/displayLabels";

const localDateValue = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const emptyForm = () => ({
  theaterId: "",
  roomId: "",
  movieId: "",
  movieName: "",
  showDate: localDateValue(),
  startTime: "",
  endTime: "",
  audioLanguage: "Việt",
  subtitleLanguage: "Tiếng Việt",
  formatType: "2D",
  status: "ONLINE",
});

const addMinutes = (time, minutes) => {
  if (!time || !minutes) return "";

  const [hours, mins] = time.split(":").map(Number);
  const total = hours * 60 + mins + Number(minutes);
  const endHours = Math.floor(total / 60) % 24;
  const endMinutes = total % 60;

  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
};

const errorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  return data?.message || fallback;
};

function ShowtimePage() {
  const [theaters, setTheaters] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [movies, setMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [theaterId, setTheaterId] = useState("");
  const [showDate, setShowDate] = useState(localDateValue());
  const [loading, setLoading] = useState(true);
  const [referenceLoading, setReferenceLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const loadReferences = async () => {
      try {
        setReferenceLoading(true);
        const [theaterRes, roomRes, movieRes] = await Promise.all([
          getTheaters(),
          getRooms(),
          getMovies(),
        ]);

        if (!active) return;
        setTheaters(theaterRes.data || []);
        setRooms(roomRes.data || []);
        setMovies(movieRes.data || []);
      } catch (error) {
        console.error("Lỗi tải dữ liệu lịch chiếu:", error);
        alert("Không tải được danh sách rạp, phòng hoặc phim.");
      } finally {
        if (active) setReferenceLoading(false);
      }
    };

    loadReferences();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadShowtimes = async () => {
      try {
        setLoading(true);
        const response = await getShowtimes({ theaterId, showDate });
        if (active) setShowtimes(response.data || []);
      } catch (error) {
        console.error("Lỗi tải lịch chiếu:", error);
        if (active) alert(errorMessage(error, "Không tải được danh sách lịch chiếu."));
      } finally {
        if (active) setLoading(false);
      }
    };

    loadShowtimes();
    return () => {
      active = false;
    };
  }, [theaterId, showDate]);

  const theaterMap = useMemo(
    () => new Map(theaters.map((item) => [Number(item.id), item.name])),
    [theaters],
  );

  const roomMap = useMemo(
    () => new Map(rooms.map((item) => [Number(item.id), item.name])),
    [rooms],
  );

  const availableRooms = useMemo(
    () =>
      rooms.filter(
        (room) =>
          Number(room.theaterId) === Number(form.theaterId) &&
          room.status !== "INACTIVE",
      ),
    [rooms, form.theaterId],
  );

  const openCreateModal = () => {
    const initial = emptyForm();
    initial.theaterId = theaterId;
    initial.showDate = showDate || localDateValue();
    setEditingShowtime(null);
    setForm(initial);
    setModalOpen(true);
  };

  const openEditModal = (showtime) => {
    setEditingShowtime(showtime);
    setForm({
      theaterId: String(showtime.theaterId || ""),
      roomId: String(showtime.roomId || ""),
      movieId: String(showtime.movieId || ""),
      movieName: showtime.movieName || "",
      showDate: showtime.showDate || localDateValue(),
      startTime: showtime.startTime?.slice(0, 5) || "",
      endTime: showtime.endTime?.slice(0, 5) || "",
      audioLanguage: showtime.audioLanguage || "Việt",
      subtitleLanguage: showtime.subtitleLanguage || "",
      formatType: showtime.formatType || "2D",
      status: showtime.status || "ONLINE",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingShowtime(null);
    setForm(emptyForm());
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => {
      const next = { ...current, [name]: value };

      if (name === "theaterId") {
        next.roomId = "";
      }

      if (name === "roomId") {
        const room = rooms.find((item) => Number(item.id) === Number(value));
        if (room?.type) next.formatType = room.type;
      }

      if (name === "movieId") {
        const movie = movies.find((item) => Number(item.id) === Number(value));
        next.movieName = movie?.title || "";
        if (movie?.duration && next.startTime) {
          next.endTime = addMinutes(next.startTime, movie.duration);
        }
      }

      if (name === "startTime") {
        const movie = movies.find(
          (item) => Number(item.id) === Number(next.movieId),
        );
        if (movie?.duration) {
          next.endTime = addMinutes(value, movie.duration);
        }
      }

      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.theaterId || !form.roomId || !form.movieId) {
      alert("Vui lòng chọn đầy đủ rạp, phòng chiếu và phim.");
      return;
    }

    if (!form.showDate || !form.startTime || !form.endTime) {
      alert("Vui lòng nhập đầy đủ ngày và giờ chiếu.");
      return;
    }

    if (form.endTime <= form.startTime) {
      alert("Giờ kết thúc phải sau giờ bắt đầu và trong cùng một ngày.");
      return;
    }

    const payload = {
      theaterId: Number(form.theaterId),
      roomId: Number(form.roomId),
      movieId: Number(form.movieId),
      movieName: form.movieName,
      showDate: form.showDate,
      startTime: form.startTime,
      endTime: form.endTime,
      audioLanguage: form.audioLanguage,
      subtitleLanguage: form.subtitleLanguage || null,
      formatType: form.formatType,
      status: form.status,
    };

    try {
      setSaving(true);
      if (editingShowtime) {
        await updateShowtime(editingShowtime.id, payload);
        alert("Cập nhật lịch chiếu thành công.");
      } else {
        await createShowtime(payload);
        alert("Thêm lịch chiếu thành công.");
      }

      setModalOpen(false);
      setEditingShowtime(null);
      const response = await getShowtimes({ theaterId, showDate });
      setShowtimes(response.data || []);
    } catch (error) {
      console.error("Lỗi lưu lịch chiếu:", error);
      alert(errorMessage(error, "Lưu lịch chiếu thất bại."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (showtime) => {
    if (!window.confirm(`Xóa lịch chiếu "${showtime.movieName}"?`)) return;

    try {
      await deleteShowtime(showtime.id);
      setShowtimes((current) => current.filter((item) => item.id !== showtime.id));
      alert("Xóa lịch chiếu thành công.");
    } catch (error) {
      console.error("Lỗi xóa lịch chiếu:", error);
      alert(errorMessage(error, "Xóa lịch chiếu thất bại."));
    }
  };

  return (
    <>
      <section className="showtime-page">
        <div className="showtime-card">
          <div className="showtime-header">
            <div>
              <span className="page-label">QUẢN LÝ RẠP CHIẾU PHIM</span>
              <h2>Lịch chiếu</h2>
              <p>Quản lý phim, phòng, khung giờ và giá vé theo từng rạp.</p>
            </div>

            <button
              className="showtime-add-btn"
              onClick={openCreateModal}
              disabled={referenceLoading}
            >
              <AddRoundedIcon fontSize="small" />
              Thêm lịch chiếu
            </button>
          </div>

          <div className="showtime-toolbar">
            <label>
              <span>Rạp chiếu</span>
              <select value={theaterId} onChange={(e) => setTheaterId(e.target.value)}>
                <option value="">Tất cả rạp</option>
                {theaters.map((theater) => (
                  <option key={theater.id} value={theater.id}>
                    {theater.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Ngày chiếu</span>
              <input
                type="date"
                value={showDate}
                onChange={(e) => setShowDate(e.target.value)}
              />
            </label>

            <button
              className="showtime-clear-btn"
              onClick={() => {
                setTheaterId("");
                setShowDate("");
              }}
            >
              Xóa bộ lọc
            </button>
          </div>

          <div className="showtime-table-wrap">
            <table className="showtime-table">
              <thead>
                <tr>
                  <th>Ngày & giờ</th>
                  <th>Phim</th>
                  <th>Rạp / Phòng</th>
                  <th>Định dạng</th>
                  <th>Nguồn giá</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="showtime-empty">Đang tải dữ liệu...</td>
                  </tr>
                ) : showtimes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="showtime-empty">
                      Chưa có lịch chiếu phù hợp.
                    </td>
                  </tr>
                ) : (
                  showtimes.map((showtime) => (
                    <tr key={showtime.id}>
                      <td>
                        <div className="showtime-date">
                          <CalendarMonthRoundedIcon fontSize="small" />
                          <div>
                            <strong>{showtime.showDate}</strong>
                            <span>
                              {showtime.startTime?.slice(0, 5)} –{" "}
                              {showtime.endTime?.slice(0, 5)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong className="showtime-movie">{showtime.movieName}</strong>
                        <span className="showtime-subtext">Mã phim: {showtime.movieId}</span>
                      </td>
                      <td>
                        <strong>{theaterMap.get(Number(showtime.theaterId)) || `Rạp #${showtime.theaterId}`}</strong>
                        <span className="showtime-subtext">
                          {roomMap.get(Number(showtime.roomId)) || `Phòng #${showtime.roomId}`}
                        </span>
                      </td>
                      <td>
                        <span className="showtime-format">{showtime.formatType}</span>
                        <span className="showtime-subtext">
                          {showtime.audioLanguage}
                          {showtime.subtitleLanguage
                            ? ` · Phụ đề ${showtime.subtitleLanguage}`
                            : ""}
                        </span>
                      </td>
                      <td>
                        <span className="showtime-pricing-source">
                          Theo bảng giá vé
                        </span>
                      </td>
                      <td>
                        <span className={`showtime-status ${showtime.status?.toLowerCase()}`}>
                          {showtimeStatusLabel(showtime.status)}
                        </span>
                      </td>
                      <td>
                        <div className="showtime-actions">
                          <button
                            title="Sửa lịch chiếu"
                            onClick={() => openEditModal(showtime)}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </button>
                          <button
                            className="danger"
                            title="Xóa lịch chiếu"
                            onClick={() => handleDelete(showtime)}
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
        <div className="showtime-modal-overlay" onMouseDown={closeModal}>
          <div className="showtime-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="showtime-modal-header">
              <div>
                <h3>{editingShowtime ? "Sửa lịch chiếu" : "Thêm lịch chiếu"}</h3>
                <p>Hệ thống sẽ từ chối nếu phòng đã có lịch trùng giờ.</p>
              </div>
              <button type="button" onClick={closeModal} aria-label="Đóng">×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="showtime-form-grid">
                <label>
                  <span>Rạp chiếu *</span>
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
                </label>

                <label>
                  <span>Phòng chiếu *</span>
                  <select
                    name="roomId"
                    value={form.roomId}
                    onChange={handleChange}
                    disabled={!form.theaterId}
                    required
                  >
                    <option value="">Chọn phòng</option>
                    {availableRooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name} ({room.type || "2D"})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="full">
                  <span>Phim *</span>
                  <select name="movieId" value={form.movieId} onChange={handleChange} required>
                    <option value="">Chọn phim</option>
                    {movies.map((movie) => (
                      <option key={movie.id} value={movie.id}>
                        {movie.title} {movie.duration ? `(${movie.duration} phút)` : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Ngày chiếu *</span>
                  <input
                    type="date"
                    name="showDate"
                    value={form.showDate}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  <span>Giờ bắt đầu *</span>
                  <input
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  <span>Giờ kết thúc *</span>
                  <input
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  <span>Ngôn ngữ âm thanh</span>
                  <input
                    name="audioLanguage"
                    value={form.audioLanguage}
                    onChange={handleChange}
                    placeholder="Việt"
                  />
                </label>

                <label>
                  <span>Ngôn ngữ phụ đề</span>
                  <input
                    name="subtitleLanguage"
                    value={form.subtitleLanguage}
                    onChange={handleChange}
                    placeholder="Tiếng Việt"
                  />
                </label>

                <label>
                  <span>Định dạng</span>
                  <select name="formatType" value={form.formatType} onChange={handleChange}>
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                    <option value="IMAX">IMAX</option>
                    <option value="4DX">4DX</option>
                  </select>
                </label>

                <label>
                  <span>Trạng thái</span>
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="ONLINE">Đang mở bán</option>
                    <option value="SOLD_OUT">Hết vé</option>
                    <option value="CANCELLED">Đã hủy</option>
                    <option value="OFFLINE">Tạm ngừng</option>
                  </select>
                </label>
              </div>

              <div className="showtime-modal-actions">
                <button type="button" className="secondary" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="primary" disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu lịch chiếu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ShowtimePage;
