function ClientContactView() {
  return (
    <main className="client-route-main contact-route">
      <header className="client-page-intro dark">
        <span>HMCinema / Hỗ trợ</span>
        <h1>Liên hệ</h1>
        <p>Đội ngũ HMCinema luôn sẵn sàng hỗ trợ hành trình xem phim của bạn.</p>
      </header>
      <section className="client-contact-grid">
        <article><span>01</span><h2>Hotline</h2><a href="tel:19002026">1900 2026</a><p>Hỗ trợ mỗi ngày từ 08:00 đến 22:00.</p></article>
        <article><span>02</span><h2>Email</h2><a href="mailto:support@hmcinema.vn">support@hmcinema.vn</a><p>Phản hồi yêu cầu trong vòng 24 giờ làm việc.</p></article>
        <article><span>03</span><h2>Tại rạp</h2><strong>Quầy chăm sóc khách hàng</strong><p>Liên hệ trực tiếp nhân viên tại cụm rạp gần bạn.</p></article>
      </section>
    </main>
  );
}

export default ClientContactView;
