import { useEffect, useState } from 'react';
import api from '../../utils/apiClient.js';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [products, categories, orders, users] = await Promise.all([
          api.get('/products', { params: { limit: 1000 } }),
          api.get('/categories'),
          api.get('/orders/admin/all'),
          api.get('/users'),
        ]);

        const productList = products.data.products || [];

        const revenue = orders.data
          .filter((o) => o.status === 'completed')
          .reduce((sum, o) => sum + Number(o.total), 0);

        const pendingOrders = orders.data.filter((o) => o.status === 'pending').length;
        const lowStock = productList.filter((p) => p.stock <= 5).length;

        setStats({
          totalProducts: products.data.total ?? productList.length,
          totalCategories: categories.data.length,
          totalOrders: orders.data.length,
          totalUsers: users.data.length,
          revenue,
          pendingOrders,
          lowStock,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="status-text">Đang tải thống kê...</p>;

  const cards = [
    { label: 'Tổng sản phẩm', value: stats.totalProducts },
    { label: 'Danh mục', value: stats.totalCategories },
    { label: 'Tổng đơn hàng', value: stats.totalOrders },
    { label: 'Đơn chờ xử lý', value: stats.pendingOrders },
    { label: 'Người dùng', value: stats.totalUsers },
    { label: 'Sản phẩm sắp hết hàng (≤5)', value: stats.lowStock },
    { label: 'Doanh thu (đơn hoàn thành)', value: `${stats.revenue.toLocaleString()}đ` },
  ];

  return (
    <div>
      <h2>Tổng quan</h2>
      <div className="admin-stat-grid">
        {cards.map((c) => (
          <div key={c.label} className="admin-stat-card">
            <p>{c.label}</p>
            <p>{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;