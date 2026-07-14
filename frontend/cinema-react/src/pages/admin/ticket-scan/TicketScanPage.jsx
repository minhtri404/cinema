import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import QrCodeScannerOutlinedIcon from "@mui/icons-material/QrCodeScannerOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { useEffect, useMemo, useRef, useState } from "react";
import { getBookings, useTicket } from "../../../api/bookingApi";
import "../../../styles/ticket-scan.css";
import { bookingStatusLabel, ticketStatusLabel } from "../../../utils/displayLabels";

const formatDateTime = (date, time) => {
  if (!date && !time) return "—";
  return `${date || ""} ${time ? String(time).slice(0, 5) : ""}`.trim();
};

const getSeatText = (booking) =>
  (booking?.seats || []).map((seat) => seat.seatCode).filter(Boolean).join(", ") || "—";

const normalizeCodes = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return [];

  const candidates = new Set([raw]);

  try {
    const parsed = JSON.parse(raw);
    ["ticketCode", "bookingCode", "qrCode", "code"].forEach((key) => {
      if (parsed?.[key]) candidates.add(String(parsed[key]).trim());
    });
  } catch {
    // QR có thể chỉ là chuỗi thường, không phải JSON.
  }

  candidates.add(raw.replace(/^QR[-:]/i, ""));
  candidates.add(raw.replace(/^TICKET[-:]/i, ""));

  return [...candidates].filter(Boolean);
};

const findBookingByCode = (bookings, code) => {
  const candidates = normalizeCodes(code).map((item) => item.toUpperCase());

  return bookings.find((booking) => {
    const values = [
      booking.bookingCode,
      booking.ticket?.ticketCode,
      booking.ticket?.qrCode,
      booking.ticket?.qrCode?.replace(/^QR[-:]/i, ""),
    ]
      .filter(Boolean)
      .map((item) => String(item).trim().toUpperCase());

    return candidates.some((candidate) => values.includes(candidate));
  });
};

