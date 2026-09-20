const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// GET /api/categories - public
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY id');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh mục', error: error.message });
  }
});

// POST /api/categories - admin only
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, description, image_url } = req.body;
    if (!name) return res.status(400).json({ message: 'Thiếu tên danh mục' });
    const [result] = await pool.query(
      'INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)',
      [name, description || null, image_url || null]
    );
    res.status(201).json({ message: 'Thêm danh mục thành công', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thêm danh mục', error: error.message });
  }
});

// PUT /api/categories/:id - admin only
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, description, image_url } = req.body;
    const [result] = await pool.query(
      'UPDATE categories SET name=?, description=?, image_url=? WHERE id=?',
      [name, description, image_url, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.json({ message: 'Cập nhật danh mục thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật danh mục', error: error.message });
  }
});

// DELETE /api/categories/:id - admin only
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.json({ message: 'Xóa danh mục thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa danh mục (có thể đang có sản phẩm thuộc danh mục này)', error: error.message });
  }
});

module.exports = router;