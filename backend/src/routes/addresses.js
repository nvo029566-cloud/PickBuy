const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/addresses - lấy toàn bộ địa chỉ đã lưu của user, mặc định lên đầu
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách địa chỉ', error: error.message });
  }
});

// POST /api/addresses - thêm địa chỉ mới
router.post('/', async (req, res) => {
  try {
    const { recipient_name, phone, address, is_default } = req.body;
    if (!recipient_name || !phone || !address) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    if (is_default) {
      await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    }

    const [result] = await pool.query(
      'INSERT INTO addresses (user_id, recipient_name, phone, address, is_default) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, recipient_name, phone, address, is_default ? 1 : 0]
    );
    res.status(201).json({ message: 'Đã thêm địa chỉ', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thêm địa chỉ', error: error.message });
  }
});

// PUT /api/addresses/:id - sửa địa chỉ
router.put('/:id', async (req, res) => {
  try {
    const { recipient_name, phone, address, is_default } = req.body;

    if (is_default) {
      await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    }

    const [result] = await pool.query(
      'UPDATE addresses SET recipient_name=?, phone=?, address=?, is_default=? WHERE id=? AND user_id=?',
      [recipient_name, phone, address, is_default ? 1 : 0, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
    res.json({ message: 'Đã cập nhật địa chỉ' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật địa chỉ', error: error.message });
  }
});

// DELETE /api/addresses/:id - xóa địa chỉ
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
    res.json({ message: 'Đã xóa địa chỉ' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa địa chỉ', error: error.message });
  }
});

module.exports = router;