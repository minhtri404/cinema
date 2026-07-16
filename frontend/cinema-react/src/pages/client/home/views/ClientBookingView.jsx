import BookingPaymentStep from "../components/BookingPaymentStep";
import {
  formatHoldTime,
  formatMoney,
  formatShowtimeTime,
  getAgeDescription,
  getAgeRating,
  getPoster,
  normalizeClientText,
  seatPrice,
} from "../clientHomeUtils";

function ClientBookingView({ controller }) {
  const {
    appliedPromotion,
    bookedSeatIds,
    bookingComboQuantities,
    bookingComboTotal,
    bookingCombos,
    bookingDiscountTotal,
    bookingError,
    bookingHoldSeconds,
    bookingLoading,
    bookingMovie,
    bookingPayableTotal,
    bookingSeatRows,
    bookingShowtime,
    bookingStep,
    bookingTheater,
    bookingTicketTotal,
    bookingTotal,
    clearPromotion,
    handleApplyPromotion,
    ownHeldSeatIds,
    promotionCode,
    promotionMessage,
    selectedBookingCombos,
    selectedBookingSeats,
    selectedPaymentMethod,
    setBookingStep,
    setPromotionCode,
    setSelectedPaymentMethod,
    setView,
    submitClientBooking,
    toggleBookingSeat,
    updateBookingComboQuantity,
  } = controller;

  if (!bookingShowtime || !bookingMovie) return null;

  const rating = getAgeRating(bookingMovie);
  const showtimeLabel = `${bookingShowtime.showDate || ""} ${formatShowtimeTime(bookingShowtime.startTime)}`;
  const roomName = normalizeClientText(bookingShowtime.roomName || `Phòng #${bookingShowtime.roomId}`);
  const selectedSeatCodes = selectedBookingSeats.map((seat) => seat.seatCode).join(", ");
  const selectedComboText = selectedBookingCombos.map((combo) => `${combo.name} x${combo.quantity}`).join(", ");

  return (
    <main className="client-booking-page">
      <button type="button" className="movie-detail-back" onClick={() => setView("movieDetail")}>← Quay lại chi tiết phim</button>
      <section className="client-booking-layout">
        <aside className="booking-side-panel">
          <div className="booking-side-poster">{getPoster(bookingMovie) ? <img src={getPoster(bookingMovie)} alt={bookingMovie.title} /> : <span>Chưa có ảnh</span>}</div>
          <h2>{normalizeClientText(bookingMovie.title)}</h2>
          <p>Suất chiếu: <strong>{showtimeLabel}</strong></p>
          <p>Rạp: <strong>{bookingTheater?.name || `Rạp #${bookingShowtime.theaterId}`}</strong></p>
          <p>Phòng: <strong>{roomName}</strong></p>
          <p className="booking-age">Giới hạn độ tuổi: <span>{rating}</span> - {getAgeDescription(rating)}</p>
          <div className="booking-side-summary">
            <p>🍿 Combo: <strong>{selectedComboText || "—"}</strong></p>
            <p>💺 Ghế: <strong>{selectedSeatCodes || "—"}</strong></p>
            <p>= Tổng Tiền: <strong>{formatMoney(bookingPayableTotal)}</strong></p>
            {selectedBookingSeats.length > 0 && (
              <div className={`booking-hold-timer ${bookingHoldSeconds <= 60 ? "danger" : ""}`}>
                <span>Thời gian giữ ghế</span><strong>{formatHoldTime(bookingHoldSeconds)}</strong>
              </div>
            )}
          </div>
        </aside>

        <section className="booking-step-panel">
          <div className="booking-step-tabs">
            <button className={bookingStep === 1 ? "active" : ""} type="button" onClick={() => setBookingStep(1)}>1. Chọn Ghế</button>
            <button className={bookingStep === 2 ? "active" : ""} type="button" onClick={() => selectedBookingSeats.length > 0 && setBookingStep(2)}>2. Chọn Combo</button>
            <button className={bookingStep === 3 ? "active" : ""} type="button" onClick={() => selectedBookingSeats.length > 0 && setBookingStep(3)} disabled={selectedBookingSeats.length === 0}>3. Thanh toán</button>
          </div>
          {bookingError && <div className="booking-error">{bookingError}</div>}

          {bookingStep === 1 ? (
            <div className="booking-seat-section">
              <h1>Chọn Ghế</h1><div className="booking-room-name">{roomName}</div>
              <div className="booking-seat-legend">
                <span><i className="standard" /> 85,000 đ</span><span><i className="vip" /> 105,000 đ</span>
                <span><i className="couple" /> 115,000 đ</span><span><i className="selected" /> Ghế đang chọn</span>
                <span><i className="sold" /> Ghế đã bán</span><span><i className="maintenance" /> Ghế bảo trì</span>
              </div>
              <div className="booking-screen">Màn hình</div>
              {bookingLoading ? <div className="schedule-empty">Đang tải sơ đồ ghế...</div> : bookingSeatRows.length === 0 ? (
                <div className="schedule-empty">Phòng này chưa có sơ đồ ghế.</div>
              ) : (
                <div className="client-seat-map">
                  {bookingSeatRows.map((row) => (
                    <div className="client-seat-row" key={row.row}>
                      {row.seats.map((seat) => {
                        const status = String(seat.status || "ACTIVE").toUpperCase();
                        const maintenance = status && status !== "ACTIVE";
                        const selected = selectedBookingSeats.some((item) => Number(item.id) === Number(seat.id));
                        const ownHeld = ownHeldSeatIds.has(String(seat.id));
                        const sold = bookedSeatIds.has(String(seat.id)) && !ownHeld && !selected;
                        const typeClass = String(seat.seatType || "STANDARD").toLowerCase();
                        return (
                          <button key={seat.id} type="button" className={`client-seat-cell ${typeClass} ${sold ? "sold" : ""} ${maintenance ? "maintenance" : ""} ${selected ? "selected" : ""}`} onClick={() => toggleBookingSeat(seat)} disabled={sold || maintenance} title={`${seat.seatCode} - ${formatMoney(seatPrice(seat))}`}>
                            {maintenance ? "X" : selected ? "✓" : seat.seatCode}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
              <div className="client-booking-actions"><button type="button" disabled={selectedBookingSeats.length === 0 || bookingLoading} onClick={() => setBookingStep(2)}>Tiếp theo</button></div>
            </div>
          ) : bookingStep === 2 ? (
            <div className="booking-combo-section">
              <h1>Chọn Combo</h1>
              {bookingLoading ? <div className="schedule-empty">Đang tải combo...</div> : bookingCombos.length === 0 ? <div className="schedule-empty">Chưa có combo đang bán.</div> : (
                <div className="client-combo-grid">{bookingCombos.map((combo) => (
                  <article className="client-combo-card" key={combo.id}>
                    <div className="combo-image">{combo.imageUrl ? <img src={combo.imageUrl} alt={combo.name} /> : <span>Chưa có ảnh</span>}</div>
                    <div className="combo-info">
                      <h2>{combo.name}</h2><p>{combo.description || "Combo bắp nước tại rạp"}</p><p>Giá: <strong>{formatMoney(combo.price)}</strong></p>
                      <div className="combo-quantity"><button type="button" onClick={() => updateBookingComboQuantity(combo.id, -1)}>−</button><input value={bookingComboQuantities[combo.id] || 0} readOnly /><button type="button" onClick={() => updateBookingComboQuantity(combo.id, 1)}>+</button></div>
                    </div>
                  </article>
                ))}</div>
              )}
              <div className="client-booking-actions"><button type="button" className="secondary" onClick={() => setBookingStep(1)}>Trở lại</button><button type="button" disabled={bookingLoading} onClick={() => setBookingStep(3)}>Tiếp theo</button></div>
            </div>
          ) : (
            <BookingPaymentStep
              bookingTicketTotal={bookingTicketTotal}
              bookingComboTotal={bookingComboTotal}
              bookingDiscountTotal={bookingDiscountTotal}
              bookingPayableTotal={bookingPayableTotal}
              promotionCode={promotionCode}
              setPromotionCode={setPromotionCode}
              appliedPromotion={appliedPromotion}
              promotionMessage={promotionMessage}
              bookingLoading={bookingLoading}
              bookingTotal={bookingTotal}
              handleApplyPromotion={handleApplyPromotion}
              clearPromotion={clearPromotion}
              selectedPaymentMethod={selectedPaymentMethod}
              setSelectedPaymentMethod={setSelectedPaymentMethod}
              setBookingStep={setBookingStep}
              submitClientBooking={submitClientBooking}
            />
          )}
        </section>
      </section>
    </main>
  );
}

export default ClientBookingView;
