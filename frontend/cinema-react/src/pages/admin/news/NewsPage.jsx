import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FormatBoldRoundedIcon from "@mui/icons-material/FormatBoldRounded";
import FormatItalicRoundedIcon from "@mui/icons-material/FormatItalicRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import FormatListNumberedRoundedIcon from "@mui/icons-material/FormatListNumberedRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useEffect, useMemo, useRef, useState } from "react";
import Pagination from "../../../components/common/Pagination";
import usePagination from "../../../hooks/usePagination";
import {
  createNews,
  deleteNews,
  getNews,
  updateNews,
  uploadNewsImage,
} from "../../../api/newsApi";
import { cleanupMediaByUrl } from "../../../api/mediaApi";
import "../../../styles/news.css";
import { publicationStatusLabel } from "../../../utils/displayLabels";

const currentStaff = () => {
  try {
    return JSON.parse(localStorage.getItem("auth"))?.fullName || "Admin Cinema";
  } catch {
    return "Admin Cinema";
  }
};

const emptyForm = () => ({
  title: "",
  imageUrl: "",
  content: "",
  status: "ONLINE",
  staffName: currentStaff(),
});

const errorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  return data?.message || fallback;
};

const plainText = (html) => {
  if (!html) return "—";
  const element = document.createElement("div");
  element.innerHTML = html;
  return element.textContent || element.innerText || "—";
};

const formatDateTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("vi-VN");
};

