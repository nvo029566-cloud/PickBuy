const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// GET /api/vouchers/available - khách xem danh sách voucher còn hiệu lực (không cần quyền admin)
// ĐẶT TRƯỚC route GET /admin-list để tránh nhầm với các route khác nếu có :id sau này
router.get('/available', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, code, discount_percent, max_discount, min_order, usage_limit, used_count, expires_at
       FROM vouchers
       WHERE (expires_at IS NULL OR expires_at > NOW())
         AND (usage_limit IS NULL OR used_count < usage_limit)
       ORDER BY discount_percent DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách voucher', error: error.message });
  }
});

// GET /api/vouchers - admin xem tất cả voucher
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vouchers ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách voucher', error: error.message });
  }
});

// POST /api/vouchers - admin tạo voucher
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { code, discount_percent, max_discount, min_order, usage_limit, expires_at } = req.body;
    if (!code || !discount_percent) {
      return res.status(400).json({ message: 'Thiếu mã hoặc % giảm giá' });
    }
    const [result] = await pool.query(
      `INSERT INTO vouchers (code, discount_percent, max_discount, min_order, usage_limit, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [code.toUpperCase(), discount_percent, max_discount || null, min_order || 0, usage_limit || null, expires_at || null]
    );
    res.status(201).json({ message: 'Tạo voucher thành công', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Mã voucher đã tồn tại' });
    }
    res.status(500).json({ message: 'Lỗi tạo voucher', error: error.message });
  }
});

// PUT /api/vouchers/:id - admin sửa voucher
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { code, discount_percent, max_discount, min_order, usage_limit, expires_at } = req.body;
    if (!code || !discount_percent) {
      return res.status(400).json({ message: 'Thiếu mã hoặc % giảm giá' });
    }

    const [result] = await pool.query(
      `UPDATE vouchers SET code=?, discount_percent=?, max_discount=?, min_order=?, usage_limit=?, expires_at=?
       WHERE id=?`,
      [code.toUpperCase(), discount_percent, max_discount || null, min_order || 0, usage_limit || null, expires_at || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy voucher để cập nhật' });
    }
    res.json({ message: 'Cập nhật voucher thành công' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Mã voucher đã tồn tại' });
    }
    res.status(500).json({ message: 'Lỗi cập nhật voucher', error: error.message });
  }
});

// DELETE /api/vouchers/:id - admin xóa voucher
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM vouchers WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy voucher' });
    res.json({ message: 'Xóa voucher thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa voucher', error: error.message });
  }
});

// Hàm dùng chung: kiểm tra + tính giảm giá (dùng cho cả /validate và lúc tạo đơn hàng thật)
async function checkVoucher(code, orderTotal) {
  const [rows] = await pool.query('SELECT * FROM vouchers WHERE code = ?', [code.toUpperCase()]);
  if (rows.length === 0) return { valid: false, message: 'Mã voucher không tồn tại' };

  const v = rows[0];
  if (v.expires_at && new Date(v.expires_at) < new Date()) {
    return { valid: false, message: 'Mã voucher đã hết hạn' };
  }
  if (v.usage_limit !== null && v.used_count >= v.usage_limit) {
    return { valid: false, message: 'Mã voucher đã hết lượt sử dụng' };
  }
  if (orderTotal < v.min_order) {
    return { valid: false, message: `Đơn hàng tối thiểu ${Number(v.min_order).toLocaleString()}đ để dùng mã này` };
  }

  let discount = (orderTotal * v.discount_percent) / 100;
  if (v.max_discount && discount > v.max_discount) discount = v.max_discount;

  return { valid: true, discount, voucher: v };
}

// POST /api/vouchers/validate - khách kiểm tra mã trước khi đặt hàng
router.post('/validate', authMiddleware, async (req, res) => {
  try {
    const { code, order_total } = req.body;
    if (!code || order_total === undefined) {
      return res.status(400).json({ message: 'Thiếu mã voucher hoặc tổng đơn hàng' });
    }
    const result = await checkVoucher(code, order_total);
    if (!result.valid) return res.status(400).json({ message: result.message });

    res.json({ message: 'Mã hợp lệ', discount: result.discount });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi kiểm tra voucher', error: error.message });
  }
});

module.exports = router;
module.exports.checkVoucher = checkVoucher;