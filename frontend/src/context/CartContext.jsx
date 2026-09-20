import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext.jsx';
import api from '../utils/apiClient.js';

const CartContext = createContext();
const STORAGE_KEY = 'pickbuy_cart';

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const hasMerged = useRef(false);

  // Tải giỏ hàng: từ server nếu đã đăng nhập, từ localStorage nếu chưa
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      loadFromServer();
    } else {
      const saved = localStorage.getItem(STORAGE_KEY);
      setCartItems(saved ? JSON.parse(saved) : []);
      hasMerged.current = false;
    }
  }, [user, authLoading]);

  const loadFromServer = async () => {
    try {
      // Gộp giỏ hàng local (nếu có, lúc mới đăng nhập) vào server 1 lần duy nhất
      if (!hasMerged.current) {
        const localSaved = localStorage.getItem(STORAGE_KEY);
        const localItems = localSaved ? JSON.parse(localSaved) : [];
        for (const item of localItems) {
          await api.post('/carts', { product_id: item.id, quantity: item.quantity });
        }
        localStorage.removeItem(STORAGE_KEY);
        hasMerged.current = true;
      }

      const res = await api.get('/carts');
      setCartItems(res.data);
    } catch (err) {
      console.error('Lỗi tải giỏ hàng:', err);
    }
  };

  // Chỉ lưu localStorage khi CHƯA đăng nhập (khách vãng lai)
  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const addToCart = async (product, quantity = 1) => {
    if (user) {
      await api.post('/carts', { product_id: product.id, quantity });
      loadFromServer();
    } else {
      setCartItems((prev) => {
        const existing = prev.find((item) => item.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
          );
        }
        return [...prev, { ...product, quantity }];
      });
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    if (user) {
      await api.put(`/carts/${productId}`, { quantity });
      setCartItems((prev) => prev.map((item) => (item.id === productId ? { ...item, quantity } : item)));
    } else {
      setCartItems((prev) => prev.map((item) => (item.id === productId ? { ...item, quantity } : item)));
    }
  };

  const removeFromCart = async (productId) => {
    if (user) {
      await api.delete(`/carts/${productId}`);
    }
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = async () => {
    if (user) {
      await api.delete('/carts');
    }
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}