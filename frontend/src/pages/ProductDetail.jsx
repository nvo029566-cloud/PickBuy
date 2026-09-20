import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import api from '../utils/apiClient.js';
import { useToast } from '../context/ToastContext.jsx';

const API_URL = `${import.meta.env.VITE_API_URL}/api/products`;
const CATEGORIES_URL = `${import.meta.env.VITE_API_URL}/api/categories`;

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => setError('Không tìm thấy sản phẩm.'))
      .finally(() => setLoading(false));

    loadReviews();
  }, [id]);

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await axios.get(`${REVIEWS_URL}/product/${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setReviewsLoading(false);
    }
  };

  if (loading) return <p className="status-text">Đang tải...</p>;
  if (error) return <p className="status-text error">{error}</p>;
  if (!product) return null;

  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(product.price);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    showToast('Sản phẩm đã được thêm vào Giỏ hàng');
    setTimeout(() => setAdded(false), 1500);
  };

    const handleBuyNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const buyNowItem = { ...product, quantity };
    navigate('/checkout', { state: { checkoutItems: [buyNowItem] } });
  };

  const handleWishlistClick = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    await toggleWishlist(product.id);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setReviewError('');
    setSubmitting(true);
    try {
      await api.post('/reviews', { product_id: Number(id), rating: myRating, comment: myComment });
      setMyComment('');
      setMyRating(5);
      await loadReviews();
      const res = await axios.get(`${API_URL}/${id}`); // tải lại để cập nhật rating_avg mới
      setProduct(res.data);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Gửi đánh giá thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const liked = isInWishlist(product.id);

  return (
    <div>
      <Link to="/" className="back-link">← Quay lại danh sách</Link>
      <div className="detail-container">
        <img src={product.image_url} alt={product.name} className="detail-image" />
        <div className="detail-info">
          <h2>{product.name}</h2>
          {product.rating_avg > 0 && (
            <p className="product-rating">
              ⭐ {Number(product.rating_avg).toFixed(1)} / 5 ({product.review_count || 0} đánh giá)
            </p>
          )}
            <div className="quick-info-row">
            {product.rating_avg > 0 && (
              <span className="quick-info-item">
                ⭐ {Number(product.rating_avg).toFixed(1)}/5 ({product.review_count || 0} đánh giá)
              </span>
            )}
            <span className="quick-info-divider">|</span>
            <span className="quick-info-item">Mã SP: PB-{String(product.id).padStart(5, '0')}</span>
            <span className="quick-info-divider">|</span>
            <span className="quick-info-item">
              {product.stock > 0 ? '🟢 Còn hàng' : '🔴 Hết hàng'}
            </span>
          </div>
          <p className="product-price detail-price">{formattedPrice}</p>
                    <p className="product-stock">
            {product.stock > 0 ? (
              `Còn lại: ${product.stock} sản phẩm`
            ) : (
              <span style={{ color: '#dc2626', fontWeight: 600 }}>Sản phẩm tạm hết hàng</span>
            )}
          </p>

          <div className="quantity-row">
            <label>Số lượng:</label>
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}>+</button>
          </div>

                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              {product.stock <= 0 ? 'Hết hàng' : added ? '✓ Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}
            </button>
            <button
              className="buy-now-btn"
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
            >
              {product.stock <= 0 ? 'Hết hàng' : 'Mua ngay'}
            </button>
            <button
              onClick={handleWishlistClick}
              style={{
                padding: '10px 16px',
                border: liked ? '1px solid #0f766e' : '1px solid #e5e7eb',
                borderRadius: 8,
                background: liked ? '#ecfdf9' : '#fff',
                color: liked ? '#0f766e' : '#374151',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              {liked ? '❤️ Đã yêu thích' : '🤍 Yêu thích'}
            </button>
          </div>
        </div>
      </div>

            {product.specifications && Object.keys(product.specifications).length > 0 && (
        <div className="spec-section">
          <h3>Chi tiết sản phẩm</h3>
          <table className="spec-table">
            <tbody>
              {Object.entries(product.specifications).map(([key, value]) => (
                <tr key={key}>
                  <td className="spec-label">{key}</td>
                  <td className="spec-value">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {product.description && (
        <div className="long-desc-section">
          <h3>Mô tả sản phẩm</h3>
          <p className="long-desc-content">{product.description}</p>
        </div>
      )}


      <div className="reviews-section" style={{ marginTop: 32 }}>
        <h3>Đánh giá sản phẩm</h3>

        {user ? (
          <form
            onSubmit={handleSubmitReview}
            className="auth-form-container auth-form"
            style={{ maxWidth: 500, marginBottom: 24 }}
          >
                        <label>Đánh giá của bạn</label>
            <div className="star-picker">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className={`star-picker-item ${n <= myRating ? 'active' : ''}`}
                  onClick={() => setMyRating(n)}
                >
                  ★
                </span>
              ))}
              <span className="star-picker-label">{myRating} sao</span>
            </div>
            <textarea
              placeholder="Nhận xét của bạn về sản phẩm..."
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              rows={3}
            />
            {reviewError && <p className="status-text error">{reviewError}</p>}
            <button type="submit" className="add-to-cart-btn" disabled={submitting}>
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </form>
        ) : (
          <p className="status-text">
            <Link to="/login" className="back-link">Đăng nhập</Link> để đánh giá sản phẩm này.
          </p>
        )}

        {reviewsLoading ? (
          <p className="status-text">Đang tải đánh giá...</p>
        ) : reviews.length === 0 ? (
          <p className="status-text">Chưa có đánh giá nào cho sản phẩm này.</p>
        ) : (
          <div className="review-list">
            {reviews.map((r) => (
              <div key={r.id} className="review-card">
                <div className="review-avatar">{r.user_name?.charAt(0).toUpperCase()}</div>
                <div className="review-body">
                  <div className="review-header">
                    <strong>{r.user_name}</strong>
                    <span className="review-date">{new Date(r.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="review-stars">
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </div>
                  {r.comment && <p className="review-comment">{r.comment}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;