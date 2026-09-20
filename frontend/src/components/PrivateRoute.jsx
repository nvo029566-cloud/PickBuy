import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="status-text">Đang kiểm tra đăng nhập...</p>;

  if (!user) {
    return (
      <div className="require-login-page">
        <div className="require-login-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="6" width="16" height="14" rx="2" stroke="#d1d5db" strokeWidth="1.5"/>
            <path d="M4 10h16" stroke="#d1d5db" strokeWidth="1.5"/>
            <circle cx="17" cy="16" r="4" fill="#fff" stroke="#d1d5db" strokeWidth="1.5"/>
            <path d="M15.3 16l1.2 1.2 2.2-2.2" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2>Cần đăng nhập</h2>
        <p>Có vẻ như bạn chưa đăng nhập. Đăng nhập để tiếp tục hoặc quay lại trang chủ.</p>
        <div className="require-login-actions">
          <Link to="/login" className="require-login-btn primary">Đăng nhập</Link>
          <Link to="/" className="require-login-btn secondary">Trở về trang chủ</Link>
        </div>
      </div>
    );
  }

  return children;
}

export default PrivateRoute;