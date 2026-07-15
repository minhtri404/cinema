import { formatMoney } from "../clientHomeUtils";

function BookingPaymentStep({
  bookingTicketTotal,
  bookingComboTotal,
  bookingDiscountTotal,
  bookingPayableTotal,
  promotionCode,
  setPromotionCode,
  appliedPromotion,
  promotionMessage,
  bookingLoading,
  bookingTotal,
  handleApplyPromotion,
  clearPromotion,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  setBookingStep,
  submitClientBooking,
}) {
  return (
    <div className="booking-payment-section">
      <h1>Thanh toán</h1>

      <div className="client-promotion-box">
        <h2>Mã khuyến mãi</h2>
        <div className="client-promotion-input-row">
          <input
            placeholder="Nhập mã khuyến mãi"
            value={promotionCode}
            onChange={(event) => setPromotionCode(event.target.value)}
            disabled={Boolean(appliedPromotion) || bookingLoading}
          />
          {appliedPromotion ? (
            <button type="button" className="danger" onClick={clearPromotion} disabled={bookingLoading}>
              Hủy áp dụng
            </button>
          ) : (
            <button type="button" onClick={handleApplyPromotion} disabled={bookingLoading || !bookingTotal}>
              Áp dụng
            </button>
          )}
        </div>
        {promotionMessage && (
          <p className={appliedPromotion ? "promotion-success" : "promotion-error"}>{promotionMessage}</p>
        )}
      </div>

      <div className="client-payment-card">
        <h2>Tạm tính</h2>
        <p>
          <span>Tiền vé</span>
          <strong>{formatMoney(bookingTicketTotal)}</strong>
        </p>
        <p>
          <span>Combo / bắp nước</span>
          <strong>{formatMoney(bookingComboTotal)}</strong>
        </p>
        {bookingDiscountTotal > 0 && (
          <p>
            <span>Giảm giá</span>
            <strong>-{formatMoney(bookingDiscountTotal)}</strong>
          </p>
        )}
        <p className="total">
          <span>Cần thanh toán</span>
          <strong>{formatMoney(bookingPayableTotal)}</strong>
        </p>
      </div>

      <div className="client-payment-methods">
        <h2>Thanh toán</h2>
        <label className={selectedPaymentMethod === "VNPAY" ? "active" : ""}>
          <input
            type="radio"
            name="client-payment-method"
            value="VNPAY"
            checked={selectedPaymentMethod === "VNPAY"}
            onChange={(event) => setSelectedPaymentMethod(event.target.value)}
          />
          Thanh toán bằng ứng dụng hỗ trợ VNPAY QR
        </label>
        <label className={selectedPaymentMethod === "ATM" ? "active" : ""}>
          <input
            type="radio"
            name="client-payment-method"
            value="ATM"
            checked={selectedPaymentMethod === "ATM"}
            onChange={(event) => setSelectedPaymentMethod(event.target.value)}
          />
          Thanh toán qua thẻ ATM/Tài khoản nội địa
        </label>
        <label className={selectedPaymentMethod === "INTL" ? "active" : ""}>
          <input
            type="radio"
            name="client-payment-method"
            value="INTL"
            checked={selectedPaymentMethod === "INTL"}
            onChange={(event) => setSelectedPaymentMethod(event.target.value)}
          />
          Thanh toán qua thẻ quốc tế
        </label>
      </div>

      <div className="client-payment-note">
        Sau khi bấm đặt vé, hệ thống sẽ chuyển sang VNPAY sandbox để thanh toán thử nghiệm.
      </div>

      <div className="client-booking-actions">
        <button type="button" className="secondary" onClick={() => setBookingStep(2)} disabled={bookingLoading}>
          Trở lại
        </button>
        <button type="button" className="primary" onClick={submitClientBooking} disabled={bookingLoading || !bookingTotal}>
          {bookingLoading ? "Đang xử lý..." : "Đặt vé"}
        </button>
      </div>
    </div>
  );
}

export default BookingPaymentStep;
