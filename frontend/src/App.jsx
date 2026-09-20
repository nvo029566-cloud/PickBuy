import AdminRoute from "./components/AdminRoute.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminCategories from "./pages/admin/AdminCategories.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";
import AdminVouchers from './pages/admin/AdminVouchers.jsx';
import './admin.css';
import PrivateRoute from "./components/PrivateRoute.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import Footer from "./components/Footer.jsx";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { CartProvider, useCart } from "./context/CartContext.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Home from "./pages/Home.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Checkout from "./pages/Checkout.jsx";
import Orders from "./pages/Orders.jsx";
import { useState } from 'react';

function HeaderContent() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [headerSearch, setHeaderSearch] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleHeaderSearch = (e) => {
    e.preventDefault();
    navigate(`/?search=${encodeURIComponent(headerSearch)}`);
  };

  return (
    <header className="header">
      {/* Tầng trên: link tài khoản, mỏng */}
            <div className="header-top">
        <div className="header-top-inner">
          <div className="header-top-left">
            <span>📢 Kênh Người Bán</span>
            <span className="header-top-divider">|</span>
            <span>📱 Tải ứng dụng</span>
            <span className="header-top-divider">|</span>
            <span>
              Kết nối
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Instagram">📷</a>
            </span>
          </div>
          <div className="header-top-right">
            {user ? (
              <>
                {user.role === 'admin' && <Link to="/admin">Quản trị</Link>}
                <Link to="/orders">Đơn hàng của tôi</Link>
                <span className="welcome-text">Xin chào, {user.name}</span>
                <button className="header-top-btn" onClick={handleLogout}>Đăng xuất</button>
              </>
            ) : (
              <>
                <Link to="/login">Đăng nhập</Link>
                <Link to="/register">Đăng ký</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tầng chính: logo + tìm kiếm + giỏ hàng */}
      <div className="header-main">
        <Link to="/" className="logo-link" onClick={() => setHeaderSearch('')}>
          <img src="/Logo.png" alt="PickBuy" />
        </Link>

         <form className="header-search" onSubmit={handleHeaderSearch}>
          <input
            type="text"
            placeholder="Tìm sản phẩm, thương hiệu..."
            value={headerSearch}
            onChange={(e) => setHeaderSearch(e.target.value)}
          />
          <button type="submit" aria-label="Tìm kiếm">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2"/>
              <path d="M20 20L16.65 16.65" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </button>
        </form>

        <Link to="/cart" className="header-cart-icon">
          🛒
          {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </Link>
      </div>
    </header>
  );
}

function AppLayout() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="app">
      {!isAuthPage && <HeaderContent />}
      <main className={isAdminPage ? "main-admin" : isAuthPage ? "main-auth" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<PrivateRoute><ProductDetail /></PrivateRoute>} />
          <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="vouchers" element={<AdminVouchers />} />
          </Route>
        </Routes>
      </main>
      {!isAdminPage && !isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <ToastProvider>
            <BrowserRouter>
              <AppLayout />
            </BrowserRouter>
          </ToastProvider>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
export default App;