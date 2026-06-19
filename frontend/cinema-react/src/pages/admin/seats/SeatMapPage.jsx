import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { generateSeats, getSeatsByRoom, updateSeat } from "../../../api/seatApi";
import { getRoomById } from "../../../api/roomApi";
import "../../../styles/seat.css";

const defaultGenerateForm = {
  rowCount: 8,
  columnCount: 10,
};

function SeatMapPage() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [seats, setSeats] = useState([]);
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

  const loadData = async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      const [roomRes, seatRes] = await Promise.all([
        getRoomById(roomId),
        getSeatsByRoom(roomId),
      ]);

      setRoom(roomRes.data);
      setSeats(seatRes.data || []);
      setSelectedSeat(null);
    } catch (error) {
      console.error("Loi tai so do ghe:", error);
      alert("Khong tai duoc so do ghe. Kiem tra backend hoac phong chieu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [roomId]);

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
      alert("So hang tu 1-26 va so cot tu 1-30.");
      return;
    }

    const confirmGenerate = window.confirm(
      "Tao lai so do ghe se xoa cac ghe cu cua phong nay. Tiep tuc?"
    );

    if (!confirmGenerate) return;

    try {
      setSaving(true);
      await generateSeats(roomId, rowCount, columnCount);
      await loadData();
    } catch (error) {
      console.error("Loi tao so do ghe:", error);
      alert("Tao so do ghe that bai.");
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
      console.error("Loi cap nhat ghe:", error);
      alert("Cap nhat ghe that bai.");
    } finally {
      setSaving(false);
    }
  };

  if (!roomId) {
    return (
      <section className="seat-page">
        <div className="seat-panel">
          <span className="page-label">CINEMA MANAGEMENT</span>
          <h2>So do ghe</h2>
          <p>Chon mot phong chieu de quan ly so do ghe.</p>
          <Link className="seat-back-link" to="/admin/theaters">
            Quay lai danh sach rap
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="seat-page">
      <div className="seat-header">
        <div>
          <span className="page-label">CINEMA MANAGEMENT</span>
          <h2>So do ghe</h2>
          <p>
            {room
              ? `${room.name} - ${room.type || "2D"} - ${room.seatCount || 0} ghe`
              : `Phong #${roomId}`}
          </p>
        </div>

        <Link className="seat-back-link" to="/admin/theaters">
          Quay lai
        </Link>
      </div>

      <div className="seat-tools">
        <div className="seat-generate-form">
          <label>
            Hang
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
            Cot
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
            Tao so do
          </button>
        </div>

        <div className="seat-legend">
          <span><i className="standard" /> Thuong</span>
          <span><i className="vip" /> VIP</span>
          <span><i className="couple" /> Couple</span>
          <span><i className="inactive" /> Khoa</span>
        </div>
      </div>

      <div className="seat-content">
        <div className="seat-map-panel">
          <div className="screen">MAN HINH</div>

          {loading ? (
            <div className="seat-empty">Dang tai so do ghe...</div>
          ) : seats.length === 0 ? (
            <div className="seat-empty">
              Phong nay chua co ghe. Bam "Tao so do" de tao ghe.
            </div>
          ) : (
            <div className="seat-map">
              {Object.entries(groupedSeats).map(([row, rowSeats]) => (
                <div className="seat-row" key={row}>
                  <span className="seat-row-label">{row}</span>
                  <div className="seat-row-items">
                    {rowSeats.map((seat) => (
                      <button
                        key={seat.id}
                        className={`seat-cell ${seat.seatType?.toLowerCase() || "standard"} ${
                          seat.status === "INACTIVE" ? "inactive" : ""
                        } ${selectedSeat?.id === seat.id ? "selected" : ""}`}
                        onClick={() => setSelectedSeat(seat)}
                        type="button"
                      >
                        {seat.seatCode}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="seat-detail-panel">
          <h3>Chi tiet ghe</h3>

          {selectedSeat ? (
            <>
              <div className="seat-detail-code">{selectedSeat.seatCode}</div>

              <label>
                Loai ghe
                <select
                  value={selectedSeat.seatType || "STANDARD"}
                  onChange={(e) => handleSeatChange("seatType", e.target.value)}
                  disabled={saving}
                >
                  <option value="STANDARD">STANDARD</option>
                  <option value="VIP">VIP</option>
                  <option value="COUPLE">COUPLE</option>
                </select>
              </label>

              <label>
                Phu thu
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
                Trang thai
                <select
                  value={selectedSeat.status || "ACTIVE"}
                  onChange={(e) => handleSeatChange("status", e.target.value)}
                  disabled={saving}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </label>
            </>
          ) : (
            <p>Chon mot ghe tren so do de chinh sua.</p>
          )}
        </aside>
      </div>
    </section>
  );
}

export default SeatMapPage;
