const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/carts - lấy giỏ hàng của user, kèm thông tin sản phẩm
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.product_id AS id, c.quantity, p.name, p.price, p.image_url, p.stock
       FROM carts c JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy giỏ hàng', error: error.message });
  }
});

// POST /api/carts - thêm sản phẩm (hoặc cộng dồn số lượng nếu đã có)
router.post('/', async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    if (!product_id || !quantity) return res.status(400).json({ message: 'Thiếu product_id hoặc quantity' });

    await pool.query(
      `INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [req.user.id, product_id, quantity]
    );
    res.status(201).json({ message: 'Đã thêm vào giỏ hàng' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thêm giỏ hàng', error: error.message });
  }
});

// PUT /api/carts/:productId - đặt số lượng chính xác
router.put('/:productId', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ message: 'Số lượng không hợp lệ' });

    await pool.query(
      'UPDATE carts SET quantity = ? WHERE user_id = ? AND product_id = ?',
      [quantity, req.user.id, req.params.productId]
    );
    res.json({ message: 'Đã cập nhật số lượng' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật giỏ hàng', error: error.message });
  }
});

// DELETE /api/carts/:productId - xóa 1 sản phẩm khỏi giỏ
router.delete('/:productId', async (req, res) => {
  try {
    await pool.query('DELETE FROM carts WHERE user_id = ? AND product_id = ?', [req.user.id, req.params.productId]);
    res.json({ message: 'Đã xóa khỏi giỏ hàng' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa giỏ hàng', error: error.message });
  }
});

// DELETE /api/carts - xóa sạch giỏ hàng (dùng sau khi đặt hàng thành công)
router.delete('/', async (req, res) => {
  try {
    await pool.query('DELETE FROM carts WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Đã xóa toàn bộ giỏ hàng' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa giỏ hàng', error: error.message });
  }
});

module.exports = router;