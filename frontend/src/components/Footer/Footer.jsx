import { Link } from "react-router-dom"
import { Gift } from "lucide-react"
import "./Footer.css"

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <Link to="/" className="logo">
            <Gift className="logo-icon" />
            <span>DealVista</span>
          </Link>
          <p>The trusted coupon marketplace for verified discount coupons and online coupon exchange.</p>
        </div>
        <div className="footer-links">
          <div className="footer-column">
            <h4>Platform</h4>
            <Link to="/">Browse Coupons</Link>
            <Link to="/upload">List a Coupon</Link>
            <Link to="/#rewards">Rewards</Link>
          </div>
          <div className="footer-column">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Contact</a>
            <a href="#">Blog</a>
          </div>
          <div className="footer-column">
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>© 2025 DealVista. All rights reserved.</p>
      </div>
    </footer>
  )
}

