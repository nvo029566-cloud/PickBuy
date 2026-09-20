const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const pool = require("./db");
const productsRouter = require("./routes/products");
const authRouter = require("./routes/auth");
const ordersRouter = require("./routes/orders");
const categoriesRouter = require("./routes/categories");
const usersRouter = require("./routes/users");
const reviewsRouter = require("./routes/reviews");
const wishlistRouter = require("./routes/wishlist");
const vouchersRouter = require("./routes/vouchers");
const cartsRouter = require("./routes/carts");
const addressesRouter = require("./routes/addresses");

const app = express();

// Middleware cơ bản
app.use(cors({ origin: "*" }));
app.options("*", cors());
app.use(express.json()); // đọc được JSON trong request body

// Serve ảnh đã upload (truy cập qua http://localhost:5000/uploads/tên-file.jpg)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Route test đơn giản - kiểm tra server chạy được
app.get("/api/test", (req, res) => {
  res.json({ message: "PickBuy backend đang chạy!" });
});

// Route test kết nối database - lấy danh sách categories
app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categories");
    res.json({
      message: "Kết nối database thành công!",
      data: rows,
    });
  } catch (error) {
    console.error("Lỗi kết nối database:", error.message);
    res.status(500).json({
      message: "Kết nối database thất bại",
      error: error.message,
    });
  }
});

// Gắn các route
app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/users", usersRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/vouchers", vouchersRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/addresses", addressesRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
