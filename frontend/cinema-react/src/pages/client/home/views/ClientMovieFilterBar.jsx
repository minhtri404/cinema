function ClientMovieFilterBar({ controller }) {
  const {
    activeFilterCount,
    applyMovieFilters,
    availableGenres,
    availableReleaseYears,
    draftFilters,
    openFilterPanel,
    resetMovieFilters,
    setDraftGenre,
    updateDraftFilter,
  } = controller;

  return (
    <form className="movie-filter-bar" onSubmit={applyMovieFilters}>
      <div className="movie-filter-bar-head">
        <div>
          <span>Bộ lọc nhanh</span>
          <strong>Tìm phim theo thông tin bạn muốn</strong>
        </div>
        {activeFilterCount > 0 && <small>{activeFilterCount} bộ lọc đang áp dụng</small>}
      </div>

      <div className="movie-filter-fields">
        <label>
          <span>Thể loại</span>
          <select value={draftFilters.genres[0] || ""} onChange={(event) => setDraftGenre(event.target.value)}>
            <option value="">Tất cả thể loại</option>
            {availableGenres.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
          </select>
        </label>
        <label>
          <span>Năm phát hành</span>
          <select value={draftFilters.releaseYear} onChange={(event) => updateDraftFilter("releaseYear", event.target.value)}>
            <option value="">Tất cả các năm</option>
            {availableReleaseYears.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </label>
        <label>
          <span>Giới hạn độ tuổi</span>
          <select value={draftFilters.ageRating} onChange={(event) => updateDraftFilter("ageRating", event.target.value)}>
            <option value="">Mọi độ tuổi</option>
            <option value="P">P</option>
            <option value="K">K</option>
            <option value="T13">T13 / C13</option>
            <option value="T16">T16 / C16</option>
            <option value="T18">T18 / C18</option>
          </select>
        </label>
        <label>
          <span>Đạo diễn</span>
          <input value={draftFilters.director} onChange={(event) => updateDraftFilter("director", event.target.value)} placeholder="Tên đạo diễn" />
        </label>
        <label>
          <span>Diễn viên</span>
          <input value={draftFilters.actor} onChange={(event) => updateDraftFilter("actor", event.target.value)} placeholder="Tên diễn viên" />
        </label>
      </div>

      <div className="movie-filter-bar-actions">
        <button type="button" className="advanced" onClick={openFilterPanel}>Bộ lọc nâng cao</button>
        <button type="button" className="reset" onClick={resetMovieFilters}>Xóa lọc</button>
        <button type="submit" className="submit"><span aria-hidden="true">⌕</span> Lọc phim</button>
      </div>
    </form>
  );
}

export default ClientMovieFilterBar;
