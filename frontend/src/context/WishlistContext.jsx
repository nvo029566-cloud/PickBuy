import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import api from '../utils/apiClient.js';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(new Set());

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      loadWishlist();
    } else {
      setWishlistIds(new Set());
    }
  }, [user, authLoading]);

const loadWishlist = async () => {
  try {
    const res = await api.get('/wishlist');
    // Tự động nhận dạng format backend trả về
    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.items)
      ? res.data.items
      : Array.isArray(res.data?.data)
      ? res.data.data
      : [];
    setWishlistIds(new Set(list.map((p) => p.id)));
  } catch (err) {
    console.error('Lỗi tải yêu thích:', err);
  }
};

  const isInWishlist = (productId) => wishlistIds.has(productId);

  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) {
      await api.delete(`/wishlist/${productId}`);
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    } else {
      await api.post('/wishlist', { product_id: productId });
      setWishlistIds((prev) => new Set(prev).add(productId));
    }
  };

  return (
    <WishlistContext.Provider value={{ isInWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}