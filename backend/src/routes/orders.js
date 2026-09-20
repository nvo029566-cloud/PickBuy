const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.use(authMiddleware);

// PUT /api/orders/:id/cancel - khách tự hủy đơn (chỉ khi đơn đang ở trạng thái pending)
router.put('/:id/cancel', async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    if (orders[0].status !== 'pending') {
      return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng đang ở trạng thái chờ xử lý' });
    }

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', ['cancelled', req.params.id]);

    const [items] = await pool.query('SELECT product_id, quantity FROM orderitems WHERE order_id = ?', [req.params.id]);
    for (const item of items) {
      await pool.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    res.json({ message: 'Đã hủy đơn hàng' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Lỗi hủy đơn hàng', error: error.message });
  }
});

// GET /api/orders/admin/all - admin xem TẤT CẢ đơn hàng
// ĐẶT TRƯỚC route GET /admin/:id để "all" không bị hiểu nhầm là :id
router.get('/admin/all', adminOnly, async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM orders o JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );
    res.json(orders);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Lỗi lấy danh sách đơn hàng', error: error.message });
  }
});

// GET /api/orders/admin/:id - admin xem chi tiết 1 đơn hàng bất kỳ (kèm sản phẩm)
router.get('/admin/:id', adminOnly, async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM orders o JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [req.params.id]
    );
    if (orders.length === 0) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    const [items] = await pool.query(
      `SELECT oi.*, p.name, p.image_url FROM orderitems oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );

    res.json({ ...orders[0], items });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết đơn hàng', error: error.message });
  }
});

// PUT /api/orders/:id/status - admin đổi trạng thái đơn hàng
router.put('/:id/status', adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'processing', 'shipping', 'completed', 'cancelled'];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const [existing] = await pool.query('SELECT status FROM orders WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    const previousStatus = existing[0].status;

    const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      const [items] = await pool.query('SELECT product_id, quantity FROM orderitems WHERE order_id = ?', [req.params.id]);
      for (const item of items) {
        await pool.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
      }
    }

    res.json({ message: 'Cập nhật trạng thái thành công' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Lỗi cập nhật trạng thái', error: error.message });
  }
});

const { checkVoucher } = require('./vouchers');

// POST /api/orders - tạo đơn hàng mới từ giỏ hàng
router.post('/', async (req, res) => {
  const { items, shipping_address, shipping_phone, payment_method, voucher_code } = req.body;
  const userId = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Giỏ hàng trống, không thể đặt hàng' });
  }
  if (!shipping_address || !shipping_phone) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ địa chỉ và số điện thoại giao hàng' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    let discountAmount = 0;
    if (voucher_code) {
      const result = await checkVoucher(voucher_code, subtotal);
      if (!result.valid) {
        await connection.rollback();
        return res.status(400).json({ message: result.message });
      }
      discountAmount = result.discount;
      await connection.query('UPDATE vouchers SET used_count = used_count + 1 WHERE code = ?', [voucher_code.toUpperCase()]);
    }

    const total = subtotal - discountAmount;

    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, status, total, shipping_address, shipping_phone, payment_method, voucher_code, discount_amount)
       VALUES (?, 'pending', ?, ?, ?, ?, ?, ?)`,
      [userId, total, shipping_address, shipping_phone, payment_method || 'cod', voucher_code || null, discountAmount]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      await connection.query(
        `INSERT INTO orderitems (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
        [orderId, item.id, item.quantity, item.price]
      );
      await connection.query(
        `UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?`,
        [item.quantity, item.id, item.quantity]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Đặt hàng thành công', orderId, discountAmount, total });
  } catch (error) {
    await connection.rollback();
    console.error(error.message);
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng', error: error.message });
  } finally {
    connection.release();
  }
});

// GET /api/orders - lấy lịch sử đơn hàng của user đang đăng nhập
router.get('/', async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT p.image_url, p.name FROM orderitems oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ? LIMIT 1`,
        [order.id]
      );
      order.thumbnail = items[0]?.image_url || null;
      order.first_item_name = items[0]?.name || null;

      const [countRows] = await pool.query(
        'SELECT COUNT(*) AS itemCount FROM orderitems WHERE order_id = ?',
        [order.id]
      );
      order.item_count = countRows[0].itemCount;
    }

    res.json(orders);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Lỗi lấy danh sách đơn hàng', error: error.message });
  }
});

// GET /api/orders/:id - xem chi tiết 1 đơn hàng (kèm danh sách sản phẩm trong đơn)
router.get('/:id', async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    const [items] = await pool.query(
      `SELECT oi.*, p.name, p.image_url FROM orderitems oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );

    res.json({ ...orders[0], items });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Lỗi lấy chi tiết đơn hàng', error: error.message });
  }
});

module.exports = router;