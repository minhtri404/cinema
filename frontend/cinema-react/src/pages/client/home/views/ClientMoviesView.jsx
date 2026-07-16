import ClientMovieCard from "../components/ClientMovieCard";
import Pagination from "../../../../components/common/Pagination";
import usePagination from "../../../../hooks/usePagination";
import ClientMovieFilterBar from "./ClientMovieFilterBar";

function ClientMoviesView({ controller }) {
  const {
    activeTab,
    filteredMovies,
    openMovieDetail,
    setActiveTab,
  } = controller;
  const pagination = usePagination(filteredMovies, 8);

  return (
    <main className="client-route-main">
      <header className="client-page-intro">
        <span>HMCinema / Danh mục</span>
        <h1>Khám phá phim</h1>
        <p>Tìm bộ phim phù hợp theo trạng thái phát hành, thể loại, diễn viên hoặc giới hạn độ tuổi.</p>
      </header>

      <section className="client-movies route-movies">
        <div className="movie-tabs">
          <button type="button" className={activeTab === "all" ? "active" : ""} onClick={() => setActiveTab("all")}>Tất cả phim</button>
          <button type="button" className={activeTab === "now" ? "active" : ""} onClick={() => setActiveTab("now")}>Phim đang chiếu</button>
          <button type="button" className={activeTab === "coming" ? "active" : ""} onClick={() => setActiveTab("coming")}>Phim sắp chiếu</button>
          <button type="button" className={activeTab === "advance" ? "active" : ""} onClick={() => setActiveTab("advance")}>Vé bán trước</button>
        </div>
        <ClientMovieFilterBar controller={controller} />
        <div className="client-movie-grid">
          {filteredMovies.length === 0 ? <div className="movie-filter-empty">Không có phim phù hợp với bộ lọc hiện tại.</div> : pagination.paginatedItems.map((movie) => (
            <ClientMovieCard key={movie.id} movie={movie} onOpen={openMovieDetail} />
          ))}
        </div>
        <Pagination {...pagination} />
      </section>
    </main>
  );
}

export default ClientMoviesView;
