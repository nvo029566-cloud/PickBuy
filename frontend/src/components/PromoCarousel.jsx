import { useState, useEffect } from 'react';

const SLIDES = [
  {
    title: 'Mua sắm thông minh cùng PickBuy',
    subtitle: 'Freeship toàn quốc — Ưu đãi mỗi ngày — Đổi trả dễ dàng',
    badge: 'GIẢM ĐẾN 50%',
    gradient: 'linear-gradient(120deg, #134e4a, #0f766e 55%, #14b8a6)',
  },
  {
    title: 'Flash Sale cuối tuần',
    subtitle: 'Hàng ngàn sản phẩm giảm giá sốc, số lượng có hạn',
    badge: 'SĂN SALE NGAY',
    gradient: 'linear-gradient(120deg, #9a3412, #ea580c 55%, #fb923c)',
  },
  {
    title: 'Miễn phí vận chuyển toàn quốc',
    subtitle: 'Áp dụng cho đơn hàng từ 200.000đ, không giới hạn số lượng',
    badge: 'FREESHIP',
    gradient: 'linear-gradient(120deg, #1e3a8a, #2563eb 55%, #60a5fa)',
  },
  {
    title: 'Ưu đãi thành viên mới',
    subtitle: 'Giảm ngay 10% cho đơn hàng đầu tiên khi đăng ký tài khoản',
    badge: 'THÀNH VIÊN MỚI',
    gradient: 'linear-gradient(120deg, #581c87, #9333ea 55%, #c084fc)',
  },
];

function PromoCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (index) => setCurrent(index);
  const goPrev = () => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  const goNext = () => setCurrent((prev) => (prev + 1) % SLIDES.length);

  const slide = SLIDES[current];

  return (
    <div className="promo-carousel" style={{ background: slide.gradient }}>
      <button className="promo-nav promo-nav-prev" onClick={goPrev} aria-label="Trước">‹</button>

      <div className="promo-banner-text">
        <h2>{slide.title}</h2>
        <p>{slide.subtitle}</p>
      </div>
      <div className="promo-banner-badge">{slide.badge}</div>

      <button className="promo-nav promo-nav-next" onClick={goNext} aria-label="Sau">›</button>

      <div className="promo-dots">
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className={`promo-dot ${i === current ? 'active' : ''}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}

export default PromoCarousel;