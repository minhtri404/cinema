import ClientNewsEventsSection from "../components/ClientNewsEventsSection";

function ClientOffersView() {
  return (
    <main className="client-route-main offers-route">
      <header className="client-page-intro">
        <span>HMCinema / Cập nhật</span>
        <h1>Ưu đãi & tin tức</h1>
        <p>Tổng hợp chương trình thành viên, sự kiện và những tin tức mới nhất từ HMCinema.</p>
      </header>
      <ClientNewsEventsSection />
    </main>
  );
}

export default ClientOffersView;
