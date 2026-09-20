const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// Cập nhật lại rating_avg + review_count của 1 sản phẩm
async function refreshProductRating(productId) {
  const [[stats]] = await pool.query(
    'SELECT AVG(rating) AS avg_rating, COUNT(*) AS cnt FROM reviews WHERE product_id = ?',
    [productId]
  );
  await pool.query(
    'UPDATE products SET rating_avg = ?, review_count = ? WHERE id = ?',
    [stats.avg_rating || 0, stats.cnt || 0, productId]
  );
}

// GET /api/reviews/product/:productId - public, xem đánh giá của 1 sản phẩm
router.get('/product/:productId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.name AS user_name FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? ORDER BY r.created_at DESC`,
      [req.params.productId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy đánh giá', error: error.message });
  }
});

// POST /api/reviews - cần đăng nhập, thêm hoặc cập nhật đánh giá (1 user chỉ được 1 review/sản phẩm)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;
    if (!product_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Thiếu sản phẩm hoặc số sao không hợp lệ (1-5)' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM reviews WHERE product_id = ? AND user_id = ?',
      [product_id, req.user.id]
    );

    if (existing.length > 0) {
      await pool.query('UPDATE reviews SET rating = ?, comment = ? WHERE id = ?', [rating, comment, existing[0].id]);
    } else {
      await pool.query(
        'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
        [product_id, req.user.id, rating, comment]
      );
    }

    await refreshProductRating(product_id);
    res.status(201).json({ message: 'Cảm ơn bạn đã đánh giá!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi gửi đánh giá', error: error.message });
  }
});

// DELETE /api/reviews/:id - chỉ chủ đánh giá được xóa
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Không có quyền xóa đánh giá này' });

    await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    await refreshProductRating(rows[0].product_id);
    res.json({ message: 'Đã xóa đánh giá' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa đánh giá', error: error.message });
  }
});

module.exports = router;