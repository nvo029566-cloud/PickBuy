import { useEffect, useState } from 'react';
import api from '../../utils/apiClient.js';

const STATUS_LABELS = {
  pending: 'Chờ xử lý',
  processing: 'Đang chuẩn bị',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};
const STATUS_OPTIONS = Object.keys(STATUS_LABELS);

function formatPrice(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [detailOrder, setDetailOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await api.get('/orders/admin/all');
    setOrders(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const openDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/orders/admin/${id}`);
      setDetailOrder(res.data);
    } catch (err) {
      alert('Không thể tải chi tiết đơn hàng');
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) return <p className="status-text">Đang tải đơn hàng...</p>;

  const filtered = orders
    .filter((o) => filter === 'all' || o.status === filter)
    .filter((o) => {
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        String(o.id).includes(term) ||
        o.customer_name?.toLowerCase().includes(term) ||
        o.customer_email?.toLowerCase().includes(term)
      );
    });

  const statusCounts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  return (
    <div>
      <h2>Quản lý đơn hàng</h2>

      <div className="admin-orders-toolbar">
        <div className="admin-orders-tabs">
          <button className={`admin-orders-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            Tất cả <span>{orders.length}</span>
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              className={`admin-orders-tab ${filter === s ? 'active' : ''} status-tab-${s}`}
              onClick={() => setFilter(s)}
            >
              {STATUS_LABELS[s]} <span>{statusCounts[s]}</span>
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Tìm theo mã đơn, tên, email khách hàng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-orders-search"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="status-text">Không có đơn hàng nào khớp bộ lọc.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã ĐH</th>
              <th>Khách hàng</th>
              <th>Tổng tiền</th>
              <th>Địa chỉ giao hàng</th>
              <th>Trạng thái</th>
              <th>Ngày đặt</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id}>
                <td><strong>#{o.id}</strong></td>
                <td>
                  <div className="admin-order-customer">
                    <span className="admin-order-avatar">{o.customer_name?.charAt(0).toUpperCase()}</span>
                    <div>
                      <p>{o.customer_name}</p>
                      <small>{o.customer_email}</small>
                    </div>
                  </div>
                </td>
                <td className="admin-order-total">{formatPrice(o.total)}</td>
                <td className="admin-order-address" title={o.shipping_address}>{o.shipping_address}</td>
                <td>
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    className={`admin-status-select status-select-${o.status}`}
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </td>
                <td>{new Date(o.created_at).toLocaleDateString('vi-VN')}</td>
                <td>
                  <button className="admin-btn-edit" onClick={() => openDetail(o.id)}>Chi tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {(detailOrder || detailLoading) && (
        <div className="order-detail-overlay" onClick={() => setDetailOrder(null)}>
          <div className="order-detail-modal" onClick={(e) => e.stopPropagation()}>
            {detailLoading ? (
              <p className="status-text">Đang tải...</p>
            ) : (
              <>
                <div className="order-detail-header">
                  <h3>Chi tiết đơn hàng #{detailOrder.id}</h3>
                  <button onClick={() => setDetailOrder(null)}>✕</button>
                </div>
                <div className="order-detail-body">
                  <div className="order-detail-info-grid">
                    <div>
                      <label>Khách hàng</label>
                      <p>{detailOrder.customer_name}</p>
                    </div>
                    <div>
                      <label>Email</label>
                      <p>{detailOrder.customer_email}</p>
                    </div>
                    <div>
                      <label>Số điện thoại</label>
                      <p>{detailOrder.shipping_phone}</p>
                    </div>
                    <div>
                      <label>Ngày đặt</label>
                      <p>{new Date(detailOrder.created_at).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
                  <div className="order-detail-address-box">
                    <label>Địa chỉ giao hàng</label>
                    <p>{detailOrder.shipping_address}</p>
                  </div>

                  <label style={{ display: 'block', margin: '16px 0 8px', fontSize: 13, color: '#6b7280' }}>
                    Sản phẩm ({detailOrder.items?.length || 0})
                  </label>
                  <div className="order-detail-items">
                    {detailOrder.items?.map((item) => (
                      <div key={item.id} className="order-detail-item-row">
                        <img src={item.image_url} alt={item.name} />
                        <div className="order-detail-item-info">
                          <p>{item.name}</p>
                          <span>{formatPrice(item.price)} x {item.quantity}</span>
                        </div>
                        <strong>{formatPrice(item.price * item.quantity)}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="order-detail-total-row">
                    <span>Tổng tiền đơn hàng</span>
                    <strong>{formatPrice(detailOrder.total)}</strong>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;