import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { Navbar } from "../../components/Navbar/Navbar"
import { Footer } from "../../components/Footer/Footer"
import { userAPI, logsAPI } from "../../services/api"
import { User, Mail, Calendar, Shield, TrendingUp, Gift, Activity, Clock, Package, CheckCircle, XCircle } from "lucide-react"
import "./profile.css"

export function Profile() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState(null)
  const [stats, setStats] = useState(null)
  const [couponsAdded, setCouponsAdded] = useState([])
  const [couponsRedeemed, setCouponsRedeemed] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [activeTab, setActiveTab] = useState("added") // "added" or "redeemed"

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth")
      return
    }

    fetchProfileData()
  }, [isAuthenticated, navigate])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [profileRes, statsRes, addedRes, redeemedRes, logsRes] = await Promise.all([
        userAPI.getUserProfile(),
        userAPI.getUserStats(),
        userAPI.getCouponsAdded(),
        userAPI.getCouponsRedeemed(),
        logsAPI.getAllLogs()
      ])
      
      setProfileData(profileRes)
      setStats(statsRes)
      setCouponsAdded(addedRes)
      setCouponsRedeemed(redeemedRes)
      setRecentActivities(formatActivities(logsRes.slice(0, 15)))
    } catch (error) {
      console.error("Failed to fetch profile data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Recently"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const formatShortDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const formatActivities = (logs) => {
    return logs.map(log => ({
      id: log.id,
      type: getActivityType(log.description),
      title: getActivityTitle(log.description),
      description: log.description,
      time: getTimeAgo(log.timestamp),
    }))
  }

  const getActivityType = (description) => {
    if (description?.includes("Redeemed coupon")) return "redeemed"
    if (description?.includes("Listed coupon")) return "added"
    if (description?.includes("reward points")) return "points"
    return "activity"
  }

  const getActivityTitle = (description) => {
    if (description?.includes("Redeemed coupon")) return "Coupon Redeemed"
    if (description?.includes("Listed coupon")) return "Coupon Added"
    if (description?.includes("reward points")) return "Points Earned"
    return "Activity"
  }

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "Recently"
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 30) return `${diffDays}d ago`
    return formatShortDate(timestamp)
  }

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <main className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="profile-page">
      <Navbar />
      
      <main className="profile-main">
        <div className="container">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              <span>{profileData?.fullName?.charAt(0).toUpperCase() || "U"}</span>
            </div>
            <div className="profile-info">
              <h1>{profileData?.fullName}</h1>
              <div className="profile-badges">
                {profileData?.role === "ADMIN" && (
                  <span className="badge badge-admin">
                    <Shield size={14} />
                    Admin
                  </span>
                )}
                <span className="badge badge-member">
                  <Calendar size={14} />
                  Joined {formatDate(profileData?.createdAt)}
                </span>
              </div>
              <div className="profile-details">
                <div className="profile-detail">
                  <Mail size={16} />
                  <span>{profileData?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">
                <Gift size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats?.couponsAdded || 0}</div>
                <div className="stat-label">Coupons Added</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-green">
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats?.couponsRedeemed || 0}</div>
                <div className="stat-label">Coupons Redeemed</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-gold">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats?.currentPoints || 0}</div>
                <div className="stat-label">Current Points</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-purple">
                <Activity size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats?.totalPointsEarned || 0}</div>
                <div className="stat-label">Total Points Earned</div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="profile-content-grid">
            {/* Coupons Section */}
            <div className="coupons-section">
              <div className="section-header">
                <h2>My Coupons</h2>
                <Package size={20} />
              </div>
              
              {/* Tabs */}
              <div className="coupon-tabs">
                <button 
                  className={`tab ${activeTab === "added" ? "active" : ""}`}
                  onClick={() => setActiveTab("added")}
                >
                  <Gift size={18} />
                  Added ({couponsAdded.length})
                </button>
                <button 
                  className={`tab ${activeTab === "redeemed" ? "active" : ""}`}
                  onClick={() => setActiveTab("redeemed")}
                >
                  <CheckCircle size={18} />
                  Redeemed ({couponsRedeemed.length})
                </button>
              </div>

              {/* Coupon List */}
              <div className="coupon-list">
                {activeTab === "added" && (
                  couponsAdded.length === 0 ? (
                    <div className="empty-state">
                      <Gift size={48} />
                      <p>No coupons added yet</p>
                      <button className="btn btn-primary btn-sm" onClick={() => navigate("/upload")}>
                        Add Your First Coupon
                      </button>
                    </div>
                  ) : (
                    couponsAdded.map((coupon) => (
                      <div key={coupon.id} className="coupon-item">
                        <div className="coupon-item-header">
                          <div className="coupon-item-title">
                            <h3>{coupon.title}</h3>
                            <span className="coupon-platform">{coupon.platform}</span>
                          </div>
                          <span className={`coupon-status ${coupon.isActive ? "active" : "inactive"}`}>
                            {coupon.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="coupon-item-details">
                          <div className="coupon-detail">
                            <span className="label">Code:</span>
                            <code className="coupon-code">{coupon.code}</code>
                          </div>
                          <div className="coupon-detail">
                            <span className="label">Category:</span>
                            <span>{coupon.category || "General"}</span>
                          </div>
                          <div className="coupon-detail">
                            <span className="label">Valid Till:</span>
                            <span>{formatShortDate(coupon.validTill)}</span>
                          </div>
                          <div className="coupon-detail">
                            <span className="label">Usage:</span>
                            <span>{coupon.soldQuantity} / {coupon.totalQuantity}</span>
                          </div>
                        </div>
                        <div className="coupon-item-footer">
                          <span className="coupon-date">Added {formatShortDate(coupon.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  )
                )}

                {activeTab === "redeemed" && (
                  couponsRedeemed.length === 0 ? (
                    <div className="empty-state">
                      <CheckCircle size={48} />
                      <p>No coupons redeemed yet</p>
                      <button className="btn btn-primary btn-sm" onClick={() => navigate("/browse")}>
                        Browse Coupons
                      </button>
                    </div>
                  ) : (
                    couponsRedeemed.map((coupon) => (
                      <div key={coupon.redemptionId} className="coupon-item redeemed">
                        <div className="coupon-item-header">
                          <div className="coupon-item-title">
                            <h3>{coupon.title}</h3>
                            <span className="coupon-platform">{coupon.platform}</span>
                          </div>
                          <span className="points-deducted">
                            -{coupon.pointsDeducted} pts
                          </span>
                        </div>
                        <div className="coupon-item-details">
                          <div className="coupon-detail">
                            <span className="label">Code:</span>
                            <code className="coupon-code">{coupon.code}</code>
                          </div>
                          <div className="coupon-detail">
                            <span className="label">Category:</span>
                            <span>{coupon.category || "General"}</span>
                          </div>
                        </div>
                        <div className="coupon-item-footer">
                          <span className="coupon-date">Redeemed {formatShortDate(coupon.redeemedAt)}</span>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="sidebar-section">
              {/* Rewards Card */}
              <div className="rewards-card">
                <div className="rewards-header">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span>Reward Points</span>
                </div>
                <div className="rewards-balance">{stats?.currentPoints || 0}</div>
                <div className="rewards-label">Available Points</div>
                <div className="rewards-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${Math.min(((stats?.currentPoints || 0) / 10000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="progress-label">
                    {(stats?.currentPoints || 0) < 10000 
                      ? `${10000 - (stats?.currentPoints || 0)} points to 10K milestone`
                      : "Milestone achieved!"}
                  </div>
                </div>
                <div className="rewards-actions">
                  <button className="btn btn-primary btn-block" onClick={() => navigate("/browse")}>
                    Browse Coupons
                  </button>
                  <button className="btn btn-secondary btn-block" onClick={() => navigate("/upload")}>
                    Add Coupon
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="quick-stats">
                <h3>Quick Stats</h3>
                <div className="quick-stat-item">
                  <span>Points earned</span>
                  <strong>+{stats?.totalPointsEarned || 0} pts</strong>
                </div>
                <div className="quick-stat-item">
                  <span>Points spent</span>
                  <strong>-{stats?.totalPointsSpent || 0} pts</strong>
                </div>
                <div className="quick-stat-item">
                  <span>Total coupons</span>
                  <strong>{(stats?.couponsAdded || 0) + (stats?.couponsRedeemed || 0)}</strong>
                </div>
                <div className="quick-stat-item">
                  <span>Success rate</span>
                  <strong>
                    {(stats?.couponsAdded || 0) > 0 
                      ? Math.round(((stats?.couponsRedeemed || 0) / (stats?.couponsAdded || 1)) * 100) 
                      : 0}%
                  </strong>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="activity-section compact">
                <div className="section-header">
                  <h3>Recent Activity</h3>
                  <Clock size={18} />
                </div>
                <div className="activity-list">
                  {recentActivities.length === 0 ? (
                    <div className="empty-state small">
                      <Activity size={32} />
                      <p>No recent activity</p>
                    </div>
                  ) : (
                    recentActivities.slice(0, 8).map((activity) => (
                      <div key={activity.id} className="activity-item compact">
                        <div className={`activity-icon activity-${activity.type}`}>
                          {activity.type === "redeemed" && <TrendingUp size={14} />}
                          {activity.type === "added" && <Gift size={14} />}
                          {activity.type === "points" && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          )}
                          {activity.type === "activity" && <Activity size={14} />}
                        </div>
                        <div className="activity-content">
                          <div className="activity-title">{activity.title}</div>
                          <div className="activity-time">{activity.time}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { Navbar } from "../../components/Navbar/Navbar"
import { Footer } from "../../components/Footer/Footer"
import { userAPI, logsAPI, couponAPI } from "../../services/api"
import { User, Mail, Calendar, Shield, TrendingUp, Gift, Activity, Clock } from "lucide-react"
import "./profile.css"

export function Profile() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState(null)
  const [stats, setStats] = useState({
    totalCouponsAdded: 0,
    totalCouponsRedeemed: 0,
    currentPoints: 0,
    totalPointsEarned: 0,
  })
  const [recentActivities, setRecentActivities] = useState([])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth")
      return
    }

    fetchProfileData()
  }, [isAuthenticated, navigate])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      
      // Fetch user points
      const pointsResponse = await userAPI.getUserPoints()
      
      // Fetch recent activities (logs)
      const logsResponse = await logsAPI.getAllLogs()
      
      setProfileData({
        name: user.fullName || "User",
        email: user.email,
        role: user.role || "USER",
        joinedDate: formatDate(user.createdAt),
      })

      setStats({
        totalCouponsAdded: calculateCouponsAdded(logsResponse),
        totalCouponsRedeemed: calculateCouponsRedeemed(logsResponse),
        currentPoints: pointsResponse.points || 0,
        totalPointsEarned: calculateTotalPointsEarned(logsResponse),
      })

      setRecentActivities(formatActivities(logsResponse.slice(0, 10)))
    } catch (error) {
      console.error("Failed to fetch profile data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Recently"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const calculateCouponsAdded = (logs) => {
    return logs.filter(log => log.description?.includes("Listed coupon")).length
  }

  const calculateCouponsRedeemed = (logs) => {
    return logs.filter(log => log.description?.includes("Redeemed coupon")).length
  }

  const calculateTotalPointsEarned = (logs) => {
    let total = 0
    logs.forEach(log => {
      if (log.description?.includes("reward points")) {
        const match = log.description.match(/(\d+)\s+reward points/)
        if (match) total += parseInt(match[1])
      }
    })
    return total
  }

  const formatActivities = (logs) => {
    return logs.map(log => ({
      id: log.id,
      type: getActivityType(log.description),
      title: getActivityTitle(log.description),
      description: log.description,
      time: getTimeAgo(log.timestamp),
    }))
  }

  const getActivityType = (description) => {
    if (description?.includes("Redeemed coupon")) return "redeemed"
    if (description?.includes("Listed coupon")) return "added"
    if (description?.includes("reward points")) return "points"
    return "activity"
  }

  const getActivityTitle = (description) => {
    if (description?.includes("Redeemed coupon")) return "Coupon Redeemed"
    if (description?.includes("Listed coupon")) return "Coupon Added"
    if (description?.includes("reward points")) return "Points Earned"
    return "Activity"
  }

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "Recently"
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <main className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="profile-page">
      <Navbar />
      
      <main className="profile-main">
        <div className="container">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              <span>{profileData?.name?.charAt(0).toUpperCase() || "U"}</span>
            </div>
            <div className="profile-info">
              <h1>{profileData?.name}</h1>
              <div className="profile-badges">
                {profileData?.role === "ADMIN" && (
                  <span className="badge badge-admin">
                    <Shield size={14} />
                    Admin
                  </span>
                )}
                <span className="badge badge-member">
                  <Calendar size={14} />
                  Joined {profileData?.joinedDate}
                </span>
              </div>
              <div className="profile-details">
                <div className="profile-detail">
                  <Mail size={16} />
                  <span>{profileData?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">
                <Gift size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalCouponsAdded}</div>
                <div className="stat-label">Coupons Added</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-green">
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalCouponsRedeemed}</div>
                <div className="stat-label">Coupons Redeemed</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-gold">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.currentPoints}</div>
                <div className="stat-label">Current Points</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-purple">
                <Activity size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalPointsEarned}</div>
                <div className="stat-label">Total Points Earned</div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="profile-content-grid">
            {/* Recent Activity */}
            <div className="activity-section">
              <div className="section-header">
                <h2>Recent Activity</h2>
                <Clock size={20} />
              </div>
              <div className="activity-list">
                {recentActivities.length === 0 ? (
                  <div className="empty-state">
                    <Activity size={48} />
                    <p>No recent activity</p>
                  </div>
                ) : (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className={`activity-icon activity-${activity.type}`}>
                        {activity.type === "redeemed" && <TrendingUp size={18} />}
                        {activity.type === "added" && <Gift size={18} />}
                        {activity.type === "points" && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        )}
                        {activity.type === "activity" && <Activity size={18} />}
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">{activity.title}</div>
                        <div className="activity-description">{activity.description}</div>
                      </div>
                      <div className="activity-time">{activity.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Rewards Card */}
            <div className="rewards-section">
              <div className="rewards-card">
                <div className="rewards-header">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span>Reward Points</span>
                </div>
                <div className="rewards-balance">{stats.currentPoints}</div>
                <div className="rewards-label">Available Points</div>
                <div className="rewards-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${Math.min((stats.currentPoints / 10000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="progress-label">
                    {stats.currentPoints < 10000 
                      ? `${10000 - stats.currentPoints} points to next milestone`
                      : "Milestone achieved!"}
                  </div>
                </div>
                <div className="rewards-actions">
                  <button className="btn btn-primary btn-block" onClick={() => navigate("/browse")}>
                    Browse Coupons
                  </button>
                  <button className="btn btn-secondary btn-block" onClick={() => navigate("/upload")}>
                    Add Coupon
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="quick-stats">
                <h3>Quick Stats</h3>
                <div className="quick-stat-item">
                  <span>Points per coupon</span>
                  <strong>+5 pts</strong>
                </div>
                <div className="quick-stat-item">
                  <span>Total contributions</span>
                  <strong>{stats.totalCouponsAdded} coupons</strong>
                </div>
                <div className="quick-stat-item">
                  <span>Success rate</span>
                  <strong>
                    {stats.totalCouponsAdded > 0 
                      ? Math.round((stats.totalCouponsRedeemed / stats.totalCouponsAdded) * 100) 
                      : 0}%
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
