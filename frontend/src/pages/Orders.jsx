import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import apiClient from '../utils/apiClient.js';

function formatPrice(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}

const statusLabels = {
  pending: 'Chờ xử lý',
  processing: 'Đang chuẩn bị hàng',
  shipping: 'Đang giao hàng',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const statusIcons = {
  pending: '⏳',
  processing: '📦',
  shipping: '🚚',
  completed: '✅',
  cancelled: '✕',
};

function Orders() {
  const { user } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);

  const loadOrders = () => {
    if (!user) return;
    apiClient
      .get('/orders')
      .then((res) => setOrders(res.data))
      .catch(() => setError('Không thể tải lịch sử đơn hàng.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    setCancellingId(orderId);
    try {
      await apiClient.put(`/orders/${orderId}/cancel`);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o)));
    } catch (err) {
      alert(err.response?.data?.message || 'Hủy đơn hàng thất bại');
    } finally {
      setCancellingId(null);
    }
  };

  if (!user) {
    return (
      <div className="status-text">
        <p>Bạn cần đăng nhập để xem lịch sử đơn hàng.</p>
        <Link to="/login" className="back-link">Đăng nhập ngay →</Link>
      </div>
    );
  }

  if (loading) return <p className="status-text">Đang tải...</p>;
  if (error) return <p className="status-text error">{error}</p>;

  const filterTabs = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ xử lý' },
    { key: 'processing', label: 'Đang chuẩn bị' },
    { key: 'shipping', label: 'Đang giao' },
    { key: 'completed', label: 'Hoàn thành' },
    { key: 'cancelled', label: 'Đã hủy' },
  ];

  const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="orders-page">
      <h2>Đơn hàng của tôi</h2>

      {location.state?.justOrderedId && (
        <div className="order-success-banner">
          ✓ Đặt hàng thành công! Mã đơn: #{location.state.justOrderedId}
        </div>
      )}

      <div className="orders-tabs">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            className={`orders-tab ${filter === tab.key ? 'active' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
            {tab.key !== 'all' && (
              <span className="orders-tab-count">
                {orders.filter((o) => o.status === tab.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <p className="status-text">Không có đơn hàng nào trong mục này.</p>
      ) : (
        <div className="order-list">
          {filteredOrders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-card-header">
                <div className="order-card-id">
                  {order.thumbnail ? (
                    <img src={order.thumbnail} alt={order.first_item_name || ''} className="order-thumbnail" />
                  ) : (
                    <span className="order-status-icon">{statusIcons[order.status] || '📄'}</span>
                  )}
                  <div>
                    <strong>
                      {order.first_item_name || `Đơn hàng #${order.id}`}
                      {order.item_count > 1 && ` và ${order.item_count - 1} sản phẩm khác`}
                    </strong>
                    <p className="order-card-date">
                      #{order.id} · Ngày đặt: {new Date(order.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <span className={`order-status status-${order.status}`}>
                  {statusLabels[order.status] || order.status}
                </span>
              </div>

              <div className="order-card-body">
                <p className="order-card-address">
                  📍 {order.shipping_address}
                </p>
              </div>

              <div className="order-card-footer">
                <p className="order-card-total">
                  Tổng tiền: <strong>{formatPrice(order.total)}</strong>
                </p>
                {order.status === 'pending' && (
                  <button
                    className="order-cancel-btn"
                    onClick={() => handleCancelOrder(order.id)}
                    disabled={cancellingId === order.id}
                  >
                    {cancellingId === order.id ? 'Đang hủy...' : 'Hủy đơn hàng'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;