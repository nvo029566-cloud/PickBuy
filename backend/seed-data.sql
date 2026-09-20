USE pickbuy;

-- ========== CATEGORIES ==========
INSERT INTO categories (name, description) VALUES
('Điện tử', 'Điện thoại, laptop, tai nghe, phụ kiện công nghệ'),
('Thời trang', 'Quần áo, giày dép, phụ kiện thời trang'),
('Gia dụng', 'Đồ dùng gia đình, nhà bếp'),
('Sách & Văn phòng phẩm', 'Sách, sổ tay, bút viết'),
('Làm đẹp', 'Mỹ phẩm, chăm sóc da');

-- ========== PRODUCTS ==========
-- category_id: 1=Điện tử, 2=Thời trang, 3=Gia dụng, 4=Sách & VPP, 5=Làm đẹp

INSERT INTO products (name, description, price, stock, image_url, category_id) VALUES
-- Điện tử
('Tai nghe Bluetooth AirBeat Pro', 'Tai nghe không dây, chống ồn, pin 30 giờ', 890000, 50, 'https://picsum.photos/seed/p1/400', 1),
('Sạc nhanh 30W Type-C', 'Củ sạc nhanh hỗ trợ đa thiết bị', 250000, 100, 'https://picsum.photos/seed/p2/400', 1),
('Chuột không dây SlimMouse', 'Chuột văn phòng, kết nối Bluetooth', 199000, 80, 'https://picsum.photos/seed/p3/400', 1),
('Bàn phím cơ MechType K1', 'Bàn phím cơ switch đỏ, đèn LED RGB', 750000, 40, 'https://picsum.photos/seed/p4/400', 1),
('Ốp lưng điện thoại chống sốc', 'Ốp silicon chống va đập cho nhiều dòng máy', 89000, 200, 'https://picsum.photos/seed/p5/400', 1),
('Loa Bluetooth mini SoundWave', 'Loa nhỏ gọn, chống nước IPX5', 450000, 60, 'https://picsum.photos/seed/p6/400', 1),

-- Thời trang
('Áo thun cotton basic', 'Áo thun unisex, chất liệu cotton 100%', 150000, 120, 'https://picsum.photos/seed/p7/400', 2),
('Giày sneaker UrbanStep', 'Giày thể thao phong cách đường phố', 590000, 70, 'https://picsum.photos/seed/p8/400', 2),
('Balo laptop CityPack', 'Balo chống nước, ngăn riêng cho laptop 15.6 inch', 320000, 55, 'https://picsum.photos/seed/p9/400', 2),
('Quần jean slim fit', 'Quần jean nam/nữ dáng slim, co giãn nhẹ', 280000, 90, 'https://picsum.photos/seed/p10/400', 2),
('Mũ lưỡi trai basic', 'Mũ unisex, điều chỉnh size sau gáy', 99000, 150, 'https://picsum.photos/seed/p11/400', 2),

-- Gia dụng
('Nồi cơm điện SmartCook 1.8L', 'Nồi cơm điện tử, nhiều chế độ nấu', 690000, 35, 'https://picsum.photos/seed/p12/400', 3),
('Đèn bàn LED chống cận', 'Đèn học/làm việc, 5 mức độ sáng', 210000, 65, 'https://picsum.photos/seed/p13/400', 3),
('Bình giữ nhiệt 500ml', 'Giữ nhiệt 12 giờ, chất liệu inox 304', 175000, 100, 'https://picsum.photos/seed/p14/400', 3),
('Máy xay sinh tố MiniBlend', 'Máy xay công suất 300W, cối 1L', 350000, 45, 'https://picsum.photos/seed/p15/400', 3),

-- Sách & Văn phòng phẩm
('Sổ tay bìa da A5', 'Sổ ghi chép 200 trang, bìa da PU', 65000, 200, 'https://picsum.photos/seed/p16/400', 4),
('Bộ bút bi 10 cây', 'Bút bi mực xanh, viết êm tay', 45000, 300, 'https://picsum.photos/seed/p17/400', 4),
('Sách "Lập trình Web căn bản"', 'Giáo trình nhập môn lập trình web', 120000, 40, 'https://picsum.photos/seed/p18/400', 4),

-- Làm đẹp
('Kem chống nắng SPF50', 'Chống nắng phổ rộng, không nhờn rít', 210000, 80, 'https://picsum.photos/seed/p19/400', 5),
('Sữa rửa mặt dịu nhẹ', 'Dành cho da nhạy cảm, không chứa xà phòng', 165000, 90, 'https://picsum.photos/seed/p20/400', 5),
('Son dưỡng môi không màu', 'Dưỡng ẩm, bảo vệ môi khỏi khô nứt', 55000, 150, 'https://picsum.photos/seed/p21/400', 5);
