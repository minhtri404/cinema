import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { generateSeats, getSeatsByRoom, updateSeat } from "../../../api/seatApi";
import { getBookedSeatDetails } from "../../../api/bookingApi";
import { getRoomById } from "../../../api/roomApi";
import { getShowtimes } from "../../../api/showtimeApi";
import "../../../styles/seat.css";
import { activityStatusLabel, seatTypeLabel } from "../../../utils/displayLabels";

const defaultGenerateForm = {
  rowCount: 8,
  columnCount: 10,
};

const bookingStatusLabel = (status) => {
  const value = String(status || "").trim().toUpperCase();
  if (["PAID", "CONFIRMED", "ĐÃ_THANH_TOÁN", "ĐÃ_XÁC_NHẬN"].includes(value)) {
    return "Đã thanh toán";
  }
  if (["PENDING", "CHỜ_THANH_TOÁN"].includes(value)) return "Chờ thanh toán";
  if (["CANCELLED", "CANCELED", "ĐÃ_HỦY"].includes(value)) return "Đã hủy";
  return status || "—";
};

const fetchSeatMapData = async (roomId) => {
  const [roomRes, seatRes, showtimeRes] = await Promise.all([
    getRoomById(roomId),
    getSeatsByRoom(roomId),
    getShowtimes(),
  ]);
  const roomShowtimes = (showtimeRes.data || [])
    .filter((showtime) => String(showtime.roomId) === String(roomId))
    .sort((a, b) =>
      `${b.showDate || ""}T${b.startTime || ""}`.localeCompare(
        `${a.showDate || ""}T${a.startTime || ""}`,
      ),
    );

  return {
    room: roomRes.data,
    seats: seatRes.data || [],
    showtimes: roomShowtimes,
  };
};

