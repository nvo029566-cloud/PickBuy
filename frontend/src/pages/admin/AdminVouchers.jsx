import { useEffect, useState } from "react";
import api from "../../utils/apiClient.js";

const emptyForm = {
  code: "",
  discount_percent: "",
  max_discount: "",
  min_order: "",
  usage_limit: "",
  expires_at: "",
};

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function AdminVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/vouchers");
      setVouchers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        code: form.code.trim(),
        discount_percent: Number(form.discount_percent),
        max_discount: form.max_discount ? Number(form.max_discount) : null,
        min_order: form.min_order ? Number(form.min_order) : 0,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        expires_at: form.expires_at || null,
      };

      if (editingId) {
        await api.put(`/vouchers/${editingId}`, payload);
      } else {
        await api.post("/vouchers", payload);
      }

      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Lưu voucher thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (v) => {
    setForm({
      code: v.code,
      discount_percent: v.discount_percent,
      max_discount: v.max_discount || "",
      min_order: v.min_order || "",
      usage_limit: v.usage_limit ?? "",
      expires_at: v.expires_at ? v.expires_at.slice(0, 10) : "",
    });
    setEditingId(v.id);
    setError("");
  };

  const handleCancelEdit = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa voucher này?")) return;
    try {
      await api.delete(`/vouchers/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa");
    }
  };

  const isExpired = (v) => v.expires_at && new Date(v.expires_at) < new Date();
  const isUsedUp = (v) =>
    v.usage_limit !== null && v.used_count >= v.usage_limit;

  return (
    <div>
      <h2>Quản lý mã giảm giá (Voucher)</h2>

      <form onSubmit={handleSubmit} className="admin-form">
        <input
          placeholder="Mã voucher (VD: SALE20)"
          value={form.code}
          onChange={(e) =>
            setForm({ ...form, code: e.target.value.toUpperCase() })
          }
          required
        />
        <input
          type="number"
          placeholder="% giảm giá (VD: 10)"
          value={form.discount_percent}
          onChange={(e) =>
            setForm({ ...form, discount_percent: e.target.value })
          }
          min="1"
          max="100"
          required
        />
        <input
          type="number"
          placeholder="Giảm tối đa (đ, để trống = không giới hạn)"
          value={form.max_discount}
          onChange={(e) => setForm({ ...form, max_discount: e.target.value })}
        />
        <input
          type="number"
          placeholder="Đơn tối thiểu để dùng mã (đ)"
          value={form.min_order}
          onChange={(e) => setForm({ ...form, min_order: e.target.value })}
        />
        <input
          type="number"
          placeholder="Giới hạn lượt dùng (để trống = không giới hạn)"
          value={form.usage_limit}
          onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
        />
        <label style={{ fontSize: 13, color: "#666" }}>
          Ngày hết hạn (để trống = không hết hạn)
        </label>
        <input
          type="date"
          value={form.expires_at}
          onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
        />

        {error && <p className="status-text error">{error}</p>}

        <div className="admin-form-actions">
          <button
            type="submit"
            className="admin-btn-primary"
            disabled={submitting}
          >
            {submitting
              ? "Đang lưu..."
              : editingId
                ? "Cập nhật voucher"
                : "Tạo voucher"}
          </button>
          {editingId && (
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={handleCancelEdit}
            >
              Hủy
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="status-text">Đang tải danh sách voucher...</p>
      ) : vouchers.length === 0 ? (
        <p className="status-text">Chưa có voucher nào.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>% Giảm</th>
              <th>Giảm tối đa</th>
              <th>Đơn tối thiểu</th>
              <th>Đã dùng</th>
              <th>Hết hạn</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((v) => (
              <tr key={v.id}>
                <td>
                  <strong>{v.code}</strong>
                </td>
                <td>{v.discount_percent}%</td>
                <td>{v.max_discount ? formatPrice(v.max_discount) : "-"}</td>
                <td>{formatPrice(v.min_order)}</td>
                <td>
                  {v.used_count} / {v.usage_limit ?? "∞"}
                </td>
                <td>
                  {v.expires_at
                    ? new Date(v.expires_at).toLocaleDateString("vi-VN")
                    : "Không giới hạn"}
                </td>
                <td>
                  {isExpired(v) ? (
                    <span style={{ color: "red" }}>Đã hết hạn</span>
                  ) : isUsedUp(v) ? (
                    <span style={{ color: "orange" }}>Hết lượt dùng</span>
                  ) : (
                    <span style={{ color: "green" }}>Còn hiệu lực</span>
                  )}
                </td>
                <td>
                  <button
                    className="admin-btn-edit"
                    onClick={() => handleEdit(v)}
                  >
                    Sửa
                  </button>
                  <button
                    className="admin-btn-danger"
                    onClick={() => handleDelete(v.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminVouchers;
