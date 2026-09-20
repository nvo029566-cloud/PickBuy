import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="status-text">Đang kiểm tra đăng nhập...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
}

export default AdminRoute;