function SeatMapPage() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [seats, setSeats] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState("");
  const [bookedSeats, setBookedSeats] = useState(new Map());
  const [selectedBookedSeat, setSelectedBookedSeat] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [generateForm, setGenerateForm] = useState(defaultGenerateForm);
  const [loading, setLoading] = useState(Boolean(roomId));
  const [saving, setSaving] = useState(false);

  const groupedSeats = useMemo(() => {
    return seats.reduce((groups, seat) => {
      const row = seat.seatRow || "?";
      return {
        ...groups,
        [row]: [...(groups[row] || []), seat],
      };
    }, {});
  }, [seats]);

  const relatedBookedSeats = useMemo(() => {
    if (!selectedBookedSeat?.userId) return [];
    return [...bookedSeats.values()]
      .filter(
        (seat) => String(seat.userId) === String(selectedBookedSeat.userId),
      )
      .sort((a, b) =>
        String(a.seatCode || "").localeCompare(String(b.seatCode || ""), "vi", {
          numeric: true,
        }),
      );
  }, [bookedSeats, selectedBookedSeat]);

  const relatedBookedSeatIds = useMemo(
    () => new Set(relatedBookedSeats.map((seat) => String(seat.seatId))),
    [relatedBookedSeats],
  );

  const loadData = async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      const data = await fetchSeatMapData(roomId);

      setRoom(data.room);
      setSeats(data.seats);
      setShowtimes(data.showtimes);
      setBookedSeats(new Map());
      setSelectedBookedSeat(null);
      setSelectedShowtimeId((current) => {
        const stillExists = data.showtimes.some(
          (showtime) => String(showtime.id) === String(current),
        );
        return stillExists ? current : data.showtimes[0]?.id || "";
      });
      setSelectedSeat(null);
    } catch (error) {
      console.error("Loi tai so do ghe:", error);
      alert("Không tải được sơ đồ ghế. Vui lòng kiểm tra phòng chiếu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roomId) return undefined;

    let active = true;
    fetchSeatMapData(roomId)
      .then((data) => {
        if (!active) return;
        setRoom(data.room);
        setSeats(data.seats);
        setShowtimes(data.showtimes);
        setBookedSeats(new Map());
        setSelectedBookedSeat(null);
        setSelectedShowtimeId(data.showtimes[0]?.id || "");
        setSelectedSeat(null);
      })
      .catch((error) => {
        console.error("Loi tai so do ghe:", error);
        if (active) alert("Không tải được sơ đồ ghế. Vui lòng kiểm tra phòng chiếu.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [roomId]);

  useEffect(() => {
    if (!selectedShowtimeId) return undefined;

    let active = true;
    getBookedSeatDetails(selectedShowtimeId)
      .then((response) => {
        if (!active) return;
        setBookedSeats(
          new Map(
            (response.data || []).map((seat) => [String(seat.seatId), seat]),
          ),
        );
      })
      .catch((error) => {
        console.error("Loi tai trang thai ghe da dat:", error);
        if (active) setBookedSeats(new Map());
      });

    return () => {
      active = false;
    };
  }, [selectedShowtimeId]);

  const handleGenerateChange = (e) => {
    const { name, value } = e.target;
    setGenerateForm({
      ...generateForm,
      [name]: value,
    });
  };

  const handleGenerateSeats = async () => {
    if (!roomId) return;

    const rowCount = Number(generateForm.rowCount);
    const columnCount = Number(generateForm.columnCount);

    if (rowCount < 1 || rowCount > 26 || columnCount < 1 || columnCount > 30) {
      alert("Số hàng từ 1–26 và số cột từ 1–30.");
      return;
    }

    const confirmGenerate = window.confirm(
      "Tạo lại sơ đồ ghế sẽ xóa các ghế cũ của phòng này. Tiếp tục?"
    );

    if (!confirmGenerate) return;

    try {
      setSaving(true);
      await generateSeats(roomId, rowCount, columnCount);
      await loadData();
    } catch (error) {
      console.error("Lỗi tạo sơ đồ ghế:", error);
      alert("Tạo sơ đồ ghế thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleSeatChange = async (field, value) => {
    if (!selectedSeat) return;

    const payload = {
      ...selectedSeat,
      [field]: value,
    };

    try {
      setSaving(true);
      const res = await updateSeat(selectedSeat.id, payload);
      setSelectedSeat(res.data);
      setSeats((currentSeats) =>
        currentSeats.map((seat) => (seat.id === res.data.id ? res.data : seat))
      );
    } catch (error) {
      console.error("Lỗi cập nhật ghế:", error);
      alert("Cập nhật ghế thất bại.");
    } finally {
      setSaving(false);
    }
  };

  if (!roomId) {
    return (
      <section className="seat-page">
        <div className="seat-panel">
          <span className="page-label">QUẢN LÝ RẠP CHIẾU PHIM</span>
          <h2>Sơ đồ ghế</h2>
          <p>Chọn một phòng chiếu để quản lý sơ đồ ghế.</p>
          <Link className="seat-back-link" to="/admin/theaters">
            Quay lại danh sách rạp
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="seat-page">
      <div className="seat-header">
        <div>
          <span className="page-label">QUẢN LÝ RẠP CHIẾU PHIM</span>
          <h2>Sơ đồ ghế</h2>
          <p>
            {room
              ? `${room.name} - ${room.type || "2D"} - ${room.seatCount || 0} ghế`
              : `Phòng #${roomId}`}
          </p>
        </div>

        <Link className="seat-back-link" to="/admin/theaters">
          Quay lại
        </Link>
      </div>

      <div className="seat-tools">
        <div className="seat-generate-form">
          <label className="seat-showtime-select">
            Suất chiếu
            <select
              value={selectedShowtimeId}
              onChange={(event) => {
                setSelectedShowtimeId(event.target.value);
                setBookedSeats(new Map());
                setSelectedSeat(null);
                setSelectedBookedSeat(null);
              }}
            >
              <option value="">Chọn suất chiếu</option>
              {showtimes.map((showtime) => (
                <option key={showtime.id} value={showtime.id}>
                  {showtime.movieName} - {showtime.showDate} {showtime.startTime?.slice(0, 5)}
                </option>
              ))}
            </select>
          </label>

          <label>
            Hàng
            <input
              type="number"
              name="rowCount"
              min="1"
              max="26"
              value={generateForm.rowCount}
              onChange={handleGenerateChange}
            />
          </label>

          <label>
            Cột
            <input
              type="number"
              name="columnCount"
              min="1"
              max="30"
              value={generateForm.columnCount}
              onChange={handleGenerateChange}
            />
          </label>

          <button onClick={handleGenerateSeats} disabled={saving}>
            Tạo sơ đồ
          </button>
        </div>

        <div className="seat-legend">
          <span><i className="standard" /> Thường</span>
          <span><i className="vip" /> VIP</span>
          <span><i className="couple" /> Ghế đôi</span>
          <span><i className="booked" /> Đã đặt</span>
          <span><i className="inactive" /> Khóa</span>
        </div>
      </div>

      <div className="seat-content">
        <div className="seat-map-panel">
          <div className="screen">MÀN HÌNH</div>

          {loading ? (
            <div className="seat-empty">Đang tải sơ đồ ghế...</div>
          ) : seats.length === 0 ? (
            <div className="seat-empty">
              Phòng này chưa có ghế. Bấm "Tạo sơ đồ" để tạo ghế.
            </div>
          ) : (
            <div className="seat-map">
              {Object.entries(groupedSeats).map(([row, rowSeats]) => (
                <div className="seat-row" key={row}>
                  <span className="seat-row-label">{row}</span>
                  <div className="seat-row-items">
                    {rowSeats.map((seat) => {
                      const bookedSeat = bookedSeats.get(String(seat.id));
                      const isBooked = Boolean(bookedSeat);
                      const isRelated = relatedBookedSeatIds.has(String(seat.id));
                      return (
                        <button
                          key={seat.id}
                          className={`seat-cell ${seat.seatType?.toLowerCase() || "standard"} ${
                            seat.status === "INACTIVE" ? "inactive" : ""
                          } ${isBooked ? "booked" : ""} ${isRelated ? "related" : ""} ${
                            selectedSeat?.id === seat.id ||
                            String(selectedBookedSeat?.seatId) === String(seat.id)
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => {
                            if (bookedSeat) {
                              setSelectedBookedSeat(bookedSeat);
                              setSelectedSeat(null);
                            } else {
                              setSelectedSeat(seat);
                              setSelectedBookedSeat(null);
                            }
                          }}
                          title={isBooked ? "Bấm để xem khách hàng đã đặt" : seat.seatCode}
                          type="button"
                        >
                          {seat.seatCode}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="seat-detail-panel">
          <h3>Chi tiết ghế</h3>

          {selectedBookedSeat ? (
            <div className="seat-booking-detail">
              <div className="seat-detail-code booked">{selectedBookedSeat.seatCode}</div>
              <span className="seat-booking-badge">GHẾ ĐÃ ĐẶT</span>
              <dl>
                <div>
                  <dt>Khách hàng</dt>
                  <dd>{selectedBookedSeat.customerName}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{selectedBookedSeat.customerEmail || "—"}</dd>
                </div>
                <div>
                  <dt>Mã đơn đặt vé</dt>
                  <dd>#{selectedBookedSeat.bookingId}</dd>
                </div>
                <div>
                  <dt>Trạng thái</dt>
                  <dd>{bookingStatusLabel(selectedBookedSeat.bookingStatus)}</dd>
                </div>
                <div>
                  <dt>Giá ghế</dt>
                  <dd>{Number(selectedBookedSeat.price || 0).toLocaleString("vi-VN")}đ</dd>
                </div>
              </dl>
              <div className="seat-related-bookings">
                <div className="seat-related-heading">
                  <strong>Ghế của khách trong suất chiếu</strong>
                  <span>{relatedBookedSeats.length} ghế</span>
                </div>
                <div className="seat-related-list">
                  {relatedBookedSeats.map((seat) => (
                    <button
                      type="button"
                      key={`${seat.bookingId}-${seat.seatId}`}
                      className={
                        String(seat.seatId) === String(selectedBookedSeat.seatId)
                          ? "active"
                          : ""
                      }
                      onClick={() => setSelectedBookedSeat(seat)}
                      title={`Đơn đặt vé #${seat.bookingId}`}
                    >
                      {seat.seatCode}
                    </button>
                  ))}
                </div>
                <small>Các ghế viền vàng thuộc cùng khách hàng.</small>
              </div>
            </div>
          ) : selectedSeat ? (
            <>
              <div className="seat-detail-code">{selectedSeat.seatCode}</div>

              <label>
                Loại ghế
                <select
                  value={selectedSeat.seatType || "STANDARD"}
                  onChange={(e) => handleSeatChange("seatType", e.target.value)}
                  disabled={saving}
                >
                  <option value="STANDARD">{seatTypeLabel("STANDARD")}</option>
                  <option value="VIP">{seatTypeLabel("VIP")}</option>
                  <option value="COUPLE">{seatTypeLabel("COUPLE")}</option>
                </select>
              </label>

              <label>
                Phụ thu
                <input
                  type="number"
                  value={selectedSeat.extraPrice || 0}
                  onChange={(e) =>
                    handleSeatChange("extraPrice", Number(e.target.value || 0))
                  }
                  disabled={saving}
                />
              </label>

              <label>
                Trạng thái
                <select
                  value={selectedSeat.status || "ACTIVE"}
                  onChange={(e) => handleSeatChange("status", e.target.value)}
                  disabled={saving}
                >
                  <option value="ACTIVE">{activityStatusLabel("ACTIVE")}</option>
                  <option value="INACTIVE">{activityStatusLabel("INACTIVE")}</option>
                </select>
              </label>
            </>
          ) : (
            <p>Chọn một ghế trên sơ đồ để chỉnh sửa.</p>
          )}
        </aside>
      </div>
    </section>
  );
}

export default SeatMapPage;
