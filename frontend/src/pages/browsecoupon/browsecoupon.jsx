import "./browsecoupon.css"
import { useState, useEffect } from "react"
import { Navbar } from "../../components/Navbar/Navbar"
import { Footer } from "../../components/Footer/Footer"
import { CouponDetailModal } from "../../components/CouponDetailModal/CouponDetailModal"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../components/Toast/Toast"
import { couponAPI } from "../../services/api"
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  Users,
  Coins,
  ChevronDown,
  RefreshCw,
  ShoppingBag,
  Utensils,
  Smartphone,
  CreditCard,
  Tag,
} from "lucide-react"

const platforms = ["All Platforms", "Amazon", "Swiggy", "Zomato", "PhonePe", "GPay", "Myntra", "Flipkart"]
const categories = ["All Categories", "Food", "Shopping", "Travel", "Recharge", "Entertainment", "Subscription"]
const discountTypes = ["All Types", "Flat Discount", "Percentage", "Cashback", "BOGO"]
const sortOptions = ["Latest", "Expiring Soon", "Most Popular"]

function formatDate(dateStr) {
  if (!dateStr) return "N/A"
  try {
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  } catch {
    return dateStr
  }
}

function capitalize(s) {
  if (!s) return ""
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

/** Map API coupon to card shape for the grid */
function toCard(c) {
  const platformDisplay = capitalize(c.platform)
  const categoryDisplay = capitalize(c.category)
  const typeDisplay =
    c.discountType === "FLAT" ? "Flat Discount" : c.discountType === "PERCENTAGE" ? "Percentage" : c.discountType || "—"
  const validity = c.validTill ? `Valid till ${formatDate(c.validTill)}` : "Check terms"
  return {
    // Basic fields
    id: c.id,
    title: c.title,
    description: c.description,
    code: c.code,
    platform: platformDisplay,
    platformRaw: (c.platform || "").toLowerCase(),
    category: categoryDisplay,
    categoryRaw: (c.category || "").toLowerCase(),
    type: typeDisplay,
    typeRaw: (c.discountType || "").toLowerCase(),
    
    // Discount fields
    discountType: c.discountType,
    discountValue: c.discountValue,
    minOrderValue: c.minOrderValue,
    maxDiscountValue: c.maxDiscountValue,
    
    // Validity fields
    validFrom: c.validFrom,
    validTill: c.validTill,
    validity,
    
    // Terms and conditions
    termsConditions: c.termsConditions || c.terms,
    
    // Restrictions
    requiresUniqueUser: c.requiresUniqueUser,
    usageType: c.usageType,
    geoRestriction: c.geoRestriction,
    
    // Pricing
    price: c.price,
    isFree: c.isFree,
    redeemCost: c.redeemCost || 10,
    
    // Other
    verified: c.isActive !== false,
    usersRedeemed: c.soldQuantity ?? 0,
  }
}

const platformIcons = {
  Swiggy: Utensils,
  Amazon: ShoppingBag,
  PhonePe: Smartphone,
  Zomato: Utensils,
  GPay: CreditCard,
  Flipkart: ShoppingBag,
  Myntra: Tag,
}

const categoryColors = {
  Food: "category-food",
  Shopping: "category-shopping",
  Travel: "category-travel",
  Recharge: "category-recharge",
  Entertainment: "category-entertainment",
  Subscription: "category-subscription",
}

export function BrowseCoupons() {
  const { isAuthenticated } = useAuth()
  const { showToast, ToastContainer } = useToast()
  const [coupons, setCoupons] = useState([])
  const [fullCoupons, setFullCoupons] = useState({}) // Store full coupon data by ID
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCoupon, setSelectedCoupon] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filters, setFilters] = useState({
    platform: "All Platforms",
    category: "All Categories",
    discountType: "All Types",
    sortBy: "Latest",
    verifiedOnly: false,
    searchQuery: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    couponAPI
      .browseCoupons({ activeOnly: true })
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          // Store full coupon data
          const fullCouponsMap = {}
          const cardCoupons = data.map((c) => {
            fullCouponsMap[c.id] = c
            return toCard(c)
          })
          setCoupons(cardCoupons)
          console.log("Fetched coupons:", cardCoupons)
          setFullCoupons(fullCouponsMap)
          console.log("Full coupons map:", fullCouponsMap)
        } else if (!cancelled && data) setCoupons([])
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load coupons")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleViewDetails = (coupon) => {
    if (!isAuthenticated) {
      showToast("Please log in to view coupon details", "warning", 3000)
      return
    }
    // Use full coupon data if available and transform it with toCard
    const rawCoupon = fullCoupons[coupon.id]
    const fullCoupon = rawCoupon ? toCard(rawCoupon) : coupon
    setSelectedCoupon(fullCoupon)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedCoupon(null)
  }

  const resetFilters = () => {
    setFilters({
      platform: "All Platforms",
      category: "All Categories",
      discountType: "All Types",
      sortBy: "Latest",
      verifiedOnly: false,
      searchQuery: "",
    })
  }

  const filteredCoupons = coupons.filter((coupon) => {
    if (filters.platform !== "All Platforms" && coupon.platform !== filters.platform) return false
    if (filters.category !== "All Categories" && coupon.category !== filters.category) return false
    if (filters.discountType !== "All Types" && coupon.type !== filters.discountType) return false
    if (filters.verifiedOnly && !coupon.verified) return false
    if (
      filters.searchQuery &&
      !coupon.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
      !coupon.platformRaw.includes(filters.searchQuery.toLowerCase())
    )
      return false
    return true
  })

  return (
    <div className="browse-page">
      <Navbar />
      <ToastContainer />

      <main>
        {/* Page Header */}
        <section className="page-header">
          <div className="container">
            <h1>Browse Verified Discount Coupons & Offers</h1>
            <p>
              Discover verified coupons shared by real users. Earn reward points by listing coupons and redeem the ones
              you need.
            </p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="filters-section">
          <div className="container">
            <div className="filters-card">
              <div className="filters-top">
                <div className="search-bar">
                  <Search size={20} />
                  <input
                    type="text"
                    placeholder="Search coupons or platforms..."
                    value={filters.searchQuery}
                    onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
                  />
                </div>
                <button className="btn btn-secondary btn-filter-toggle" onClick={() => setShowFilters(!showFilters)}>
                  <Filter size={18} />
                  Filters
                  <ChevronDown size={16} className={showFilters ? "rotated" : ""} />
                </button>
              </div>

              <div className={`filters-grid ${showFilters ? "filters-open" : ""}`}>
                <div className="filter-group">
                  <label>Platform</label>
                  <select value={filters.platform} onChange={(e) => handleFilterChange("platform", e.target.value)}>
                    {platforms.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Category</label>
                  <select value={filters.category} onChange={(e) => handleFilterChange("category", e.target.value)}>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Discount Type</label>
                  <select
                    value={filters.discountType}
                    onChange={(e) => handleFilterChange("discountType", e.target.value)}
                  >
                    {discountTypes.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Sort By</label>
                  <select value={filters.sortBy} onChange={(e) => handleFilterChange("sortBy", e.target.value)}>
                    {sortOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group filter-toggle-group">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={filters.verifiedOnly}
                      onChange={(e) => handleFilterChange("verifiedOnly", e.target.checked)}
                    />
                    <span className="toggle-switch"></span>
                    Verified Only
                  </label>
                </div>

                <button className="btn btn-secondary btn-reset" onClick={resetFilters}>
                  <RefreshCw size={16} />
                  Reset
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Coupon Grid */}
        <section className="coupons-section">
          <div className="container">
            {loading ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <RefreshCw size={48} className="spin" />
                </div>
                <h3>Loading coupons...</h3>
              </div>
            ) : error ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Search size={48} />
                </div>
                <h3>Could not load coupons</h3>
                <p>{error}</p>
                <button
                  className="btn btn-primary"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw size={18} />
                  Retry
                </button>
              </div>
            ) : filteredCoupons.length > 0 ? (
              <div className="coupons-grid">
                {filteredCoupons.map((coupon) => {
                  const PlatformIcon = platformIcons[coupon.platform] || ShoppingBag
                  return (
                    <article key={coupon.id} className="coupon-card">
                      <div className="coupon-card-header">
                        <div className="platform-info">
                          <div className="platform-icon">
                            <PlatformIcon size={24} />
                          </div>
                          <span className="platform-name">{coupon.platform}</span>
                        </div>
                        <span className={`category-tag ${categoryColors[coupon.category]}`}>{coupon.category}</span>
                      </div>

                      <h3 className="coupon-title">{coupon.title}</h3>

                      <div className="coupon-meta">
                        <div className="trust-indicators">
                          {coupon.verified && (
                            <span className="verified-badge">
                              <CheckCircle size={14} />
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="validity">
                          <Clock size={14} />
                          {coupon.validity}
                        </div>
                      </div>

                      <div className="coupon-footer">
                        <div className="redeem-info">
                          <span className="points-cost">
                            <Coins size={16} />
                            Redeem for {coupon.redeemCost} Points
                          </span>
                          <span className="users-count">
                            <Users size={14} />
                            {coupon.usersRedeemed} redeemed
                          </span>
                        </div>
                        <button className="btn btn-primary btn-view" onClick={() => handleViewDetails(coupon)}>View Details</button>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <Search size={48} />
                </div>
                <h3>No coupons found matching your filters</h3>
                <p>Try removing some filters or search again.</p>
                <button className="btn btn-primary" onClick={resetFilters}>
                  <RefreshCw size={18} />
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Footer Note */}
        <section className="footer-note">
          <div className="container">
            <p>
              This is a community-powered coupon marketplace where users can list verified coupons and redeem them using
              reward points. Explore discount offers on food delivery, shopping, travel, recharges, subscriptions and
              more.
            </p>
          </div>
        </section>
      </main>

      {/* Coupon Detail Modal */}
      <CouponDetailModal coupon={selectedCoupon} isOpen={showModal} onClose={handleCloseModal} onShowToast={showToast} />

      <Footer />
    </div>
  )
}
