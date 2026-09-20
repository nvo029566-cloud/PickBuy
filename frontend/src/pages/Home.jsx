import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard.jsx';
import PromoCarousel from '../components/PromoCarousel.jsx';

const API_URL = `${import.meta.env.VITE_API_URL}/api/products`;
const CATEGORIES_URL = `${import.meta.env.VITE_API_URL}/api/categories`;
const CATEGORY_ICONS = ['👕', '📱', '💻', '🎧', '👟', '🏠', '⌚', '🎮', '📷', '🎒'];
const PAGE_SIZE = 12;

const PRICE_RANGES = [
  { label: 'Tất cả mức giá', min: '', max: '' },
  { label: 'Dưới 100.000đ', min: '', max: '100000' },
  { label: '100.000đ - 300.000đ', min: '100000', max: '300000' },
  { label: '300.000đ - 500.000đ', min: '300000', max: '500000' },
  { label: '500.000đ - 1.000.000đ', min: '500000', max: '1000000' },
  { label: 'Trên 1.000.000đ', min: '1000000', max: '' },
];

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const activeCategory = searchParams.get('category') ? Number(searchParams.get('category')) : null;
  const priceRange = searchParams.get('price') || 'Tất cả mức giá';

  // Nếu vào trang bằng F5 (reload) -> xóa hết bộ lọc, về mặc định
  // Nếu vào trang bằng nút Back/Forward của trình duyệt -> giữ nguyên bộ lọc trong URL
  useEffect(() => {
    const navEntries = performance.getEntriesByType('navigation');
    const navType = navEntries.length > 0 ? navEntries[0].type : null;

    if (navType === 'reload' && searchParams.toString() !== '') {
      setSearchParams({}, { replace: true });
    }
  }, []);

  useEffect(() => {
    axios.get(CATEGORIES_URL).then((res) => setCategories(res.data)).catch(console.error);
  }, []);

  // Khi đổi bộ lọc -> tải lại từ đầu (offset = 0)
  useEffect(() => {
    fetchProducts(0, false);
  }, [sort, activeCategory, search, priceRange]);

  const buildParams = (offset) => {
    const selected = PRICE_RANGES.find((r) => r.label === priceRange);
    const params = { sort, limit: PAGE_SIZE, offset };
    if (search) params.search = search;
    if (selected?.min) params.min_price = selected.min;
    if (selected?.max) params.max_price = selected.max;
    if (activeCategory) params.category_id = activeCategory;
    return params;
  };

  const fetchProducts = async (offset, append) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_URL, { params: buildParams(offset) });
   const newProducts = Array.isArray(res.data.products) ? res.data.products : (Array.isArray(res.data) ? res.data : []);
const newTotal = res.data.total ?? newProducts.length;
setTotal(newTotal);
setProducts((prev) => (append ? [...prev, ...newProducts] : newProducts));
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách sản phẩm. Kiểm tra lại backend đã chạy chưa.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    fetchProducts(products.length, true);
  };

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(0, false);
  };

  const handleCategoryClick = (id) => {
    updateParam('category', activeCategory === id ? '' : id);
  };

  const hasMore = products.length < total;

  return (
    <div>
      <PromoCarousel />

      {categories.length > 0 && (
        <div className="category-strip">
          <button
            className={`category-item${activeCategory === null ? ' active' : ''}`}
            onClick={() => updateParam('category', '')}
          >
            <div className="category-icon">🛍️</div>
            <div className="category-label">Tất cả</div>
          </button>
          {categories.map((c, i) => (
            <button
              key={c.id}
              className={`category-item${activeCategory === c.id ? ' active' : ''}`}
              onClick={() => handleCategoryClick(c.id)}
            >
              <div className="category-icon">
                {c.image_url ? <img src={c.image_url} alt={c.name} /> : CATEGORY_ICONS[i % CATEGORY_ICONS.length]}
              </div>
              <div className="category-label">{c.name}</div>
            </button>
          ))}
        </div>
      )}

      <form className="search-bar" onSubmit={handleSearch}>
        {search && (
          <span className="active-search-tag">
            Đang tìm: <strong>{search}</strong>
            <button type="button" onClick={() => updateParam('search', '')}>✕</button>
          </span>
        )}
        <select value={priceRange} onChange={(e) => updateParam('price', e.target.value)}>
          {PRICE_RANGES.map((r) => (
            <option key={r.label} value={r.label}>{r.label}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
          <option value="newest">Mới nhất</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
          <option value="rating">Đánh giá cao nhất</option>
        </select>
        <button type="submit">Lọc</button>
      </form>

      <h3 className="section-title">
        {activeCategory ? categories.find((c) => c.id === activeCategory)?.name : 'Gợi ý hôm nay'}
      </h3>

      {loading ? (
        <p className="status-text">Đang tải sản phẩm...</p>
      ) : error ? (
        <p className="status-text error">{error}</p>
      ) : products.length === 0 ? (
        <p className="status-text">Không tìm thấy sản phẩm nào.</p>
      ) : (
        <>
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="load-more-wrap">
            {hasMore ? (
              <button className="load-more-btn" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? 'Đang tải...' : `Xem thêm (${products.length}/${total})`}
              </button>
            ) : (
              <p className="load-more-end">Đã hiển thị tất cả {total} sản phẩm</p>
            )}
          </div>
        </>
      )}

      <div className="feature-strip">
        <div className="feature-item">
          <span className="feature-icon">🚚</span>
          <div>
            <p className="feature-title">Miễn phí vận chuyển</p>
            <p className="feature-desc">Cho đơn hàng từ 200.000đ</p>
          </div>
        </div>
        <div className="feature-item">
          <span className="feature-icon">↩️</span>
          <div>
            <p className="feature-title">Đổi trả dễ dàng</p>
            <p className="feature-desc">Trong vòng 7 ngày</p>
          </div>
        </div>
        <div className="feature-item">
          <span className="feature-icon">🔒</span>
          <div>
            <p className="feature-title">Thanh toán an toàn</p>
            <p className="feature-desc">Bảo mật thông tin tuyệt đối</p>
          </div>
        </div>
        <div className="feature-item">
          <span className="feature-icon">🎧</span>
          <div>
            <p className="feature-title">Hỗ trợ 24/7</p>
            <p className="feature-desc">Luôn sẵn sàng giúp đỡ bạn</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;