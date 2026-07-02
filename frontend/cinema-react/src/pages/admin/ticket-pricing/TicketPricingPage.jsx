import { useEffect, useState } from "react";
import AdminLayout from "../../../layouts/admin/AdminLayout";
import {
  getTicketPricing,
  getTicketSurcharges,
  updateTicketPricing,
  updateTicketSurcharge,
} from "../../../api/ticketPricingApi";
import "../../../styles/ticketPricing.css";

const dayLabels = {
  MON_THU: "Thứ 2, Thứ 3, Thứ 4, Thứ 5",
  FRI_SUN: "Thứ 6, Thứ 7, Chủ Nhật",
};

const timeLabels = {
  BEFORE_17H: "Trước 17h",
  AFTER_17H: "Sau 17h",
};

const surchargeLabels = {
  ROOM_3D: "3D",
  ROOM_4DX: "4DX",
  ROOM_IMAX: "IMAX",
  SEAT_VIP: "Ghế VIP",
  SEAT_COUPLE: "Ghế Couple",
};

function TicketPricingPage() {
  const [pricingList, setPricingList] = useState([]);
  const [surcharges, setSurcharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const [pricingRes, surchargeRes] = await Promise.all([
        getTicketPricing(),
        getTicketSurcharges(),
      ]);

      setPricingList(pricingRes.data || []);
      setSurcharges(surchargeRes.data || []);
    } catch (error) {
      console.error("Lỗi tải giá vé:", error);
      alert("Không tải được dữ liệu giá vé.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePricingChange = (id, field, value) => {
    setPricingList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: Number(value || 0),
            }
          : item
      )
    );
  };

  const handleSurchargeChange = (id, value) => {
    setSurcharges((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              amount: Number(value || 0),
            }
          : item
      )
    );
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);

      await Promise.all([
        ...pricingList.map((item) => updateTicketPricing(item.id, item)),
        ...surcharges.map((item) => updateTicketSurcharge(item.id, item)),
      ]);

      alert("Lưu giá vé thành công!");
      loadData();
    } catch (error) {
      console.error("Lỗi lưu giá vé:", error);
      alert("Lưu giá vé thất bại. Kiểm tra booking-service.");
    } finally {
      setSaving(false);
    }
  };

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString("vi-VN");
  };

  if (loading) {
    return (
      <AdminLayout>
        <section className="pricing-page">
          <div className="pricing-card">Đang tải dữ liệu giá vé...</div>
        </section>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <section className="pricing-page">
        <div className="pricing-card">
          <div className="pricing-header">
            <div>
              <span className="page-label">CINEMA MANAGEMENT</span>
              <h2>Quản lý giá vé</h2>
              <p>Cấu hình bảng giá theo ngày, khung giờ, nhóm khách và phụ thu.</p>
            </div>

            <button className="pricing-save-btn" onClick={handleSaveAll} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>

          <div className="pricing-table-wrap">
            <table className="pricing-table">
              <thead>
                <tr>
                  <th style={{ width: "210px" }}>Ngày áp dụng</th>
                  <th style={{ width: "130px" }}>Khung giờ</th>
                  <th>Học sinh, sinh viên</th>
                  <th>Người lớn</th>
                  <th>Người già, trẻ em</th>
                  <th>Thành viên, vé online</th>
                </tr>
              </thead>

              <tbody>
                {pricingList.map((item) => (
                  <tr key={item.id}>
                    <td className="pricing-day">{dayLabels[item.dayGroup] || item.dayGroup}</td>
                    <td>{timeLabels[item.timeSlot] || item.timeSlot}</td>

                    <td>
                      <div className="money-input">
                        <input
                          type="number"
                          value={item.studentPrice || 0}
                          onChange={(e) =>
                            handlePricingChange(item.id, "studentPrice", e.target.value)
                          }
                        />
                        <span>đ</span>
                      </div>
                    </td>

                    <td>
                      <div className="money-input">
                        <input
                          type="number"
                          value={item.adultPrice || 0}
                          onChange={(e) =>
                            handlePricingChange(item.id, "adultPrice", e.target.value)
                          }
                        />
                        <span>đ</span>
                      </div>
                    </td>

                    <td>
                      <div className="money-input">
                        <input
                          type="number"
                          value={item.childSeniorPrice || 0}
                          onChange={(e) =>
                            handlePricingChange(item.id, "childSeniorPrice", e.target.value)
                          }
                        />
                        <span>đ</span>
                      </div>
                    </td>

                    <td>
                      <div className="money-input">
                        <input
                          type="number"
                          value={item.memberOnlinePrice || 0}
                          onChange={(e) =>
                            handlePricingChange(item.id, "memberOnlinePrice", e.target.value)
                          }
                        />
                        <span>đ</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="surcharge-title">Phụ thu</div>

          <div className="surcharge-list">
            {surcharges.map((item) => (
              <div className="surcharge-row" key={item.id}>
                <div>
                  <strong>{surchargeLabels[item.surchargeKey] || item.surchargeName}</strong>
                  <p>{item.surchargeName}</p>
                </div>

                <div className="money-input surcharge-input">
                  <input
                    type="number"
                    value={item.amount || 0}
                    onChange={(e) => handleSurchargeChange(item.id, e.target.value)}
                  />
                  <span>đ</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pricing-preview">
            <h3>Xem nhanh mẫu giá</h3>
            <p>
              Ví dụ: Người lớn, Thứ 6–CN sau 17h, phòng IMAX, ghế VIP.
            </p>
            <strong>
              Tổng mẫu:{" "}
              {formatMoney(
                (pricingList.find(
                  (x) => x.dayGroup === "FRI_SUN" && x.timeSlot === "AFTER_17H"
                )?.adultPrice || 0) +
                  (surcharges.find((x) => x.surchargeKey === "ROOM_IMAX")?.amount || 0) +
                  (surcharges.find((x) => x.surchargeKey === "SEAT_VIP")?.amount || 0)
              )}
              đ
            </strong>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}

export default TicketPricingPage;
