import { useEffect, useState } from 'react';
import api from '../../utils/apiClient.js';

const emptyForm = { name: '', description: '', price: '', stock: '', image_url: '', category_id: '' };
const emptySpecs = [{ key: '', value: '' }];

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [specs, setSpecs] = useState(emptySpecs);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const load = async () => {
    const [p, c] = await Promise.all([api.get('/products', { params: { limit: 1000 } }), api.get('/categories')]);
    setProducts(p.data.products || []);
    setCategories(c.data);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    setUploading(true);
    try {
      const res = await api.post('/products/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm((f) => ({ ...f, image_url: res.data.image_url }));
    } catch (err) {
      alert(err.response?.data?.message || 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  };

    const handleSpecChange = (index, field, val) => {
    setSpecs((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: val } : s)));
  };

  const addSpecRow = () => setSpecs((prev) => [...prev, { key: '', value: '' }]);

  const removeSpecRow = (index) => setSpecs((prev) => prev.filter((_, i) => i !== index));

  const specsToObject = () => {
    const obj = {};
    specs.forEach((s) => { if (s.key.trim()) obj[s.key.trim()] = s.value; });
    return Object.keys(obj).length > 0 ? obj : null;
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setImporting(true);
    setImportResult(null);
    try {
      const res = await api.post('/products/import', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportResult(res.data);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Import thất bại');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, specifications: specsToObject() };
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setForm(emptyForm);
      setSpecs(emptySpecs);
      setEditingId(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (p) => {
    setForm({ ...p, price: p.price, stock: p.stock });
    setEditingId(p.id);
    if (p.specifications && typeof p.specifications === 'object') {
      const rows = Object.entries(p.specifications).map(([key, value]) => ({ key, value }));
      setSpecs(rows.length > 0 ? rows : emptySpecs);
    } else {
      setSpecs(emptySpecs);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    await api.delete(`/products/${id}`);
    load();
  };

  return (
    <div>
      <h2>Quản lý sản phẩm</h2>

      <div className="admin-form" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, marginBottom: 6 }}>Nhập hàng loạt từ Excel</h3>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          File cần có các cột: <code>name, description, price, stock, image_url, category</code>
          (cột <code>category</code> phải khớp đúng tên danh mục đã có)
        </p>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImportExcel} disabled={importing} />
        {importing && <p className="status-text">Đang nhập dữ liệu...</p>}
        {importResult && (
          <div style={{ marginTop: 10, fontSize: 13 }}>
            <p style={{ color: '#16a34a', fontWeight: 600 }}>{importResult.message}</p>
            {importResult.errors?.length > 0 && (
              <ul style={{ color: '#dc2626', paddingLeft: 18, marginTop: 4 }}>
                {importResult.errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <input placeholder="Tên sản phẩm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <textarea placeholder="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input type="number" placeholder="Giá" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        <input type="number" placeholder="Tồn kho" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required>
          <option value="">-- Chọn danh mục --</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <label>Ảnh (URL hoặc upload):</label>
        <input placeholder="URL ảnh" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
        {form.image_url && <img  alt="preview" style={{ width: 100 }} />}src={form.image_url.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL}${form.image_url}` : form.image_url}
                <label style={{ marginTop: 8 }}>Thông số kỹ thuật:</label>
        {specs.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 8 }}>
            <input
              placeholder="Tên thông số (VD: Kiểu kết nối)"
              value={s.key}
              onChange={(e) => handleSpecChange(i, 'key', e.target.value)}
              style={{ flex: 1 }}
            />
            <input
              placeholder="Giá trị (VD: Không dây)"
              value={s.value}
              onChange={(e) => handleSpecChange(i, 'value', e.target.value)}
              style={{ flex: 1 }}
            />
            {specs.length > 1 && (
              <button type="button" className="admin-btn-danger" onClick={() => removeSpecRow(i)}>✕</button>
            )}
          </div>
        ))}
        <button type="button" className="admin-btn-secondary" onClick={addSpecRow} style={{ width: 'fit-content' }}>
          + Thêm thông số
        </button>
        <div className="admin-form-actions">
          <button type="submit" className="admin-btn-primary">{editingId ? 'Cập nhật' : 'Thêm mới'}</button>
          {editingId && <button type="button" className="admin-btn-secondary" onClick={() => { setForm(emptyForm); setEditingId(null); }}>Hủy</button>}
        </div>
      </form>

      <table className="admin-table">
        <thead>
          <tr><th>Tên</th><th>Giá</th><th>Tồn kho</th><th>Danh mục</th><th>Hành động</th></tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{Number(p.price).toLocaleString()}đ</td>
              <td>{p.stock}</td>
              <td>{categories.find((c) => c.id === p.category_id)?.name || '-'}</td>
              <td>
                <button className="admin-btn-edit" onClick={() => handleEdit(p)}>Sửa</button>
                <button className="admin-btn-danger" onClick={() => handleDelete(p.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminProducts;