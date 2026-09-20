import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function formatPrice(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}

function Cart() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState([]);

  // Mặc định chọn hết khi giỏ hàng thay đổi (thêm/xóa sản phẩm)
  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => cartItems.some((item) => item.id === id)));
  }, [cartItems]);

  const allSelected = cartItems.length > 0 && selectedIds.length === cartItems.length;

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : cartItems.map((item) => item.id));
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectedItems = cartItems.filter((item) => selectedIds.includes(item.id));
  const selectedTotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedCount = selectedItems.length;

  const handleRemoveSelected = () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Xóa ${selectedIds.length} sản phẩm đã chọn khỏi giỏ hàng?`)) return;
    selectedIds.forEach((id) => removeFromCart(id));
    setSelectedIds([]);
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) return;
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout', { state: { checkoutItems: selectedItems } });
  };

  if (cartItems.length === 0) {
    return (
      <div className="status-text">
        <p>Giỏ hàng của bạn đang trống.</p>
        <Link to="/" className="back-link">← Tiếp tục mua sắm</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2>Giỏ hàng của bạn</h2>

      <div className="cart-table">
        <div className="cart-table-header">
          <span className="cart-col-check">
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
          </span>
          <span className="cart-col-product">Sản phẩm</span>
          <span className="cart-col-price">Đơn giá</span>
          <span className="cart-col-qty">Số lượng</span>
          <span className="cart-col-subtotal">Số tiền</span>
          <span className="cart-col-action">Thao tác</span>
        </div>

        {cartItems.map((item) => (
          <div className="cart-row" key={item.id}>
            <span className="cart-col-check">
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => toggleSelectOne(item.id)}
              />
            </span>
            <span className="cart-col-product cart-product-info">
              <img src={item.image_url} alt={item.name} />
              <span className="cart-product-name">{item.name}</span>
            </span>
            <span className="cart-col-price">{formatPrice(item.price)}</span>
            <span className="cart-col-qty">
              <div className="qty-stepper">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              </div>
            </span>
            <span className="cart-col-subtotal cart-subtotal-value">
              {formatPrice(item.price * item.quantity)}
            </span>
            <span className="cart-col-action">
              <button className="cart-remove-link" onClick={() => removeFromCart(item.id)}>Xóa</button>
            </span>
          </div>
        ))}
      </div>

      <div className="cart-footer-bar">
        <div className="cart-footer-left">
          <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
          <span>Chọn tất cả ({cartItems.length})</span>
          <button className="cart-remove-link" onClick={handleRemoveSelected}>Xóa</button>
          <button className="cart-remove-link" onClick={() => { if (confirm('Xóa toàn bộ giỏ hàng?')) clearCart(); }}>
            Xóa hết giỏ hàng
          </button>
        </div>

        <div className="cart-footer-right">
          <span className="cart-footer-total-label">
            Tổng thanh toán ({selectedCount} sản phẩm):
          </span>
          <span className="cart-footer-total-value">{formatPrice(selectedTotal)}</span>
          <button
            className="cart-checkout-btn"
            onClick={handleCheckout}
            disabled={selectedCount === 0}
          >
            Mua hàng
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;