function TicketScanPage() {
  const [bookings, setBookings] = useState([]);
  const [ticketCode, setTicketCode] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerStatus, setScannerStatus] = useState("");
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const videoRef = useRef(null);
  const scannerControlsRef = useRef(null);

  const recentTickets = useMemo(
    () => bookings.filter((booking) => booking.ticket?.ticketCode).slice(0, 6),
    [bookings],
  );

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await getBookings();
      setBookings(response.data || []);
    } catch (error) {
      setMessage("Không tải được danh sách vé.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = (code = ticketCode) => {
    const booking = findBookingByCode(bookings, code);
    setSelectedBooking(booking || null);

    if (!String(code || "").trim()) {
      setMessage("Vui lòng nhập hoặc quét mã vé.");
      setMessageType("error");
      return;
    }

    if (!booking) {
      setMessage("Không tìm thấy vé trong hệ thống.");
      setMessageType("error");
      return;
    }

    if (booking.status !== "PAID") {
      setMessage(`Vé chưa hợp lệ để nhận. Trạng thái đơn vé: ${bookingStatusLabel(booking.status)}.`);
      setMessageType("error");
      return;
    }

    if (booking.ticket?.status === "USED") {
      setMessage("Vé đã được nhận trước đó. Không được nhận lần 2.");
      setMessageType("error");
      return;
    }

    if (booking.ticket?.status !== "VALID") {
      setMessage(`Vé không hợp lệ. Trạng thái vé: ${ticketStatusLabel(booking.ticket?.status)}.`);
      setMessageType("error");
      return;
    }

    setMessage("Vé hợp lệ. Có thể xác nhận nhận vé.");
    setMessageType("success");
  };

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (!scannerOpen) return undefined;

    let active = true;
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.EAN_13,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    const reader = new BrowserMultiFormatReader(hints, {
      delayBetweenScanAttempts: 120,
      delayBetweenScanSuccess: 350,
    });

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

    const applyCode = (value) => {
      if (!active) return;
      const code = String(value || "").trim();
      if (!code) return;
      setTicketCode(code);
      setScannerStatus(`Đã quét mã: ${code}`);
      stopScanner();
      setScannerOpen(false);
      handleLookup(code);
    };

    const startScanner = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setScannerStatus("Trình duyệt không hỗ trợ mở camera. Hãy nhập mã vé thủ công.");
          return;
        }

        setScannerStatus("Đưa QR/barcode trên vé vào khung quét.");
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        setCameraDevices(devices);
        const preferredDevice =
          devices.find((device) => device.deviceId === selectedCameraId) ||
          devices.find(
            (device) =>
              /back|rear|environment/i.test(device.label) &&
              !/snap|obs|virtual|manycam|xsplit|droidcam/i.test(device.label),
          ) ||
          devices.find((device) => !/snap|obs|virtual|manycam|xsplit|droidcam/i.test(device.label)) ||
          devices[0];

        if (!preferredDevice) {
          setScannerStatus("Không tìm thấy camera. Hãy nhập mã vé thủ công.");
          return;
        }

        if (preferredDevice.deviceId !== selectedCameraId) {
          setSelectedCameraId(preferredDevice.deviceId);
        }

        const controls = await reader.decodeFromVideoDevice(
          preferredDevice.deviceId,
          videoRef.current,
          (result) => {
            if (result) applyCode(result.getText());
          },
        );
        scannerControlsRef.current = controls;
      } catch (error) {
        console.error(error);
        setScannerStatus("Không mở được camera hoặc chưa cấp quyền. Hãy nhập mã vé thủ công.");
      }
    };

    startScanner();

    return stopScanner;
  }, [scannerOpen, bookings, selectedCameraId]);

  const handleConfirmUse = async () => {
    if (!selectedBooking) return;
    if (selectedBooking.status !== "PAID" || selectedBooking.ticket?.status !== "VALID") {
      handleLookup(ticketCode);
      return;
    }

    try {
      setProcessing(true);
      const response = await useTicket(selectedBooking.id);
      const updated = response.data;
      setSelectedBooking(updated);
      setBookings((current) =>
        current.map((booking) => (booking.id === updated.id ? updated : booking)),
      );
      setMessage("Đã xác nhận nhận vé. Vé chuyển sang trạng thái đã sử dụng.");
      setMessageType("success");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Xác nhận nhận vé thất bại.");
      setMessageType("error");
    } finally {
      setProcessing(false);
    }
  };

  const canUseTicket = selectedBooking?.status === "PAID" && selectedBooking?.ticket?.status === "VALID";

  return (
    <section className="ticket-scan-page">
      <div className="ticket-scan-card">
        <header className="ticket-scan-header">
          <div>
            <span className="page-label">QUẢN LÝ RẠP CHIẾU PHIM</span>
            <h2>Quét vé</h2>
            <p>Kiểm tra vé vào rạp, chống nhận vé trùng hoặc vé không hợp lệ.</p>
          </div>
          <button type="button" className="ticket-scan-refresh" onClick={loadBookings} disabled={loading}>
            <RefreshRoundedIcon fontSize="small" />
            {loading ? "Đang tải..." : "Tải lại"}
          </button>
        </header>

        <div className="ticket-scan-input-row">
          <label>
            <span>Mã vé / QR / Mã đặt vé</span>
            <input
              value={ticketCode}
              onChange={(event) => setTicketCode(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleLookup();
              }}
              placeholder="Ví dụ: TK202607131906001 hoặc QR-BK20260713190600"
            />
          </label>
          <button type="button" className="secondary" onClick={() => setScannerOpen(true)}>
            <QrCodeScannerOutlinedIcon fontSize="small" />
            Quét camera
          </button>
          <button type="button" onClick={() => handleLookup()}>
            <SearchRoundedIcon fontSize="small" />
            Kiểm tra
          </button>
        </div>

        {message && (
          <div className={`ticket-scan-message ${messageType}`}>
            {messageType === "success" ? <CheckCircleOutlineRoundedIcon /> : <ErrorOutlineRoundedIcon />}
            <span>{message}</span>
          </div>
        )}

        <div className="ticket-scan-grid">
          <section className="ticket-info-box">
            <h3>Thông tin vé</h3>
            {!selectedBooking ? (
              <div className="ticket-scan-empty">
                <ConfirmationNumberRoundedIcon />
                <p>Nhập hoặc quét mã vé để xem thông tin.</p>
              </div>
            ) : (
              <>
                <div className="ticket-info-table">
                  <div><span>Rạp</span><strong>{selectedBooking.theaterName || "—"}</strong></div>
                  <div><span>Phòng</span><strong>{selectedBooking.roomName || "—"}</strong></div>
                  <div><span>Ghế</span><strong>{getSeatText(selectedBooking)}</strong></div>
                  <div><span>Phim</span><strong>{selectedBooking.movieTitle || "—"}</strong></div>
                  <div><span>Suất chiếu</span><strong>{formatDateTime(selectedBooking.showDate, selectedBooking.startTime)}</strong></div>
                  <div>
                    <span>Trạng thái</span>
                    <strong className={canUseTicket ? "valid" : "invalid"}>
                      {canUseTicket
                        ? "Vé hợp lệ"
                        : selectedBooking.ticket?.status
                          ? ticketStatusLabel(selectedBooking.ticket.status)
                          : bookingStatusLabel(selectedBooking.status)}
                    </strong>
                  </div>
                  <div><span>Mã vé</span><strong>{selectedBooking.ticket?.ticketCode || "—"}</strong></div>
                  <div><span>Mã đặt vé</span><strong>{selectedBooking.bookingCode || "—"}</strong></div>
                  <div><span>Khách hàng</span><strong>{selectedBooking.customerName || "—"}</strong></div>
                </div>

                <div className="ticket-scan-actions">
                  <button type="button" disabled={!canUseTicket || processing} onClick={handleConfirmUse}>
                    <CheckCircleOutlineRoundedIcon fontSize="small" />
                    {processing ? "Đang xác nhận..." : "Xác nhận nhận vé"}
                  </button>
                </div>
              </>
            )}
          </section>

          <aside className="ticket-recent-box">
            <h3>Vé gần đây</h3>
            <div className="ticket-recent-list">
              {recentTickets.length === 0 ? (
                <p>Chưa có vé.</p>
              ) : (
                recentTickets.map((booking) => (
                  <button
                    type="button"
                    key={booking.id}
                    onClick={() => {
                      setTicketCode(booking.ticket?.ticketCode || "");
                      handleLookup(booking.ticket?.ticketCode || "");
                    }}
                  >
                    <strong>{booking.ticket?.ticketCode}</strong>
                    <span>{booking.movieTitle}</span>
                    <small>{ticketStatusLabel(booking.ticket?.status)}</small>
                  </button>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>

      {scannerOpen && (
        <div className="ticket-scan-overlay" onMouseDown={() => setScannerOpen(false)}>
          <div className="ticket-scanner-modal" onMouseDown={(event) => event.stopPropagation()}>
            <h3>Quét mã vé</h3>
            {cameraDevices.length > 0 && (
              <label className="ticket-camera-select">
                <span>Chọn camera</span>
                <select
                  value={selectedCameraId}
                  onChange={(event) => setSelectedCameraId(event.target.value)}
                >
                  {cameraDevices.map((device, index) => (
                    <option value={device.deviceId} key={device.deviceId || index}>
                      {device.label || `Camera ${index + 1}`}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="ticket-camera-frame">
              <video ref={videoRef} playsInline muted />
              <div className="ticket-camera-target"><span /></div>
            </div>
            <p>{scannerStatus || "Đưa QR/barcode vào khung quét."}</p>
            <label>
              <span>Nhập thủ công nếu camera không quét được</span>
              <input
                value={ticketCode}
                onChange={(event) => setTicketCode(event.target.value)}
                placeholder="Mã vé / mã đặt vé / QR"
              />
            </label>
            <div className="ticket-scanner-actions">
              <button type="button" className="secondary" onClick={() => setScannerOpen(false)}>Đóng</button>
              <button
                type="button"
                onClick={() => {
                  setScannerOpen(false);
                  handleLookup(ticketCode);
                }}
              >
                Kiểm tra vé
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default TicketScanPage;
