# PickBuy – Smart Online Shopping Platform
## Tài liệu Yêu cầu Chức năng (Requirements Document)

**Môn:** Lập trình Web – Đồ án cuối kỳ
**Loại sản phẩm:** Nền tảng thương mại điện tử (e-commerce) đa danh mục

---,

## 1. Mô tả tổng quan

PickBuy là nền tảng mua sắm trực tuyến cho phép người dùng duyệt, tìm kiếm và mua sản phẩm thuộc nhiều danh mục khác nhau. Hệ thống có 2 nhóm người dùng chính: **Khách hàng (Customer)** và **Quản trị viên/Người bán (Admin/Seller)**.

---

## 2. Danh mục sản phẩm

- Điện tử (điện thoại, tai nghe, laptop, phụ kiện sạc)
- Thời trang (áo thun, giày sneaker, balo)
- Gia dụng (nồi cơm điện, đèn bàn, bình giữ nhiệt)
- Sách & Văn phòng phẩm (sách, sổ tay, bút)
- Làm đẹp (mỹ phẩm, chăm sóc da)

Mỗi danh mục dự kiến 5–8 sản phẩm mẫu (tổng ~30–40 sản phẩm).

---

## 3. Chức năng dành cho Khách hàng

| STT | Chức năng | Mô tả |
|-----|-----------|-------|
| 1 | Đăng ký / Đăng nhập | Tạo tài khoản, đăng nhập bằng email + mật khẩu |
| 2 | Trang chủ | Hiển thị sản phẩm nổi bật, khuyến mãi |
| 3 | Duyệt & tìm kiếm sản phẩm | Xem theo danh mục, tìm kiếm theo tên, lọc theo giá/đánh giá |
| 4 | Chi tiết sản phẩm | Xem ảnh, mô tả, giá, đánh giá của sản phẩm |
| 5 | Giỏ hàng | Thêm/xóa/cập nhật số lượng sản phẩm trong giỏ |
| 6 | Checkout & đặt hàng | Nhập thông tin giao hàng, xác nhận đơn hàng |
| 7 | Lịch sử đơn hàng | Xem trạng thái và chi tiết các đơn đã đặt |
| 8 | Đánh giá sản phẩm | Viết review, chấm điểm sao |
| 9 | Gợi ý sản phẩm liên quan | Hiển thị sản phẩm cùng danh mục hoặc liên quan |

---

## 4. Chức năng dành cho Admin/Seller

| STT | Chức năng | Mô tả |
|-----|-----------|-------|
| 1 | Quản lý sản phẩm | Thêm/sửa/xóa sản phẩm, upload ảnh |
| 2 | Quản lý danh mục | Thêm/sửa/xóa danh mục |
| 3 | Quản lý đơn hàng | Xem danh sách đơn, cập nhật trạng thái (đang xử lý/đang giao/hoàn thành) |
| 4 | Dashboard thống kê | Biểu đồ doanh thu theo ngày/tháng, sản phẩm bán chạy |

---

## 5. Yêu cầu phi chức năng

- Giao diện responsive (dùng tốt trên desktop và mobile)
- Thời gian tải trang hợp lý, UX rõ ràng, dễ thao tác
- Dữ liệu lưu trữ có cấu trúc, đúng chuẩn ER model đã thiết kế

---

## 6. Công nghệ dự kiến

- **Frontend:** React + Tailwind CSS
- **Backend:** Node.js + Express (hoặc Django/Flask nếu nhóm quen Python hơn)
- **Database:** MySQL / PostgreSQL
- **Khác:** JWT/session cho đăng nhập, Chart.js cho dashboard, Multer/Cloudinary cho upload ảnh

---

## 7. Phân công công việc

| Thành viên | Phụ trách |
|------------|-----------|
| _(điền tên)_ | Frontend – trang khách hàng |
| _(điền tên)_ | Frontend – trang admin |
| _(điền tên)_ | Backend – API & database |
| _(điền tên)_ | Backend – xác thực & đơn hàng |

---

## 8. Lộ trình thực hiện (6–8 tuần)

1. **Tuần 1:** Thiết kế database (ERD) + wireframe UI
2. **Tuần 2–3:** Auth + trang sản phẩm (danh sách, chi tiết, tìm kiếm/lọc)
3. **Tuần 4:** Giỏ hàng + checkout + đơn hàng
4. **Tuần 5:** Trang admin (CRUD sản phẩm, quản lý đơn)
5. **Tuần 6:** Dashboard thống kê + đánh giá sản phẩm
6. **Tuần 7:** Hoàn thiện UI, responsive, xử lý lỗi
7. **Tuần 8:** Viết báo cáo + chuẩn bị demo
