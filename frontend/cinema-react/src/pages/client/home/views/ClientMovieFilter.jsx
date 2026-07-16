function ClientMovieFilter({ controller }) {
  const {
    applyMovieFilters,
    availableGenres,
    availableReleaseYears,
    closeFilterPanel,
    draftFilters,
    filterOpen,
    resetMovieFilters,
    toggleDraftGenre,
    updateDraftFilter,
  } = controller;

  return (
    <div className={`movie-filter-overlay ${filterOpen ? "open" : ""}`} aria-hidden={!filterOpen}>
      <button type="button" className="movie-filter-backdrop" aria-label="Đóng bộ lọc" onClick={closeFilterPanel} />
      <aside className="movie-filter-drawer" aria-label="Bộ lọc phim">
        <div className="filter-drawer-head">
          <h2>Bộ lọc</h2>
          <button type="button" onClick={closeFilterPanel} aria-label="Đóng">×</button>
        </div>
        <form onSubmit={applyMovieFilters}>
          <label className="filter-field"><span>Diễn viên</span><input value={draftFilters.actor} onChange={(event) => updateDraftFilter("actor", event.target.value)} placeholder="Nhập tên diễn viên" /></label>
          <label className="filter-field"><span>Đạo diễn</span><input value={draftFilters.director} onChange={(event) => updateDraftFilter("director", event.target.value)} placeholder="Nhập tên đạo diễn" /></label>
          <fieldset className="filter-field filter-genres">
            <legend>Thể loại</legend>
            <div>
              {availableGenres.map((genre) => (
                <label key={genre}><input type="checkbox" checked={draftFilters.genres.includes(genre)} onChange={() => toggleDraftGenre(genre)} /><span>{genre}</span></label>
              ))}
            </div>
          </fieldset>
          <label className="filter-field">
            <span>Năm phát hành</span>
            <select value={draftFilters.releaseYear} onChange={(event) => updateDraftFilter("releaseYear", event.target.value)}>
              <option value="">Tất cả các năm</option>
              {availableReleaseYears.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>
          <label className="filter-field">
            <span>Giới hạn độ tuổi</span>
            <select value={draftFilters.ageRating} onChange={(event) => updateDraftFilter("ageRating", event.target.value)}>
              <option value="">Tất cả</option><option value="P">P</option><option value="K">K</option><option value="T13">T13 / C13</option><option value="T16">T16 / C16</option><option value="T18">T18 / C18</option>
            </select>
          </label>
          <div className="filter-actions">
            <button type="button" className="secondary" onClick={resetMovieFilters}>Đặt lại</button>
            <button type="submit">Áp dụng bộ lọc</button>
          </div>
        </form>
      </aside>
    </div>
  );
}

export default ClientMovieFilter;
