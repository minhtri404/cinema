const footerLinks = [
  {
    title: "HMCinema",
    links: [
      { label: "Phim đang chiếu", href: "#movies" },
      { label: "Lịch chiếu", href: "#schedule" },
      { label: "Tin tức / Sự kiện", href: "#news" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Điều khoản sử dụng", href: "#support" },
      { label: "Chính sách đặt vé", href: "#support" },
      { label: "Câu hỏi thường gặp", href: "#support" },
    ],
  },
];

function ClientFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="client-footer" id="support">
      <div className="footer-shell">
        <section className="footer-brand">
          <div className="footer-logo">
            <span>HM</span>
          </div>
          <div>
            <h2>HMCinema</h2>
            <p>
              Hệ thống rạp chiếu phim mang đến trải nghiệm đặt vé, chọn ghế,
              thanh toán và nhận vé điện tử nhanh chóng.
            </p>
          </div>
        </section>

        <nav className="footer-links" aria-label="Liên kết chân trang">
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3>{group.title}</h3>
              {group.links.map((link) => (
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </nav>

        <section className="footer-contact">
          <h3>Liên hệ / Hỗ trợ</h3>
          <ul>
            <li>
              <span>Hotline</span>
              <strong>1900 2026</strong>
            </li>
            <li>
              <span>Email</span>
              <strong>support@hmcinema.vn</strong>
            </li>
            <li>
              <span>Giờ hỗ trợ</span>
              <strong>08:00 - 22:00 mỗi ngày</strong>
            </li>
          </ul>
        </section>
      </div>

      <div className="footer-bottom">
        <p>© {currentYear} HMCinema. All rights reserved.</p>
        <div className="footer-socials" aria-label="Mạng xã hội">
          <a href="#support" aria-label="Facebook">
            f
          </a>
          <a href="#support" aria-label="Instagram">
            ig
          </a>
          <a href="#support" aria-label="YouTube">
            yt
          </a>
        </div>
      </div>
    </footer>
  );
}

export default ClientFooter;
