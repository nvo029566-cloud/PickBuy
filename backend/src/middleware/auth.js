const jwt = require('jsonwebtoken');

// Middleware kiểm tra token - dùng cho các route cần đăng nhập mới truy cập được
// Cách dùng: thêm authMiddleware vào trước route, ví dụ:
// router.get('/orders', authMiddleware, (req, res) => { ... })
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization; // dạng "Bearer <token>"

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Chưa đăng nhập hoặc thiếu token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // gắn thông tin user (id, role) vào request để route sau dùng
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

// Middleware kiểm tra quyền admin - dùng SAU authMiddleware
// Ví dụ: router.post('/products', authMiddleware, adminOnly, (req, res) => { ... })
function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ admin mới được thực hiện thao tác này' });
  }
  next();
}

module.exports = { authMiddleware, adminOnly };