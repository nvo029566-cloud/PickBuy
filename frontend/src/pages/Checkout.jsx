import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import apiClient from '../utils/apiClient.js';

function formatPrice(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}

function Checkout() {
  const { cartItems: allCartItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const cartItems = location.state?.checkoutItems || allCartItems;
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const [note, setNote] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({ recipient_name: '', phone: '', address: '', is_default: false });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [vouchersLoading, setVouchersLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [voucherError, setVoucherError] = useState('');
  const [checkingVoucher, setCheckingVoucher] = useState(false);
  const [showVoucherList, setShowVoucherList] = useState(false);

  useEffect(() => {
    if (!user) return;
    const loadVouchers = async () => {
      setVouchersLoading(true);
      try {
        const res = await apiClient.get('/vouchers/available');
        setAvailableVouchers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setVouchersLoading(false);
      }
    };
    loadVouchers();
  }, [user]);

  // Tải sổ địa chỉ đã lưu của user, đặt sẵn địa chỉ mặc định (hoặc đầu tiên) làm lựa chọn
  useEffect(() => {
    if (!user) return;
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    try {
      const res = await apiClient.get('/addresses');
      setAddresses(res.data);
      const defaultAddr = res.data.find((a) => a.is_default) || res.data[0];
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
    } catch (err) {
      console.error(err);
    }
  };

  const openNewAddressForm = () => {
    setAddressForm({ recipient_name: '', phone: '', address: '', is_default: addresses.length === 0 });
    setEditingAddressId(null);
    setShowAddressModal('form');
  };

  const openEditAddressForm = (addr) => {
    setAddressForm({
      recipient_name: addr.recipient_name,
      phone: addr.phone,
      address: addr.address,
      is_default: !!addr.is_default,
    });
    setEditingAddressId(addr.id);
    setShowAddressModal('form');
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await apiClient.put(`/addresses/${editingAddressId}`, addressForm);
      } else {
        const res = await apiClient.post('/addresses', addressForm);
        setSelectedAddressId(res.data.id);
      }
      await loadAddresses();
      setShowAddressModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Lưu địa chỉ thất bại');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Xóa địa chỉ này?')) return;
    await apiClient.delete(`/addresses/${id}`);
    await loadAddresses();
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  if (!user) {
    return (
      <div className="status-text">
        <p>Bạn cần đăng nhập trước khi đặt hàng.</p>
        <Link to="/login" className="back-link">Đăng nhập ngay →</Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="status-text">
        <p>Giỏ hàng đang trống, không có gì để đặt hàng.</p>
        <Link to="/" className="back-link">← Quay lại mua sắm</Link>
      </div>
    );
  }

  const handleSelectVoucher = async (voucher) => {
    setVoucherError('');

    if (selectedVoucher?.id === voucher.id) {
      setSelectedVoucher(null);
      setDiscount(0);
      return;
    }

    if (totalPrice < voucher.min_order) {
      setVoucherError(`Đơn hàng cần tối thiểu ${formatPrice(voucher.min_order)} để dùng mã "${voucher.code}"`);
      return;
    }

    setCheckingVoucher(true);
    try {
      const res = await apiClient.post('/vouchers/validate', {
        code: voucher.code,
        order_total: totalPrice,
      });
      setSelectedVoucher(voucher);
      setDiscount(res.data.discount);
      setShowVoucherList(false);
    } catch (err) {
      setVoucherError(err.response?.data?.message || 'Mã voucher không hợp lệ');
      setSelectedVoucher(null);
      setDiscount(0);
    } finally {
      setCheckingVoucher(false);
    }
  };

  const finalTotal = totalPrice - discount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAddress) {
      setError('Vui lòng chọn địa chỉ nhận hàng');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await apiClient.post('/orders', {
        items: cartItems,
        shipping_address: `${selectedAddress.recipient_name} | ${selectedAddress.phone} | ${selectedAddress.address}`,
        shipping_phone: selectedAddress.phone,
        payment_method: 'cod',
        voucher_code: selectedVoucher ? selectedVoucher.code : undefined,
      });
      clearCart();
      navigate('/orders', { state: { justOrderedId: res.data.orderId } });
    } catch (err) {
      setError(err.response?.data?.message || 'Đặt hàng thất bại, thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-steps">
        <div className="checkout-step active">
          <span className="checkout-step-num">1</span>
          <span>Giỏ hàng</span>
        </div>
        <span className="checkout-step-line" />
        <div className="checkout-step active">
          <span className="checkout-step-num">2</span>
          <span>Xác nhận đặt hàng</span>
        </div>
        <span className="checkout-step-line" />
        <div className="checkout-step">
          <span className="checkout-step-num">3</span>
          <span>Hoàn tất</span>
        </div>
      </div>

      <div className="checkout-grid">
        {/* Cột trái: thông tin giao hàng + voucher */}
        <div className="checkout-main">
          <form id="checkout-form" onSubmit={handleSubmit}>
            <div className="checkout-card">
              <h3 className="checkout-card-title">📍 Địa chỉ nhận hàng</h3>
              {selectedAddress ? (
                <div className="address-display">
                  <div className="address-display-info">
                    <p>
                      <strong>{selectedAddress.recipient_name}</strong>
                      <span className="address-phone"> | {selectedAddress.phone}</span>
                    </p>
                    <p className="address-line">{selectedAddress.address}</p>
                    {!!selectedAddress.is_default && <span className="address-default-tag">Mặc định</span>}
                  </div>
                  <button type="button" className="address-change-btn" onClick={() => setShowAddressModal('list')}>
                    Thay đổi
                  </button>
                </div>
              ) : (
                <button type="button" className="address-add-empty-btn" onClick={openNewAddressForm}>
                  + Thêm địa chỉ nhận hàng
                </button>
              )}

              <div className="checkout-field" style={{ marginTop: 14 }}>
                <label>Ghi chú cho người bán (không bắt buộc)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Giao giờ hành chính..."
                />
              </div>
            </div>

            <div className="checkout-card">
              <h3 className="checkout-card-title">📦 Sản phẩm ({totalQuantity})</h3>
              <div className="checkout-item-list">
                {cartItems.map((item) => (
                  <div className="checkout-item-row" key={item.id}>
                    <img src={item.image_url} alt={item.name} />
                    <div className="checkout-item-info">
                      <p className="checkout-item-name">{item.name}</p>
                      <p className="checkout-item-price">{formatPrice(item.price)} x {item.quantity}</p>
                    </div>
                    <p className="checkout-item-subtotal">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="checkout-card">
              <h3 className="checkout-card-title">🚚 Vận chuyển</h3>
              <div className="checkout-shipping-row">
                <span>Đơn vị vận chuyển</span>
                <span className="checkout-shipping-badge">Giao hàng tiêu chuẩn — Miễn phí</span>
              </div>
              <div className="checkout-shipping-row">
                <span>Dự kiến giao hàng</span>
                <span>3 - 5 ngày làm việc</span>
              </div>
            </div>

            <div className="checkout-card">
              <h3 className="checkout-card-title">💳 Phương thức thanh toán</h3>
              <div className="checkout-payment-option active">
                <span className="checkout-payment-icon">💵</span>
                <div>
                  <p className="checkout-payment-name">Thanh toán khi nhận hàng (COD)</p>
                  <p className="checkout-payment-desc">Thanh toán bằng tiền mặt khi nhận được hàng</p>
                </div>
                <span className="checkout-payment-check">✓</span>
              </div>
            </div>
          </form>
        </div>

        {/* Cột phải: tóm tắt đơn hàng, sticky */}
        <div className="checkout-side">
          <div className="checkout-card">
            <h3 className="checkout-card-title">🎟️ Mã giảm giá</h3>

            {selectedVoucher ? (
              <div className="checkout-voucher-applied">
                <div>
                  <strong>{selectedVoucher.code}</strong>
                  <p>Đã giảm {formatPrice(discount)}</p>
                </div>
                <button type="button" onClick={() => handleSelectVoucher(selectedVoucher)}>Bỏ chọn</button>
              </div>
            ) : (
              <button
                type="button"
                className="checkout-voucher-trigger"
                onClick={() => setShowVoucherList((v) => !v)}
              >
                {vouchersLoading ? 'Đang tải mã...' : `Chọn mã giảm giá (${availableVouchers.length} mã khả dụng)`}
                <span>{showVoucherList ? '▲' : '▼'}</span>
              </button>
            )}

            {showVoucherList && !selectedVoucher && (
              <div className="checkout-voucher-list">
                {availableVouchers.length === 0 ? (
                  <p className="status-text">Hiện chưa có mã giảm giá nào.</p>
                ) : (
                  availableVouchers.map((v) => {
                    const isEligible = totalPrice >= v.min_order;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSelectVoucher(v)}
                        disabled={checkingVoucher || !isEligible}
                        className={`checkout-voucher-item ${!isEligible ? 'disabled' : ''}`}
                      >
                        <div>
                          <strong>{v.code}</strong>
                          <span className="checkout-voucher-percent">
                            Giảm {v.discount_percent}%{v.max_discount ? ` (tối đa ${formatPrice(v.max_discount)})` : ''}
                          </span>
                          <p>{v.min_order > 0 ? `Đơn tối thiểu ${formatPrice(v.min_order)}` : 'Không yêu cầu đơn tối thiểu'}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {voucherError && <p className="status-text error" style={{ marginTop: 8, fontSize: 13 }}>{voucherError}</p>}
          </div>

          <div className="checkout-card checkout-summary-card">
            <h3 className="checkout-card-title">Tóm tắt đơn hàng</h3>
            <div className="checkout-summary-row">
              <span>Tạm tính ({totalQuantity} sản phẩm)</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            {discount > 0 && (
              <div className="checkout-summary-row discount">
                <span>Giảm giá voucher</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="checkout-summary-row">
              <span>Phí vận chuyển</span>
              <span className="checkout-free-ship">Miễn phí</span>
            </div>
            <div className="checkout-summary-divider" />
            <div className="checkout-summary-row total">
              <span>Tổng thanh toán</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>

            {error && <p className="status-text error" style={{ marginTop: 10 }}>{error}</p>}

            <button type="submit" form="checkout-form" className="checkout-submit-btn" disabled={loading}>
              {loading ? 'Đang xử lý...' : `Đặt hàng · ${formatPrice(finalTotal)}`}
            </button>

            <p className="checkout-terms">
              Bằng việc đặt hàng, bạn đồng ý với Điều khoản dịch vụ của PickBuy
            </p>
          </div>
        </div>
      </div>

      {/* Modal chọn địa chỉ từ danh sách đã lưu */}
      {showAddressModal === 'list' && (
        <div className="address-modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="address-modal" onClick={(e) => e.stopPropagation()}>
            <div className="address-modal-header">
              <button className="address-modal-back" onClick={() => setShowAddressModal(false)}>←</button>
              <h3>Chọn địa chỉ nhận hàng</h3>
            </div>
            <div className="address-modal-body">
              {addresses.map((addr) => (
                <label key={addr.id} className="address-radio-row">
                  <input
                    type="radio"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                  />
                  <div className="address-radio-info">
                    <p>
                      <strong>{addr.recipient_name}</strong>
                      <span className="address-phone"> | {addr.phone}</span>
                    </p>
                    <p className="address-line">{addr.address}</p>
                    {!!addr.is_default && <span className="address-default-tag">Mặc định</span>}
                  </div>
                  <button type="button" className="address-edit-link" onClick={() => openEditAddressForm(addr)}>Sửa</button>
                </label>
              ))}
            </div>
            <div className="address-modal-footer">
              <button type="button" className="address-add-btn" onClick={openNewAddressForm}>
                + Thêm địa chỉ mới
              </button>
              <button
                type="button"
                className="address-confirm-btn"
                onClick={() => setShowAddressModal(false)}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal form thêm/sửa địa chỉ */}
      {showAddressModal === 'form' && (
        <div className="address-modal-overlay" onClick={() => setShowAddressModal(false)}>
          <form className="address-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSaveAddress}>
            <div className="address-modal-header">
              <button type="button" className="address-modal-back" onClick={() => setShowAddressModal(addresses.length > 0 ? 'list' : false)}>←</button>
              <h3>{editingAddressId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
            </div>
            <div className="address-modal-body">
              <div className="checkout-field">
                <label>Họ và tên người nhận</label>
                <input
                  type="text"
                  value={addressForm.recipient_name}
                  onChange={(e) => setAddressForm({ ...addressForm, recipient_name: e.target.value })}
                  required
                />
              </div>
              <div className="checkout-field">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  required
                />
              </div>
              <div className="checkout-field">
                <label>Địa chỉ chi tiết</label>
                <input
                  type="text"
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành..."
                  required
                />
              </div>
              <label className="address-default-checkbox">
                <input
                  type="checkbox"
                  checked={addressForm.is_default}
                  onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                />
                Đặt làm địa chỉ mặc định
              </label>
              {editingAddressId && (
                <button
                  type="button"
                  className="address-delete-btn"
                  onClick={() => { handleDeleteAddress(editingAddressId); setShowAddressModal(false); }}
                >
                  Xóa địa chỉ này
                </button>
              )}
            </div>
            <div className="address-modal-footer">
              <button type="submit" className="address-confirm-btn" style={{ width: '100%' }}>
                Lưu địa chỉ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Checkout;