import "../styles/layout.css";

const Footer = () => {
  return (
    // footer 태그에 스타일과 className 적용
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-info">
            <h3 className="footer-title">현지학기제 카페</h3>
            <p className="footer-description">
              현지학기제의 정보를 공유하고 소통하는 커뮤니티입니다.
            </p>
          </div>
          <div className="footer-contact">
            <p className="footer-contact-title">연락처</p>
            <p className="footer-contact-info">
              이메일: contact@travelcommunity.com
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
