import "./home.css"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useEffect } from "react"
import { setPageMeta, SEO } from "../../services/seo"
import { Navbar } from "../../components/Navbar/Navbar"
import { Footer } from "../../components/Footer/Footer"
import {
  Tag,
  ShoppingBag,
  Utensils,
  Car,
  Smartphone,
  Tv,
  CheckCircle,
  Shield,
  Clock,
  Users,
  AlertTriangle,
  Star,
  ArrowRight,
  Plus,
  Coins,
  Gift,
  Ticket,
} from "lucide-react"

export function Home() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setPageMeta(SEO.home.title, SEO.home.description, SEO.home.canonical)
  }, [])

  const handleListCoupon = (e) => {
    e.preventDefault()
    if (isAuthenticated) {
      navigate("/upload")
    } else {
      navigate("/auth", { state: { from: { pathname: "/upload" } } })
    }
  }

  return (
    <div className="home">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="container hero-content">
            <div className="hero-text">
              <h1>Turn Unused Coupons into Reward Points</h1>
              <p className="hero-subheading">
                Share coupons you don't need, earn reward points, and redeem verified coupons shared by real users.
              </p>
              <div className="hero-ctas">
                <button onClick={handleListCoupon} className="btn btn-primary btn-lg">
                  <Plus size={20} />
                  List a Coupon
                </button>
                <Link to="/browse" className="btn btn-secondary btn-lg">
                  <Tag size={20} />
                  Browse Coupons
                </Link>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">50K+</span>
                  <span className="stat-label">Active Coupons</span>
                </div>
                <div className="stat">
                  <span className="stat-number">120K+</span>
                  <span className="stat-label">Happy Users</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="floating-cards">
                <div className="floating-card card-1">
                  <Tag size={24} />
                  <span>50% OFF</span>
                </div>
                <div className="floating-card card-2">
                  <Coins size={24} />
                  <span>+100 pts</span>
                </div>
                <div className="floating-card card-3">
                  <Gift size={24} />
                  <span>Redeemed!</span>
                </div>
                <div className="floating-card card-5">
                  <Star size={20} />
                  <span>+50 pts</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="how-it-works">
          <div className="container">
            <div className="section-header">
              <h2>How It Works</h2>
              <p>Start earning rewards in three simple steps</p>
            </div>
            <div className="steps-grid">
              <button
                onClick={handleListCoupon}
                className="step-card"
                style={{ textDecoration: 'none', color: 'inherit', border: 'none', background: 'inherit', cursor: 'pointer', width: '100%' }}
              >
                <div className="step-number">1</div>
                <div className="step-icon">
                  <Plus size={32} />
                </div>
                <h3>Add a Coupon</h3>
                <p>List coupons from Amazon, GPay, PhonePe, Swiggy, and more.</p>
              </button>
              <article className="step-card">
                <div className="step-number">2</div>
                <div className="step-icon step-icon-gold">
                  <Star size={32} />
                </div>
                <h3>Earn Reward Points</h3>
                <p>Get points for every verified coupon you share.</p>
              </article>
              <article className="step-card">
                <div className="step-number">3</div>
                <div className="step-icon step-icon-green">
                  <Ticket size={32} />
                </div>
                <h3>Redeem Coupons</h3>
                <p>Use your points to unlock coupons you actually need.</p>
              </article>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="why-choose">
          <div className="container">
            <div className="section-header">
              <h2>Why Choose Our Coupon Platform</h2>
              <p>The trusted online coupon exchange for verified discount coupons</p>
            </div>
            <div className="features-grid">
              <article className="feature-card">
                <CheckCircle className="feature-icon" />
                <h3>Verified Coupons</h3>
                <p>Verified coupons from real users, no bots or spam.</p>
              </article>
              <article className="feature-card">
                <Shield className="feature-icon" />
                <h3>No Fake Codes</h3>
                <p>No fake or expired coupon codes in our marketplace.</p>
              </article>
              <article className="feature-card">
                <Coins className="feature-icon feature-icon-gold" />
                <h3>Earn Rewards</h3>
                <p>Earn reward points instead of wasting coupons.</p>
              </article>
              <article className="feature-card">
                <ArrowRight className="feature-icon" />
                <h3>Simple & Fast</h3>
                <p>Simple, fast, and spam-free experience.</p>
              </article>
            </div>
          </div>
        </section>

        {/* Popular Categories */}
        <section id="categories" className="categories">
          <div className="container">
            <div className="section-header">
              <h2>Popular Coupon Categories</h2>
              <p>Find discount coupons across all your favorite brands</p>
            </div>
            <div className="categories-grid">
              <a href="#" className="category-card">
                <ShoppingBag size={32} />
                <h3>Shopping Coupons</h3>
                <span className="category-count">2,500+ coupons</span>
              </a>
              <a href="#" className="category-card">
                <Utensils size={32} />
                <h3>Food & Delivery</h3>
                <span className="category-count">1,800+ coupons</span>
              </a>
              <a href="#" className="category-card">
                <Car size={32} />
                <h3>Travel & Cab</h3>
                <span className="category-count">950+ coupons</span>
              </a>
              <a href="#" className="category-card">
                <Smartphone size={32} />
                <h3>Recharge & Bills</h3>
                <span className="category-count">1,200+ coupons</span>
              </a>
              <a href="#" className="category-card">
                <Tv size={32} />
                <h3>Entertainment</h3>
                <span className="category-count">600+ coupons</span>
              </a>
            </div>
          </div>
        </section>

        {/* Trust & Safety */}
        <section className="trust-safety">
          <div className="container">
            <div className="section-header">
              <h2>Trust & Safety</h2>
              <p>Your security is our priority</p>
            </div>
            <div className="trust-grid">
              <div className="trust-item">
                <CheckCircle className="trust-icon" />
                <div>
                  <h3>Coupon Verification</h3>
                  <p>Every coupon is verified before publishing</p>
                </div>
              </div>
              <div className="trust-item">
                <Clock className="trust-icon" />
                <div>
                  <h3>Expiry Tracking</h3>
                  <p>Real-time expiry tracking and success rate</p>
                </div>
              </div>
              <div className="trust-item">
                <Users className="trust-icon" />
                <div>
                  <h3>User Reputation</h3>
                  <p>Transparent user reputation system</p>
                </div>
              </div>
              <div className="trust-item">
                <AlertTriangle className="trust-icon" />
                <div>
                  <h3>Report System</h3>
                  <p>Easily report invalid or expired coupons</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rewards Section */}
        <section id="rewards" className="rewards">
          <div className="container rewards-content">
            <div className="rewards-text">
              <h2>Your Coupons Have Real Value</h2>
              <p>
                Earn points by sharing valid coupons and redeem them for discounts you actually use. Join our coupon
                marketplace and start earning reward points today.
              </p>
              <ul className="rewards-list">
                <li>
                  <CheckCircle size={20} />
                  <span>Earn 50-200 points per verified coupon</span>
                </li>
                <li>
                  <CheckCircle size={20} />
                  <span>Redeem points for premium coupons</span>
                </li>
                <li>
                  <CheckCircle size={20} />
                  <span>Bonus points for highly-rated shares</span>
                </li>
              </ul>
            </div>
            <div className="rewards-visual">
              <div className="rewards-card">
                <div className="rewards-card-header">
                  <Coins size={32} />
                  <span>Your Balance</span>
                </div>
                <div className="rewards-card-balance">2,450</div>
                <div className="rewards-card-label">Reward Points</div>
                <Link to="/browse" className="btn btn-primary btn-block">Redeem Now</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="final-cta">
          <div className="container final-cta-content">
            <h2>Stop Letting Coupons Expire</h2>
            <p>Join thousands of users who are already earning rewards by sharing their unused coupons.</p>
            <button onClick={handleListCoupon} className="btn btn-white btn-lg">
              Get Started Free
              <ArrowRight size={20} />
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
