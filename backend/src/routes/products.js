const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authMiddleware, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");
const uploadExcel = require("../middleware/uploadExcel");

// POST /api/products/upload - upload ảnh, trả về image_url (admin)
const xlsx = require("xlsx");

// POST /api/products/import - nhập hàng loạt sản phẩm từ file Excel (admin)
router.post(
  "/import",
  authMiddleware,
  adminOnly,
  uploadExcel.single("file"),
  async (req, res) => {
    if (!req.file)
      return res.status(400).json({ message: "Vui lòng chọn file Excel" });

    try {
          const fs = require('fs');
    const ext = require('path').extname(req.file.originalname).toLowerCase();

    let workbook;
    if (ext === '.csv') {
      // Đọc CSV với encoding UTF-8 rõ ràng để giữ đúng dấu tiếng Việt
      const csvText = fs.readFileSync(req.file.path, 'utf8');
      workbook = xlsx.read(csvText, { type: 'string' });
    } else {
      const fileBuffer = fs.readFileSync(req.file.path);
      workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    }
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(sheet);

      if (rows.length === 0) {
        return res.status(400).json({ message: "File không có dữ liệu" });
      }

      // Lấy danh sách category để map tên -> id
      const [categories] = await pool.query("SELECT id, name FROM categories");
      const categoryMap = {};
      categories.forEach((c) => {
        categoryMap[c.name.trim().toLowerCase()] = c.id;
      });

      let successCount = 0;
      const errors = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const name = row.name || row.ten_san_pham;
        const price = row.price || row.gia;
        const categoryName = (row.category || row.danh_muc || "")
          .toString()
          .trim()
          .toLowerCase();
        const categoryId = categoryMap[categoryName];

        if (!name || !price || !categoryId) {
          errors.push(
            `Dòng ${i + 2}: thiếu tên, giá hoặc danh mục "${row.category || row.danh_muc}" không khớp`,
          );
          continue;
        }

        await pool.query(
          "INSERT INTO products (name, description, price, stock, image_url, category_id) VALUES (?, ?, ?, ?, ?, ?)",
          [
            name,
            row.description || row.mo_ta || "",
            price,
            row.stock || row.ton_kho || 0,
            row.image_url || row.anh || null,
            categoryId,
          ],
        );
        successCount++;
      }

      res.json({
        message: `Nhập thành công ${successCount}/${rows.length} sản phẩm`,
        successCount,
        totalRows: rows.length,
        errors,
      });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .json({ message: "Lỗi đọc file Excel", error: error.message });
    }
  },
);

// ĐẶT TRƯỚC route GET /:id để tránh Express hiểu "upload" là :id
router.post(
  "/upload",
  authMiddleware,
  adminOnly,
  upload.single("image"),
  (req, res) => {
    if (!req.file)
      return res.status(400).json({ message: "Vui lòng chọn file ảnh" });
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ message: "Upload thành công", image_url: imageUrl });
  },
);

// GET /api/products - lấy danh sách sản phẩm (lọc, tìm kiếm, sắp xếp)
router.get("/", async (req, res) => {
  try {
    const { category_id, search, min_price, max_price, sort, limit, offset } = req.query;
    let sql = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (category_id) {
      sql += " AND category_id = ?";
      params.push(category_id);
    }
    if (search) {
      sql += " AND name LIKE ?";
      params.push(`%${search}%`);
    }
    if (min_price) {
      sql += " AND price >= ?";
      params.push(min_price);
    }
    if (max_price) {
      sql += " AND price <= ?";
      params.push(max_price);
    }

    // Đếm tổng số sản phẩm khớp điều kiện (trước khi phân trang) để frontend biết còn hàng để tải thêm không
    const [countRows] = await pool.query(
      sql.replace("SELECT * FROM products", "SELECT COUNT(*) AS total FROM products"),
      params
    );
    const total = countRows[0].total;

    const sortMap = {
      price_asc: "price ASC, id ASC",
      price_desc: "price DESC, id ASC",
      newest: "RAND()",
      rating: "rating_avg DESC, id ASC",
    };
    sql += ` ORDER BY ${sortMap[sort] || "RAND()"}`;

    const pageLimit = Math.min(Number(limit) || 12, 100);
    const pageOffset = Number(offset) || 0;
    sql += ` LIMIT ${pageLimit} OFFSET ${pageOffset}`;

    const [rows] = await pool.query(sql, params);
    res.json({ products: rows, total });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ message: "Lỗi lấy danh sách sản phẩm", error: error.message });
  }
});

// GET /api/products/:id - lấy chi tiết 1 sản phẩm (ĐÃ BỊ MẤT — thêm lại)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    const product = rows[0];
    if (typeof product.specifications === 'string') {
      product.specifications = JSON.parse(product.specifications);
    }
    res.json(product);
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ message: "Lỗi lấy chi tiết sản phẩm", error: error.message });
  }
});

// POST /api/products - thêm sản phẩm mới (admin)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, description, price, stock, image_url, category_id, specifications } = req.body;

    if (!name || !price || !category_id) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (name, price, category_id)' });
    }

    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, stock, image_url, category_id, specifications) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, stock || 0, image_url, category_id, specifications ? JSON.stringify(specifications) : null]
    );

    res
      .status(201)
      .json({ message: "Thêm sản phẩm thành công", id: result.insertId });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ message: "Lỗi thêm sản phẩm", error: error.message });
  }
});

// PUT /api/products/:id - cập nhật sản phẩm (admin)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, description, price, stock, image_url, category_id, specifications } = req.body;

    const [result] = await pool.query(
      `UPDATE products SET name=?, description=?, price=?, stock=?, image_url=?, category_id=?, specifications=?
       WHERE id=?`,
      [name, description, price, stock, image_url, category_id, specifications ? JSON.stringify(specifications) : null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm để cập nhật" });
    }
    res.json({ message: "Cập nhật sản phẩm thành công" });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ message: "Lỗi cập nhật sản phẩm", error: error.message });
  }
});

// DELETE /api/products/:id - xóa sản phẩm (admin)
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm để xóa" });
    }
    res.json({ message: "Xóa sản phẩm thành công" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Lỗi xóa sản phẩm", error: error.message });
  }
});

module.exports = router;
