const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware); // toàn bộ yêu cầu đăng nhập

// GET /api/wishlist - lấy danh sách yêu thích kèm thông tin sản phẩm
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT w.id AS wishlist_id, p.* FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ? ORDER BY w.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách yêu thích', error: error.message });
  }
});

// POST /api/wishlist - thêm vào yêu thích
router.post('/', async (req, res) => {
  try {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ message: 'Thiếu product_id' });

    await pool.query(
      'INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)',
      [req.user.id, product_id]
    );
    res.status(201).json({ message: 'Đã thêm vào yêu thích' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thêm yêu thích', error: error.message });
  }
});

// DELETE /api/wishlist/:productId - bỏ yêu thích
router.delete('/:productId', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
      [req.user.id, req.params.productId]
    );
    res.json({ message: 'Đã bỏ yêu thích' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi bỏ yêu thích', error: error.message });
  }
});

module.exports = router;