import { useEffect, useMemo, useState } from "react";
import Pagination from "../../../components/common/Pagination";
import usePagination from "../../../hooks/usePagination";
import { Link } from "react-router-dom";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AdminLayout from "../../../layouts/admin/AdminLayout";
import { deleteGenre, getGenres } from "../../../api/genreApi";
import "../../../styles/genre.css";

function GenreListPage() {
  const [genres, setGenres] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  const loadGenres = async () => {
    try {
      setLoading(true);
      const res = await getGenres();
      setGenres(res.data || []);
    } catch (error) {
      console.error("Lỗi tải thể loại:", error);
      alert("Không tải được danh sách thể loại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getGenres()
      .then((res) => {
        if (active) setGenres(res.data || []);
      })
      .catch((error) => {
        console.error("Lỗi tải thể loại:", error);
        if (active) alert("Không tải được danh sách thể loại.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredGenres = useMemo(() => {
    const value = keyword.toLowerCase().trim();

    if (!value) return genres;

    return genres.filter((genre) => {
      return (
        genre.name?.toLowerCase().includes(value) ||
        genre.description?.toLowerCase().includes(value)
      );
    });
  }, [genres, keyword]);
  const pagination = usePagination(filteredGenres, 10);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa thể loại này?");

    if (!confirmDelete) return;

    try {
      await deleteGenre(id);
      alert("Xóa thể loại thành công!");
      loadGenres();
    } catch (error) {
      console.error("Lỗi xóa thể loại:", error);
      alert("Xóa thất bại. Có thể thể loại đang được phim sử dụng.");
    }
  };

  return (
    <AdminLayout>
      <section className="genre-page">
        <div className="genre-card">
          <div className="genre-header">
            <div>
              <span className="page-label">QUẢN LÝ RẠP CHIẾU PHIM</span>
              <h2>Thể loại phim</h2>
              <p>Quản lý danh sách thể loại dùng cho phim trong hệ thống.</p>
            </div>

            <Link to="/admin/genres/create" className="genre-add-btn">
              + Thêm thể loại
            </Link>
          </div>

          <div className="genre-toolbar">
            <input
              className="genre-search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên hoặc mô tả..."
            />
          </div>

          {loading ? (
            <div className="genre-empty">Đang tải dữ liệu...</div>
          ) : (
            <div className="genre-table-wrap">
              <table className="genre-table">
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>Mã</th>
                  <th>Tên thể loại</th>
                  <th>Mô tả</th>
                  <th style={{ width: "140px" }}>Trạng thái</th>
                  <th style={{ width: "120px" }}>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredGenres.length > 0 ? (
                  pagination.paginatedItems.map((genre) => (
                    <tr key={genre.id}>
                      <td>{genre.id}</td>
                      <td>
                        <span className="genre-name">{genre.name}</span>
                      </td>
                      <td>
                        <span className="genre-desc">
                          {genre.description || "Chưa có mô tả"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`genre-status ${
                            genre.active ? "active" : "inactive"
                          }`}
                        >
                          {genre.active ? "Đang dùng" : "Ẩn"}
                        </span>
                      </td>
                      <td>
                        <div className="genre-actions">
                          <Link
                            to={`/admin/genres/edit/${genre.id}`}
                            className="genre-icon-btn"
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </Link>

                          <button
                            className="genre-icon-btn danger"
                            onClick={() => handleDelete(genre.id)}
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="genre-empty">
                      Không có thể loại phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
              <Pagination {...pagination} />
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}

export default GenreListPage;
