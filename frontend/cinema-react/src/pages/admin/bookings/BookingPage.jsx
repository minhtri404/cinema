import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LocalMoviesOutlinedIcon from "@mui/icons-material/LocalMoviesOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import QrCodeScannerOutlinedIcon from "@mui/icons-material/QrCodeScannerOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import WeekendOutlinedIcon from "@mui/icons-material/WeekendOutlined";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, QRCodeWriter } from "@zxing/library";
import { useEffect, useMemo, useRef, useState } from "react";
import { createBooking, cancelBooking, getBookings, payBooking, useTicket } from "../../../api/bookingApi";
import { getFoods } from "../../../api/foodApi";
import { getMovies } from "../../../api/movieApi";
import { getRooms } from "../../../api/roomApi";
import { getSeatsByRoom } from "../../../api/seatApi";
import { getShowtimes } from "../../../api/showtimeApi";
import { getTheaters } from "../../../api/theaterApi";
import "../../../styles/booking.css";

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const today = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const formatDateTime = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const showtimeText = (booking) =>
  `${booking.showDate || ""} ${booking.startTime || ""}`.trim() || "—";

const seatText = (booking) =>
  (booking.seats || []).map((seat) => seat.seatCode).filter(Boolean).join(", ") || "—";

const foodText = (booking) =>
  (booking.foods || [])
    .map((food) => `${food.foodName} x${food.quantity || 0}`)
    .filter(Boolean)
    .join(", ") || "—";

const isCounterSale = (booking) => Number(booking.userId || 0) === 0;

function TicketQrCode({ value }) {
  const qr = useMemo(() => {
    if (!value) return null;

    try {
      const matrix = new QRCodeWriter().encode(value, BarcodeFormat.QR_CODE, 0, 0, new Map());
      const width = matrix.getWidth();
      const height = matrix.getHeight();
      const path = [];

      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          if (matrix.get(x, y)) {
            path.push(`M${x} ${y}h1v1h-1z`);
          }
        }
      }

      return { width, height, quietZone: 4, path: path.join("") };
    } catch (error) {
      console.error(error);
      return null;
    }
  }, [value]);

  if (!qr) return null;

  return (
    <svg
      className="ticket-qr-svg"
      viewBox={`${-qr.quietZone} ${-qr.quietZone} ${qr.width + qr.quietZone * 2} ${qr.height + qr.quietZone * 2}`}
      role="img"
      aria-label="Mã QR vé"
      shapeRendering="crispEdges"
    >
      <rect
        x={-qr.quietZone}
        y={-qr.quietZone}
        width={qr.width + qr.quietZone * 2}
        height={qr.height + qr.quietZone * 2}
        fill="#ffffff"
      />
      <path d={qr.path} fill="#0f172a" />
    </svg>
  );
}

const errorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  return data?.message || fallback;
};

const seatPrice = (seat) => {
  const type = String(seat.seatType || "").toUpperCase();
  if (type.includes("COUPLE")) return 115000 + Number(seat.extraPrice || 0);
  if (type.includes("VIP")) return 105000 + Number(seat.extraPrice || 0);
  return 85000 + Number(seat.extraPrice || 0);
};

const initialCustomer = {
  code: "",
  name: "Khách vãng lai",
  email: "",
  phone: "",
  points: 0,
};

