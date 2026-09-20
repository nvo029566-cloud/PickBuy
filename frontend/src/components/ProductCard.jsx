import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';

function ProductCard({ product }) {
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(product.price);

  const liked = isInWishlist(product.id);
  const outOfStock = Number(product.stock) <= 0;

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    await toggleWishlist(product.id);
  };

  const handleBuyNowClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    navigate(`/product/${product.id}`);
  };

  return (
    <Link to={`/product/${product.id}`} className="product-card" style={{ position: 'relative', display: 'block' }}>
      <button
        onClick={handleWishlistClick}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 2,
          background: 'rgba(255,255,255,0.9)',
          border: 'none',
          borderRadius: '50%',
          width: 32,
          height: 32,
          cursor: 'pointer',
          fontSize: 16,
        }}
        aria-label="Yêu thích"
      >
        {liked ? '❤️' : '🤍'}
      </button>

      <div className="product-card-image-wrap">
        <img
          src={product.image_url}
          alt={product.name}
          className={outOfStock ? 'product-img-dimmed' : ''}
        />
        {outOfStock && <span className="out-of-stock-badge">Hết hàng</span>}
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        {product.rating_avg > 0 && (
          <p className="product-rating">
            ⭐ {Number(product.rating_avg).toFixed(1)} ({product.review_count || 0} đánh giá)
          </p>
        )}
        <div className="price-row">
          <span className="product-price">{formattedPrice}</span>
          <button
            className="card-buy-now-btn"
            onClick={handleBuyNowClick}
            disabled={outOfStock}
          >
            {outOfStock ? 'Hết hàng' : 'Mua ngay'}
          </button>
        </div>
        <p className="product-stock">
          {outOfStock ? <span style={{ color: '#dc2626' }}>Hết hàng</span> : `Còn lại: ${product.stock}`}
        </p>
      </div>
    </Link>
  );
}

export default ProductCard;