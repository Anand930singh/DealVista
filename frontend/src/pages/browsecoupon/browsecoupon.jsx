import "./browsecoupon.css"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Navbar } from "../../components/Navbar/Navbar"
import { Footer } from "../../components/Footer/Footer"
import { CouponDetailModal } from "../../components/CouponDetailModal/CouponDetailModal"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../components/Toast/Toast"
import { couponAPI } from "../../services/api"
import { setPageMeta, SEO } from "../../services/seo"
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
    redeemCost: c.redeemCost,
    
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
  const navigate = useNavigate()
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
    verifiedOnly: true,
    searchQuery: "",
  })
  const [appliedFilters, setAppliedFilters] = useState({
    platform: "All Platforms",
    category: "All Categories",
    discountType: "All Types",
    searchQuery: "",
  })
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalItems: 0,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setPageMeta(SEO.browse.title, SEO.browse.description, SEO.browse.canonical)
  }, [])

  const fetchCoupons = (filterParams = {}, page = 0) => {
    setLoading(true)
    setError(null)
    
    const apiFilters = { activeOnly: true, page, size: 10 }
    
    // Only include non-empty filter values
    if (filterParams.platform && filterParams.platform !== "All Platforms") {
      apiFilters.platform = filterParams.platform.trim()
    }
    if (filterParams.category && filterParams.category !== "All Categories") {
      apiFilters.category = filterParams.category.trim()
    }
    if (filterParams.discountType && filterParams.discountType !== "All Types") {
      // Map frontend display values to backend enum values
      const typeMap = {
        "Flat Discount": "FLAT",
        "Percentage": "PERCENTAGE",
        "Cashback": "CASHBACK",
        "BOGO": "BOGO"
      }
      const mappedType = typeMap[filterParams.discountType] || filterParams.discountType
      if (mappedType) {
        apiFilters.discountType = mappedType
      }
    }
    if (filterParams.searchQuery && filterParams.searchQuery.trim()) {
      apiFilters.search = filterParams.searchQuery.trim()
    }

    couponAPI
      .browseCoupons(apiFilters)
      .then((data) => {
        if (data && data.coupons && Array.isArray(data.coupons)) {
          const fullCouponsMap = {}
          const cardCoupons = data.coupons.map((c) => {
            fullCouponsMap[c.id] = c
            return toCard(c)
          })
          setCoupons(cardCoupons)
          setFullCoupons(fullCouponsMap)
          setPagination({
            currentPage: data.currentPage,
            totalPages: data.totalPages,
            totalItems: data.totalItems,
            pageSize: data.pageSize,
            hasNext: data.hasNext,
            hasPrevious: data.hasPrevious,
          })
        } else {
          setCoupons([])
          setPagination({
            currentPage: 0,
            totalPages: 0,
            totalItems: 0,
            pageSize: 10,
            hasNext: false,
            hasPrevious: false,
          })
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load coupons")
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    // Initial fetch with empty filters to load all active coupons
    fetchCoupons({}, 0)
  }, [])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    setAppliedFilters({
      platform: filters.platform,
      category: filters.category,
      discountType: filters.discountType,
      searchQuery: filters.searchQuery,
    })
    fetchCoupons(filters, 0)
  }

  const handlePageChange = (newPage) => {
    fetchCoupons(appliedFilters, newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleViewDetails = async (coupon) => {
    if (!isAuthenticated) {
      showToast("Please log in to view coupon details", "warning", 3000)
      return
    }
    
    // Fetch full coupon details with code from backend
    try {
      setLoading(true)
      const fullCouponData = await couponAPI.getCouponById(coupon.id)
      const fullCoupon = toCard(fullCouponData)
      setSelectedCoupon(fullCoupon)
      setShowModal(true)
    } catch (err) {
      showToast(err.message || "Failed to load coupon details", "error", 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleListCoupon = () => {
    if (!isAuthenticated) {
      // Store redirect intent
      sessionStorage.setItem("redirectAfterLogin", "/upload")
      navigate("/auth")
      return
    }
    navigate("/upload")
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedCoupon(null)
  }

  const resetFilters = () => {
    const defaultFilters = {
      platform: "All Platforms",
      category: "All Categories",
      discountType: "All Types",
      sortBy: "Latest",
      verifiedOnly: true,
      searchQuery: "",
    }
    setFilters(defaultFilters)
    setAppliedFilters({
      platform: "All Platforms",
      category: "All Categories",
      discountType: "All Types",
      searchQuery: "",
    })
    fetchCoupons({ platform: "All Platforms", category: "All Categories", discountType: "All Types", searchQuery: "" }, 0)
  }

  // Apply frontend-only filters (verified, sort) - backend handles the rest
  const filteredCoupons = coupons
    .filter((coupon) => {
      if (filters.verifiedOnly && !coupon.verified) return false
      return true
    })
    .sort((a, b) => {
      // Frontend sorting since backend returns latest first by default
      if (filters.sortBy === "Expiring Soon") {
        const dateA = a.validTill ? new Date(a.validTill).getTime() : Infinity
        const dateB = b.validTill ? new Date(b.validTill).getTime() : Infinity
        return dateA - dateB
      }
      // "Latest" and "Most Popular" use default order from backend
      return 0
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
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search coupons or platforms..."
                    value={filters.searchQuery}
                    onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
                  />
                </div>
                <button className="btn btn-secondary btn-filter-toggle" onClick={() => setShowFilters(!showFilters)}>
                  <Filter size={14} />
                  Filters
                  <ChevronDown size={14} className={showFilters ? "rotated" : ""} />
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
                  <RefreshCw size={14} />
                  Reset
                </button>

                <button className="btn btn-primary btn-apply-filter" onClick={applyFilters}>
                  <Filter size={14} />
                  Apply
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

            {/* Pagination */}
            {!loading && !error && filteredCoupons.length > 0 && pagination.totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  Showing {pagination.currentPage * pagination.pageSize + 1} - {Math.min((pagination.currentPage + 1) * pagination.pageSize, pagination.totalItems)} of {pagination.totalItems} coupons
                </div>
                <div className="pagination-controls">
                  <button 
                    className="btn btn-secondary pagination-btn"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevious}
                  >
                    Previous
                  </button>
                  <div className="pagination-pages">
                    {[...Array(pagination.totalPages)].map((_, index) => (
                      <button
                        key={index}
                        className={`pagination-page ${pagination.currentPage === index ? 'active' : ''}`}
                        onClick={() => handlePageChange(index)}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  <button 
                    className="btn btn-secondary pagination-btn"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                  >
                    Next
                  </button>
                </div>
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
