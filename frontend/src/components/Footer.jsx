function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col">
          <h4>PickBuy</h4>
          <p>Nền tảng mua sắm thông minh, lựa chọn hoàn hảo.</p>
        </div>
        <div className="footer-col">
          <h4>Hỗ trợ khách hàng</h4>
          <ul>
            <li>Trung tâm trợ giúp</li>
            <li>Hướng dẫn mua hàng</li>
            <li>Chính sách đổi trả</li>
            <li>Vận chuyển</li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Về PickBuy</h4>
          <ul>
            <li>Giới thiệu</li>
            <li>Tuyển dụng</li>
            <li>Điều khoản dịch vụ</li>
            <li>Chính sách bảo mật</li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Kết nối với chúng tôi</h4>
          <div className="footer-socials">
            <span>Facebook</span>
            <span>Instagram</span>
            <span>YouTube</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} PickBuy — Đồ án cuối kỳ Web Application Development
      </div>
    </footer>
  );
}

export default Footer;