function BookingPage() {
  const [mode, setMode] = useState("list");
  const [bookings, setBookings] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ticketTab, setTicketTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [movies, setMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [foods, setFoods] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today());
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [comboQuantities, setComboQuantities] = useState({});
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState(initialCustomer);
  const [cashGiven, setCashGiven] = useState("");
  const [cashModalOpen, setCashModalOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerStatus, setScannerStatus] = useState("");
  const [processing, setProcessing] = useState(false);
  const videoRef = useRef(null);
  const scannerControlsRef = useRef(null);

  const movieMap = useMemo(() => new Map(movies.map((movie) => [Number(movie.id), movie])), [movies]);
  const theaterMap = useMemo(() => new Map(theaters.map((theater) => [Number(theater.id), theater])), [theaters]);
  const roomMap = useMemo(() => new Map(rooms.map((room) => [Number(room.id), room])), [rooms]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await getBookings();
      setBookings(response.data || []);
    } catch (error) {
      alert(errorMessage(error, "Không tải được danh sách vé."));
    } finally {
      setLoading(false);
    }
  };

  const loadSaleData = async () => {
    const [movieRes, showtimeRes, theaterRes, roomRes, foodRes] = await Promise.all([
      getMovies(),
      getShowtimes({ showDate: selectedDate }),
      getTheaters(),
      getRooms(),
      getFoods(),
    ]);
    setMovies(movieRes.data || []);
    setShowtimes(showtimeRes.data || []);
    setTheaters(theaterRes.data || []);
    setRooms(roomRes.data || []);
    setFoods((foodRes.data || []).filter((food) => food.status === "ACTIVE"));
  };

  useEffect(() => {
    loadBookings();
    loadSaleData().catch((error) => {
      console.error(error);
    });
  }, []);

  useEffect(() => {
    if (mode === "sale") {
      getShowtimes({ showDate: selectedDate })
        .then((response) => setShowtimes(response.data || []))
        .catch(() => setShowtimes([]));
      resetSaleSelection();
    }
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedShowtime?.roomId) {
      setSeats([]);
      return;
    }
    getSeatsByRoom(selectedShowtime.roomId)
      .then((response) => setSeats(response.data || []))
      .catch(() => setSeats([]));
  }, [selectedShowtime]);

  useEffect(() => {
    if (!scannerOpen) return undefined;

    let active = true;
    const reader = new BrowserMultiFormatReader();

    const stopScanner = () => {
      active = false;
      if (scannerControlsRef.current) {
        scannerControlsRef.current.stop();
        scannerControlsRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    const fillCustomerFromCode = (code) => {
      const normalized = String(code || "").trim();
      if (!normalized) return;
      setCustomer({
        code: normalized,
        name: "Khách hàng thành viên",
        email: `${normalized.toLowerCase()}@example.invalid`,
        phone: "0900000000",
        points: 120,
      });
      setScannerStatus(`Đã quét mã: ${normalized}`);
      stopScanner();
      setTimeout(() => setScannerOpen(false), 450);
    };

    const startScanner = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setScannerStatus("Trình duyệt không cho phép mở camera. Hãy nhập mã thủ công.");
          return;
        }

        setScannerStatus("Đưa mã vạch/QR vào khung để quét.");

        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        const preferredDevice =
          devices.find((device) => /back|rear|environment/i.test(device.label)) || devices[0];

        if (!preferredDevice) {
          setScannerStatus("Không tìm thấy camera. Hãy nhập mã thủ công.");
          return;
        }

        const controls = await reader.decodeFromVideoDevice(
          preferredDevice.deviceId,
          videoRef.current,
          (result) => {
            if (!active || !result) return;
            fillCustomerFromCode(result.getText());
          },
        );
        scannerControlsRef.current = controls;
      } catch (error) {
        console.error(error);
        setScannerStatus("Không mở được camera hoặc chưa cấp quyền. Hãy kiểm tra quyền camera hoặc nhập mã thủ công.");
      }
    };

    startScanner();

    return stopScanner;
  }, [scannerOpen]);
  const filteredBookings = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    return bookings.filter((booking) => {
      const searchable = [
        booking.bookingCode,
        booking.ticket?.ticketCode,
        booking.customerName,
        booking.customerEmail,
        booking.customerPhone,
        booking.movieTitle,
        booking.theaterName,
        seatText(booking),
      ];
      const matchesKeyword =
        !value ||
        searchable
          .filter(Boolean)
          .some((item) => String(item).toLowerCase().includes(value));
      const matchesTab =
        ticketTab === "all" ||
        (ticketTab === "counter" && isCounterSale(booking)) ||
        (ticketTab === "online" && !isCounterSale(booking));

      return matchesKeyword && matchesTab && (!statusFilter || booking.status === statusFilter);
    });
  }, [bookings, keyword, statusFilter, ticketTab]);

  const summary = useMemo(() => {
    const paid = bookings.filter((booking) => booking.status === "PAID");
    return {
      total: bookings.length,
      paid: paid.length,
      counter: bookings.filter(isCounterSale).length,
      online: bookings.filter((booking) => !isCounterSale(booking)).length,
      revenue: paid.reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0),
      pending: bookings.filter((booking) => booking.status === "PENDING").length,
    };
  }, [bookings]);

  const ticketTabs = [
    { value: "all", label: "Tất cả vé", count: summary.total },
    { value: "counter", label: "Vé đã bán tại quầy", count: summary.counter },
    { value: "online", label: "Vé online", count: summary.online },
  ];

  const groupedShowtimes = useMemo(() => {
    const online = showtimes.filter((showtime) => showtime.status !== "OFFLINE");
    return online.reduce((groups, showtime) => {
      const key = showtime.movieId || showtime.movieName;
      if (!groups[key]) groups[key] = [];
      groups[key].push(showtime);
      return groups;
    }, {});
  }, [showtimes]);

  const soldSeatCodes = useMemo(() => {
    if (!selectedShowtime) return new Set();
    return new Set(
      bookings
        .filter(
          (booking) =>
            Number(booking.showtimeId) === Number(selectedShowtime.id) &&
            !["CANCELLED", "EXPIRED"].includes(booking.status),
        )
        .flatMap((booking) => booking.seats || [])
        .map((seat) => seat.seatCode),
    );
  }, [bookings, selectedShowtime]);

  const selectedMovie = selectedShowtime ? movieMap.get(Number(selectedShowtime.movieId)) : null;
  const selectedTheater = selectedShowtime ? theaterMap.get(Number(selectedShowtime.theaterId)) : null;
  const selectedRoom = selectedShowtime ? roomMap.get(Number(selectedShowtime.roomId)) : null;
  const combos = foods.filter((food) => food.category === "COMBO");

  const selectedCombos = combos
    .map((combo) => ({
      ...combo,
      quantity: Number(comboQuantities[combo.id] || 0),
    }))
    .filter((combo) => combo.quantity > 0);

  const ticketTotal = selectedSeats.reduce((sum, seat) => sum + seatPrice(seat), 0);
  const comboTotal = selectedCombos.reduce((sum, combo) => sum + Number(combo.price || 0) * combo.quantity, 0);
  const totalAmount = ticketTotal + comboTotal;
  const changeAmount = Number(cashGiven || 0) - totalAmount;

  const resetSaleSelection = () => {
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setComboQuantities({});
    setStep(1);
    setCashGiven("");
    setCashModalOpen(false);
  };

  const openSaleMode = () => {
    setMode("sale");
    setStep(1);
    loadSaleData().catch((error) => alert(errorMessage(error, "Không tải được dữ liệu bán vé.")));
  };

  const closeSaleMode = () => {
    setMode("list");
    resetSaleSelection();
  };

  const handleCancel = async (booking) => {
    if (!window.confirm(`Hủy vé "${booking.bookingCode}"?`)) return;
    try {
      await cancelBooking(booking.id);
      await loadBookings();
      alert("Đã hủy vé.");
    } catch (error) {
      alert(errorMessage(error, "Hủy vé thất bại."));
    }
  };

  const handleUseTicket = async (booking) => {
    if (!window.confirm(`Xác nhận đã sử dụng vé "${booking.ticket?.ticketCode}"?`)) return;
    try {
      await useTicket(booking.id);
      await loadBookings();
      alert("Đã cập nhật vé thành USED.");
    } catch (error) {
      alert(errorMessage(error, "Cập nhật vé thất bại."));
    }
  };

  const toggleSeat = (seat) => {
    if (seat.status !== "ACTIVE" || soldSeatCodes.has(seat.seatCode)) return;
    setSelectedSeats((current) =>
      current.some((item) => item.id === seat.id)
        ? current.filter((item) => item.id !== seat.id)
        : [...current, seat],
    );
  };

  const updateComboQuantity = (comboId, nextQuantity) => {
    setComboQuantities((current) => ({
      ...current,
      [comboId]: Math.max(0, nextQuantity),
    }));
  };

  const applyScannedCustomer = () => {
    const code = customer.code.trim() || `CUS${Date.now().toString().slice(-6)}`;
    setCustomer({
      code,
      name: "Khách hàng thành viên",
      email: `${code.toLowerCase()}@example.invalid`,
      phone: "0900000000",
      points: 120,
    });
    setScannerOpen(false);
  };

  const buildBookingPayload = () => ({
    userId: 0,
    customerName: customer.name || "Khách vãng lai",
    customerEmail: customer.email || null,
    customerPhone: customer.phone || null,
    showtimeId: selectedShowtime.id,
    movieTitle: selectedShowtime.movieName,
    theaterName: selectedTheater?.name || `Rạp #${selectedShowtime.theaterId}`,
    roomName: selectedRoom?.name || `Phòng #${selectedShowtime.roomId}`,
    showDate: selectedShowtime.showDate,
    startTime: selectedShowtime.startTime,
    discountAmount: 0,
    seats: selectedSeats.map((seat) => ({
      seatId: seat.id,
      seatCode: seat.seatCode,
      seatType: seat.seatType || "STANDARD",
      price: seatPrice(seat),
    })),
    foods: selectedCombos.map((combo) => ({
      foodId: combo.id,
      foodName: combo.name,
      quantity: combo.quantity,
      unitPrice: Number(combo.price || 0),
      totalPrice: Number(combo.price || 0) * combo.quantity,
    })),
  });

  const completePayment = async (paymentMethod = "CASH") => {
    if (!selectedShowtime || selectedSeats.length === 0) {
      alert("Vui lòng chọn suất chiếu và ghế.");
      return;
    }
    try {
      setProcessing(true);
      const bookingResponse = await createBooking(buildBookingPayload());
      const booking = bookingResponse.data;
      await payBooking(booking.id, { paymentMethod });
      await loadBookings();
      alert("Thanh toán thành công. Vé đã được tạo.");
      closeSaleMode();
    } catch (error) {
      alert(errorMessage(error, "Thanh toán thất bại."));
    } finally {
      setProcessing(false);
      setCashModalOpen(false);
    }
  };

  const renderListMode = () => (
    <div className="booking-card">
      <header className="booking-header">
        <div>
          <span className="page-label">CINEMA MANAGEMENT</span>
          <h2>Vé & Booking</h2>
          <p>Quản lý đơn đặt vé, thanh toán, mã vé và trạng thái sử dụng.</p>
        </div>
        <button type="button" className="booking-sell-btn" onClick={openSaleMode}>
          <AddRoundedIcon fontSize="small" />
          Bán vé
        </button>
      </header>

      <div className="booking-summary">
        <div><span>Tổng booking</span><strong>{summary.total}</strong></div>
        <div><span>Đã thanh toán</span><strong>{summary.paid}</strong></div>
        <div><span>Chờ thanh toán</span><strong>{summary.pending}</strong></div>
        <div><span>Doanh thu</span><strong>{money(summary.revenue)}</strong></div>
      </div>

      <div className="booking-tabs" role="tablist" aria-label="Lọc loại vé">
        {ticketTabs.map((tab) => (
          <button
            type="button"
            role="tab"
            aria-selected={ticketTab === tab.value}
            className={ticketTab === tab.value ? "active" : ""}
            key={tab.value}
            onClick={() => setTicketTab(tab.value)}
          >
            <span>{tab.label}</span>
            <strong>{tab.count}</strong>
          </button>
        ))}
      </div>

      <div className="booking-toolbar">
        <label className="booking-search">
          <SearchRoundedIcon fontSize="small" />
          <input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm mã vé, khách hàng, phim, ghế..."
          />
        </label>

        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">PENDING</option>
          <option value="PAID">PAID</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="EXPIRED">EXPIRED</option>
        </select>
      </div>

      <div className="booking-table-wrap">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Mã vé</th>
              <th>Khách hàng</th>
              <th>Phim / Suất chiếu</th>
              <th>Rạp / Phòng</th>
              <th>Ghế</th>
              <th>Thanh toán</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="booking-empty">Đang tải dữ liệu...</td></tr>
            ) : filteredBookings.length === 0 ? (
              <tr><td colSpan="8" className="booking-empty">Chưa có vé phù hợp.</td></tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <div className="booking-code">
                      <span><ConfirmationNumberRoundedIcon fontSize="small" /></span>
                      <div>
                        <strong>{booking.ticket?.ticketCode || "Chưa sinh vé"}</strong>
                        <small>{booking.bookingCode}</small>
                      </div>
                    </div>
                  </td>
                  <td><strong>{booking.customerName || `User #${booking.userId}`}</strong><small>{booking.customerEmail || booking.customerPhone || "—"}</small></td>
                  <td><strong>{booking.movieTitle || `Showtime #${booking.showtimeId}`}</strong><small>{showtimeText(booking)}</small></td>
                  <td><strong>{booking.theaterName || "—"}</strong><small>{booking.roomName || "—"}</small></td>
                  <td>{seatText(booking)}</td>
                  <td><strong>{money(booking.totalAmount)}</strong><small>Vé {money(booking.ticketAmount)} · Combo {money(booking.foodAmount)}</small></td>
                  <td>
                    <span className={`booking-status ${booking.status?.toLowerCase()}`}>{booking.status}</span>
                    {booking.ticket?.status && <small className="ticket-status">Ticket: {booking.ticket.status}</small>}
                  </td>
                  <td>
                    <div className="booking-actions">
                      <button type="button" onClick={() => setSelectedBooking(booking)} title="Chi tiết"><InfoOutlinedIcon fontSize="small" /></button>
                      {booking.ticket?.status === "VALID" && (
                        <button type="button" className="success" onClick={() => handleUseTicket(booking)} title="Dùng vé"><CheckCircleOutlineRoundedIcon fontSize="small" /></button>
                      )}
                      {!["CANCELLED", "EXPIRED"].includes(booking.status) && (
                        <button type="button" className="danger" onClick={() => handleCancel(booking)} title="Hủy vé"><CancelOutlinedIcon fontSize="small" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSaleMode = () => (
    <div className="ticket-sale-shell">
      <div className="ticket-sale-top">
        <div>
          <span className="page-label">BÁN VÉ</span>
          <h2>Bán vé tại quầy</h2>
        </div>
        <button type="button" className="ticket-cancel-btn" onClick={closeSaleMode}>Hủy</button>
      </div>

      <div className="ticket-date-row">
        <label>
          <span>Ngày chiếu</span>
          <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
        </label>
        <button type="button" onClick={() => getShowtimes({ showDate: selectedDate }).then((res) => setShowtimes(res.data || []))}>
          Chấp nhận
        </button>
      </div>

      {!selectedShowtime ? (
        <div className="showtime-picker">
          <h3>Lịch chiếu phim</h3>
          {Object.keys(groupedShowtimes).length === 0 ? (
            <div className="booking-empty">Không có suất chiếu trong ngày đã chọn.</div>
          ) : (
            Object.entries(groupedShowtimes).map(([movieKey, items]) => {
              const movie = movieMap.get(Number(items[0].movieId));
              return (
                <section key={movieKey} className="showtime-group">
                  <h4>{items[0].movieName}</h4>
                  <div className="showtime-card-grid">
                    {items.map((showtime) => (
                      <button
                        type="button"
                        className="showtime-movie-card"
                        key={showtime.id}
                        onClick={() => {
                          setSelectedShowtime(showtime);
                          setStep(1);
                        }}
                      >
                        {movie?.posterUrl ? <img src={movie.posterUrl} alt={showtime.movieName} /> : <LocalMoviesOutlinedIcon />}
                        <strong>{showtime.startTime?.slice(0, 5)}</strong>
                        <span>{theaterMap.get(Number(showtime.theaterId))?.name || `Rạp #${showtime.theaterId}`}</span>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      ) : (
        <div className="ticket-workspace">
          <aside className="ticket-info-panel">
            <h3>Thông tin vé</h3>
            <div className="ticket-poster-box">
              {selectedMovie?.posterUrl ? <img src={selectedMovie.posterUrl} alt={selectedShowtime.movieName} /> : <LocalMoviesOutlinedIcon />}
            </div>
            <div className="ticket-info-lines">
              <p><span>Suất chiếu:</span><strong>{selectedShowtime.showDate} {selectedShowtime.startTime?.slice(0, 5)}</strong></p>
              <p><span>Rạp:</span><strong>{selectedTheater?.name || `Rạp #${selectedShowtime.theaterId}`}</strong></p>
              <p><span>Phòng:</span><strong>{selectedRoom?.name || `Phòng #${selectedShowtime.roomId}`}</strong></p>
              <p><span>Phim:</span><strong>{selectedShowtime.movieName}</strong></p>
            </div>
            <div className="ticket-info-total">
              <p><ShoppingCartOutlinedIcon fontSize="small" /> Combo: <strong>{selectedCombos.map((item) => `${item.name} x${item.quantity}`).join(", ") || "—"}</strong></p>
              <p><WeekendOutlinedIcon fontSize="small" /> Ghế: <strong>{selectedSeats.map((seat) => seat.seatCode).join(", ") || "—"}</strong></p>
              <p><PaymentsOutlinedIcon fontSize="small" /> Tổng tiền: <strong>{money(totalAmount)}</strong></p>
            </div>
          </aside>

          <main className="ticket-step-panel">
            <div className="ticket-steps">
              <button className={step === 1 ? "active" : ""} onClick={() => setStep(1)}>1. Chọn Ghế</button>
              <button className={step === 2 ? "active" : ""} onClick={() => selectedSeats.length && setStep(2)}>2. Chọn Combo</button>
              <button className={step === 3 ? "active" : ""} onClick={() => selectedSeats.length && setStep(3)}>3. Thanh toán</button>
            </div>

            {step === 1 && (
              <div className="seat-step">
                <h3>Chọn Ghế</h3>
                <div className="seat-legend">
                  <span><i className="seat standard" />85,000đ</span>
                  <span><i className="seat vip" />105,000đ</span>
                  <span><i className="seat couple" />115,000đ</span>
                  <span><i className="seat selected" />Ghế đang chọn</span>
                  <span><i className="seat sold" />Ghế đã bán</span>
                  <span><i className="seat maintenance" />Ghế bảo trì</span>
                </div>
                <div className="screen-line">Màn hình</div>
                <div className="seat-map">
                  {seats.map((seat) => {
                    const selected = selectedSeats.some((item) => item.id === seat.id);
                    const sold = soldSeatCodes.has(seat.seatCode);
                    const maintenance = seat.status !== "ACTIVE";
                    const typeClass = String(seat.seatType || "STANDARD").toLowerCase();
                    return (
                      <button
                        type="button"
                        key={seat.id}
                        className={`seat-cell ${typeClass} ${selected ? "selected" : ""} ${sold ? "sold" : ""} ${maintenance ? "maintenance" : ""}`}
                        onClick={() => toggleSeat(seat)}
                        disabled={sold || maintenance}
                      >
                        {maintenance ? "X" : selected ? "✓" : seat.seatCode}
                      </button>
                    );
                  })}
                </div>
                <div className="ticket-step-actions">
                  <button type="button" className="secondary" onClick={resetSaleSelection}>Chọn suất khác</button>
                  <button type="button" disabled={selectedSeats.length === 0} onClick={() => setStep(2)}>Tiếp tục</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="combo-step">
                <h3>Chọn Combo</h3>
                <div className="combo-sale-grid">
                  {combos.length === 0 ? (
                    <div className="booking-empty">Chưa có combo đang bán.</div>
                  ) : (
                    combos.map((combo) => {
                      const quantity = Number(comboQuantities[combo.id] || 0);
                      return (
                        <article className="combo-sale-item" key={combo.id}>
                          {combo.imageUrl ? <img src={combo.imageUrl} alt={combo.name} /> : <ShoppingCartOutlinedIcon />}
                          <div>
                            <h4>{combo.name}</h4>
                            <p>{combo.description || "Combo bắp nước."}</p>
                            <strong>Giá: {money(combo.price)}</strong>
                            <div className="combo-qty">
                              <button type="button" onClick={() => updateComboQuantity(combo.id, quantity - 1)}>−</button>
                              <input value={quantity} readOnly />
                              <button type="button" onClick={() => updateComboQuantity(combo.id, quantity + 1)}>+</button>
                            </div>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
                <div className="ticket-step-actions">
                  <button type="button" className="secondary" onClick={() => setStep(1)}>Quay lại</button>
                  <button type="button" onClick={() => setStep(3)}>Tiếp tục</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="payment-step">
                <h3>Thanh toán</h3>
                <button type="button" className="barcode-tab" onClick={() => setScannerOpen(true)}>
                  <QrCodeScannerOutlinedIcon fontSize="small" />
                  Quét mã vạch
                </button>
                <label><span>Mã khách hàng</span><input value={customer.code} onChange={(e) => setCustomer((cur) => ({ ...cur, code: e.target.value }))} /></label>
                <div className="customer-row">
                  <label><span>Tên</span><input value={customer.name} onChange={(e) => setCustomer((cur) => ({ ...cur, name: e.target.value }))} /></label>
                  <label><span>Điểm</span><input value={customer.points} readOnly /></label>
                </div>
                <div className="payment-methods">
                  <button type="button" onClick={() => completePayment("VNPAY_QR")} disabled={processing}>Thanh toán bằng ứng dụng hỗ trợ VNPAY QR</button>
                  <button type="button" className="cash" onClick={() => setCashModalOpen(true)} disabled={processing}>Thanh toán tiền mặt</button>
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );

  return (
    <section className="booking-page">
      {mode === "list" ? renderListMode() : renderSaleMode()}

      {selectedBooking && (
        <div className="booking-modal-overlay" onMouseDown={() => setSelectedBooking(null)}>
          <div className="booking-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="booking-modal-header">
              <div>
                <h3>Chi tiết vé</h3>
                <p>{selectedBooking.bookingCode} · {selectedBooking.ticket?.ticketCode || "Chưa có ticket"}</p>
              </div>
              <button type="button" onClick={() => setSelectedBooking(null)} aria-label="Đóng">×</button>
            </div>

            <div className="ticket-qr-panel">
              {selectedBooking.ticket ? (
                <>
                  <div className="ticket-qr-box">
                    <TicketQrCode
                      value={selectedBooking.ticket?.qrCode || selectedBooking.ticket?.ticketCode || selectedBooking.bookingCode}
                    />
                  </div>
                  <div>
                    <span>Mã QR dùng để quét vé</span>
                    <strong>{selectedBooking.ticket?.ticketCode}</strong>
                    <small>Nội dung QR: {selectedBooking.ticket?.qrCode || selectedBooking.ticket?.ticketCode}</small>
                  </div>
                </>
              ) : (
                <div>
                  <span>Chưa có mã QR</span>
                  <strong>Vé chưa thanh toán hoặc chưa sinh ticket.</strong>
                </div>
              )}
            </div>

            <div className="booking-detail-grid">
              <div><span>Khách hàng</span><strong>{selectedBooking.customerName || "—"}</strong></div>
              <div><span>Email</span><strong>{selectedBooking.customerEmail || "—"}</strong></div>
              <div><span>Phim</span><strong>{selectedBooking.movieTitle || "—"}</strong></div>
              <div><span>Suất chiếu</span><strong>{showtimeText(selectedBooking)}</strong></div>
              <div><span>Rạp</span><strong>{selectedBooking.theaterName || "—"}</strong></div>
              <div><span>Phòng</span><strong>{selectedBooking.roomName || "—"}</strong></div>
              <div><span>Ghế</span><strong>{seatText(selectedBooking)}</strong></div>
              <div><span>Đồ ăn</span><strong>{foodText(selectedBooking)}</strong></div>
              <div><span>Ngày đặt</span><strong>{formatDateTime(selectedBooking.createdAt)}</strong></div>
              <div><span>Ngày thanh toán</span><strong>{formatDateTime(selectedBooking.paidAt)}</strong></div>
              <div><span>Tổng tiền</span><strong>{money(selectedBooking.totalAmount)}</strong></div>
              <div><span>Trạng thái</span><strong>{selectedBooking.status}</strong></div>
            </div>
          </div>
        </div>
      )}

      {scannerOpen && (
        <div className="booking-modal-overlay" onMouseDown={() => setScannerOpen(false)}>
          <div className="scanner-modal" onMouseDown={(event) => event.stopPropagation()}>
            <h3>Quét Mã Vạch</h3>
            <div className="scanner-frame">
              <video ref={videoRef} playsInline muted />
              <div className="scanner-target">
                <span />
              </div>
            </div>
            <p>{scannerStatus || "Please align the barcode or QR code in the frame to scan it."}</p>
            <label className="scanner-manual">
              <span>Nhập mã thủ công nếu camera không quét được</span>
              <input
                value={customer.code}
                onChange={(event) => setCustomer((current) => ({ ...current, code: event.target.value }))}
                placeholder="Ví dụ: 3023060716801797"
              />
            </label>
            <div className="scanner-actions">
              <button type="button" className="secondary" onClick={() => setScannerOpen(false)}>Đóng</button>
              <button type="button" onClick={applyScannedCustomer}>Nhận mã khách hàng</button>
            </div>
          </div>
        </div>
      )}

      {cashModalOpen && (
        <div className="booking-modal-overlay" onMouseDown={() => setCashModalOpen(false)}>
          <div className="cash-modal" onMouseDown={(event) => event.stopPropagation()}>
            <h3>Thanh toán</h3>
            <label><span>Tổng tiền vé</span><input value={totalAmount} readOnly /></label>
            <label><span>Khách đưa</span><input type="number" value={cashGiven} onChange={(event) => setCashGiven(event.target.value)} autoFocus /></label>
            <label><span>Trả khách</span><input value={changeAmount || 0} readOnly /></label>
            <div className="cash-actions">
              <button type="button" className="secondary" onClick={() => setCashModalOpen(false)}>Close</button>
              <button type="button" disabled={processing || changeAmount < 0} onClick={() => completePayment("CASH")}>Thanh toán</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default BookingPage;