function NewsPage() {
  const editorRef = useRef(null);
  const [articles, setArticles] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const loadNews = async () => {
    try {
      setLoading(true);
      const response = await getNews();
      setArticles(response.data || []);
    } catch (error) {
      console.error("Lỗi tải tin tức:", error);
      alert(errorMessage(error, "Không tải được danh sách tin tức."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getNews()
      .then((response) => {
        if (active) setArticles(response.data || []);
      })
      .catch((error) => {
        console.error("Lỗi tải tin tức:", error);
        if (active) alert(errorMessage(error, "Không tải được danh sách tin tức."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!modalOpen || !editorRef.current) return;
    editorRef.current.innerHTML = editingArticle?.content || "";
  }, [modalOpen, editingArticle]);

  const filteredArticles = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    return articles.filter((article) => {
      const matchesKeyword =
        !value ||
        [article.title, plainText(article.content), article.staffName]
          .filter(Boolean)
          .some((item) => item.toLowerCase().includes(value));
      return matchesKeyword && (!statusFilter || article.status === statusFilter);
    });
  }, [articles, keyword, statusFilter]);
  const pagination = usePagination(filteredArticles, 10);

  const resetImage = () => {
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl("");
  };

  const openCreate = () => {
    resetImage();
    setEditingArticle(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (article) => {
    resetImage();
    setEditingArticle(article);
    setForm({
      title: article.title || "",
      imageUrl: article.imageUrl || "",
      content: article.content || "",
      status: article.status || "ONLINE",
      staffName: article.staffName || currentStaff(),
    });
    setPreviewUrl(article.imageUrl || "");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    resetImage();
    setEditingArticle(null);
    setForm(emptyForm());
    setModalOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (name === "imageUrl" && !imageFile) setPreviewUrl(value);
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh không được vượt quá 5MB.");
      event.target.value = "";
      return;
    }
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const syncEditor = () => {
    setForm((current) => ({
      ...current,
      content: editorRef.current?.innerHTML || "",
    }));
  };

  const formatContent = (command, value = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncEditor();
  };

  const addLink = () => {
    const url = window.prompt("Nhập địa chỉ liên kết:");
    if (url) formatContent("createLink", url);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const previousImageUrl = editingArticle?.imageUrl || "";
    let uploadedImageUrl = "";

    try {
      setSaving(true);
      let imageUrl = form.imageUrl;
      if (imageFile) {
        const uploadResponse = await uploadNewsImage(imageFile);
        imageUrl = uploadResponse.data?.url || "";
        uploadedImageUrl = imageUrl;
      }

      const payload = {
        ...form,
        content: editorRef.current?.innerHTML || form.content,
        imageUrl,
      };

      if (editingArticle) {
        await updateNews(editingArticle.id, payload);
        if (previousImageUrl && previousImageUrl !== imageUrl) {
          await cleanupMediaByUrl(previousImageUrl);
        }
        alert("Cập nhật tin tức thành công.");
      } else {
        await createNews(payload);
        alert("Thêm tin tức thành công.");
      }

      resetImage();
      setModalOpen(false);
      setEditingArticle(null);
      await loadNews();
    } catch (error) {
      if (uploadedImageUrl) await cleanupMediaByUrl(uploadedImageUrl);
      console.error("Lỗi lưu tin tức:", error);
      alert(errorMessage(error, "Lưu tin tức thất bại."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (article) => {
    if (!window.confirm(`Xóa tin tức "${article.title}"?`)) return;
    try {
      await deleteNews(article.id);
      await cleanupMediaByUrl(article.imageUrl);
      setArticles((current) => current.filter((item) => item.id !== article.id));
      alert("Xóa tin tức thành công.");
    } catch (error) {
      alert(errorMessage(error, "Xóa tin tức thất bại."));
    }
  };

  return (
    <>
      <section className="news-page">
        <div className="news-card">
          <header className="news-header">
            <div>
              <span className="page-label">QUẢN LÝ RẠP CHIẾU PHIM</span>
              <h2>Tin tức</h2>
              <p>Quản lý bài viết và thông tin truyền thông của rạp.</p>
            </div>
            <button type="button" onClick={openCreate}>
              <AddRoundedIcon fontSize="small" />
              Thêm tin tức
            </button>
          </header>

          <div className="news-toolbar">
            <label className="news-search">
              <SearchRoundedIcon fontSize="small" />
              <input
                type="search"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm tiêu đề, nội dung, nhân viên..."
              />
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ONLINE">Đang hiển thị</option>
              <option value="OFFLINE">Đang ẩn</option>
            </select>
          </div>

          <div className="news-table-wrap">
            <table className="news-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Hình ảnh</th>
                  <th>Nội dung</th>
                  <th>Trạng thái</th>
                  <th>Nhân viên</th>
                  <th>Ngày tạo</th>
                  <th>Ngày cập nhật</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" className="news-empty">Đang tải dữ liệu...</td></tr>
                ) : filteredArticles.length === 0 ? (
                  <tr><td colSpan="8" className="news-empty">Chưa có tin tức phù hợp.</td></tr>
                ) : (
                  pagination.paginatedItems.map((article) => (
                    <tr key={article.id}>
                      <td className="news-title-cell">{article.title}</td>
                      <td>
                        {article.imageUrl ? (
                          <img
                            className="news-image"
                            src={article.imageUrl}
                            alt={article.title}
                            onError={(event) => {
                              event.currentTarget.hidden = true;
                            }}
                          />
                        ) : (
                          <div className="news-no-image"><ImageOutlinedIcon /></div>
                        )}
                      </td>
                      <td><p className="news-content-preview">{plainText(article.content)}</p></td>
                      <td>
                        <span className={`news-status ${article.status?.toLowerCase()}`}>
                          {publicationStatusLabel(article.status)}
                        </span>
                      </td>
                      <td>{article.staffName || "—"}</td>
                      <td className="news-date">{formatDateTime(article.createdAt)}</td>
                      <td className="news-date">{formatDateTime(article.updatedAt)}</td>
                      <td>
                        <div className="news-actions">
                          <button type="button" onClick={() => openEdit(article)} title="Sửa">
                            <EditOutlinedIcon fontSize="small" />
                          </button>
                          <button
                            type="button"
                            className="danger"
                            onClick={() => handleDelete(article)}
                            title="Xóa"
                          >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <Pagination {...pagination} />
          </div>
        </div>
      </section>

      {modalOpen && (
        <div className="news-modal-overlay" onMouseDown={closeModal}>
          <div className="news-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="news-modal-header">
              <div>
                <h3>{editingArticle ? "Sửa tin tức" : "Thêm tin tức"}</h3>
                <p>Soạn nội dung bài viết và chọn ảnh đại diện.</p>
              </div>
              <button type="button" onClick={closeModal} aria-label="Đóng">×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="news-form">
                <label>
                  <span>Tiêu đề *</span>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Nhập tiêu đề tin tức"
                    required
                  />
                </label>

                <div className="news-image-field">
                  <div>
                    <span>Hình ảnh</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                    />
                    <input
                      name="imageUrl"
                      value={form.imageUrl}
                      onChange={handleChange}
                      placeholder="Hoặc dán đường dẫn ảnh"
                    />
                  </div>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Xem trước" />
                  ) : (
                    <div className="news-preview-empty"><ImageOutlinedIcon /></div>
                  )}
                </div>

                <div className="news-editor-field">
                  <span>Nội dung</span>
                  <div className="news-editor-toolbar">
                    <button type="button" onClick={() => formatContent("bold")} title="In đậm">
                      <FormatBoldRoundedIcon fontSize="small" />
                    </button>
                    <button type="button" onClick={() => formatContent("italic")} title="In nghiêng">
                      <FormatItalicRoundedIcon fontSize="small" />
                    </button>
                    <button type="button" onClick={() => formatContent("insertUnorderedList")} title="Danh sách">
                      <FormatListBulletedRoundedIcon fontSize="small" />
                    </button>
                    <button type="button" onClick={() => formatContent("insertOrderedList")} title="Danh sách số">
                      <FormatListNumberedRoundedIcon fontSize="small" />
                    </button>
                    <button type="button" onClick={addLink} title="Liên kết">
                      <LinkRoundedIcon fontSize="small" />
                    </button>
                    <select
                      defaultValue="p"
                      onChange={(event) => formatContent("formatBlock", event.target.value)}
                      aria-label="Kiểu đoạn văn"
                    >
                      <option value="p">Đoạn văn</option>
                      <option value="h2">Tiêu đề lớn</option>
                      <option value="h3">Tiêu đề nhỏ</option>
                      <option value="blockquote">Trích dẫn</option>
                    </select>
                  </div>
                  <div
                    ref={editorRef}
                    className="news-editor"
                    contentEditable
                    suppressContentEditableWarning
                    onInput={syncEditor}
                    data-placeholder="Nhập nội dung bài viết..."
                  />
                </div>

                <div className="news-form-row">
                  <label>
                    <span>Trạng thái</span>
                    <select name="status" value={form.status} onChange={handleChange}>
                      <option value="ONLINE">Đang hiển thị</option>
                      <option value="OFFLINE">Đang ẩn</option>
                    </select>
                  </label>
                  <label>
                    <span>Nhân viên</span>
                    <input
                      name="staffName"
                      value={form.staffName}
                      onChange={handleChange}
                    />
                  </label>
                </div>
              </div>

              <div className="news-modal-actions">
                <button type="button" className="secondary" onClick={closeModal}>Hủy</button>
                <button type="submit" className="primary" disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu tin tức"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default NewsPage;
