import { useEffect, useState } from "react";
import api from "../../utils/apiClient.js";

const emptyForm = { name: "", description: "", image_url: "" };

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const res = await api.get("/categories");
    setCategories(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
      } else {
        await api.post("/categories", form);
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleEdit = (c) => {
    setForm({
      name: c.name,
      description: c.description || "",
      image_url: c.image_url || "",
    });
    setEditingId(c.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa danh mục này? (sẽ lỗi nếu còn sản phẩm thuộc danh mục)"))
      return;
    try {
      await api.delete(`/categories/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa");
    }
  };

  return (
    <div>
      <h2>Quản lý danh mục</h2>

      <form onSubmit={handleSubmit} className="admin-form">
        <input
          placeholder="Tên danh mục"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <textarea
          placeholder="Mô tả"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          placeholder="URL ảnh"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
        />
        <div className="admin-form-actions">
          <button type="submit" className="admin-btn-primary">
            {editingId ? "Cập nhật" : "Thêm mới"}
          </button>
          {editingId && (
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => {
                setForm(emptyForm);
                setEditingId(null);
              }}
            >
              Hủy
            </button>
          )}
        </div>
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Tên</th>
            <th>Mô tả</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.description}</td>
              <td>
                <button
                  className="admin-btn-edit"
                  onClick={() => handleEdit(c)}
                >
                  Sửa
                </button>
                <button
                  className="admin-btn-danger"
                  onClick={() => handleDelete(c.id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminCategories;
