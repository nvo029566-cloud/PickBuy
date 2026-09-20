import { NavLink, Outlet } from 'react-router-dom';

function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>PickBuy Admin</h2>
        <nav>
          {[
            ['/admin', 'Dashboard'],
            ['/admin/products', 'Sản phẩm'],
            ['/admin/categories', 'Danh mục'],
            ['/admin/orders', 'Đơn hàng'],
            ['/admin/users', 'Người dùng'],
            ['/admin/vouchers', 'Voucher'],
          ].map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;