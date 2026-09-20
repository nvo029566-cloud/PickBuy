import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại, thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-topbar">
        <Link to="/" className="auth-topbar-logo">
          <img src="/Logo.png" alt="PickBuy" />
        </Link>
        <span className="auth-topbar-title">Đăng nhập</span>
        <Link to="/" className="auth-topbar-help">← Về trang chủ</Link>
      </div>

      <div className="auth-body">
        <div className="auth-left">
          <img src="/Logo.png" alt="PickBuy" className="auth-left-logo" />
          <p className="auth-slogan">Nền tảng mua sắm thông minh<br/>dành cho bạn</p>
        </div>

        <div className="auth-right">
          <div className="auth-form-wrap">
            <h2>Đăng nhập</h2>
            <form onSubmit={handleSubmit} className="auth-form">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

              <label>Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && <p className="status-text error">{error}</p>}

              <button type="submit" className="add-to-cart-btn" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
            </form>
            <p className="auth-switch">Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;