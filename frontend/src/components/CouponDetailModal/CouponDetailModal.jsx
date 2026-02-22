import { useState } from "react"
import { X, Eye, EyeOff, Copy, CheckCircle, Clock, Coins, AlertCircle, FileText, Tag, Lock, Globe, DollarSign } from "lucide-react"
import { couponAPI } from "../../services/api"
import "./coupondetailmodal.css"

export function CouponDetailModal({ coupon, isOpen, onClose, onShowToast }) {
  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isDeductingPoints, setIsDeductingPoints] = useState(false)
  const [showConfirmPopup, setShowConfirmPopup] = useState(false)

  if (!isOpen || !coupon) return null

  const handleRevealCode = () => {
    if (showCode) {
      // User is hiding the code, just toggle
      setShowCode(false)
      return
    }

    // Show confirmation popup before revealing code
    setShowConfirmPopup(true)
  }

  const handleConfirmReveal = async () => {
    setShowConfirmPopup(false)
    
    // User confirmed - reveal the code and deduct points
    setIsDeductingPoints(true)
    try {
      await couponAPI.viewCouponCode(coupon.id)
      setShowCode(true)
      if (onShowToast) {
        onShowToast(`${coupon.redeemCost} points deducted! Coupon code revealed.`, "info")
      }
    } catch (error) {
      if (onShowToast) {
        onShowToast(
          error.message || "Failed to reveal code. You may not have enough points.",
          "error"
        )
      }
    } finally {
      setIsDeductingPoints(false)
    }
  }

  const handleCancelReveal = () => {
    setShowConfirmPopup(false)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const displayCode = showCode ? coupon.code : "*".repeat(coupon.code?.length || 8)

  // Helper function to format values
  const formatValue = (value) => {
    if (value === null || value === undefined) return "N/A"
    if (typeof value === "boolean") return value ? "Yes" : "No"
    return String(value)
  }

  return (
    <>
      {/* Confirmation Popup */}
      {showConfirmPopup && (
        <>
          <div className="confirmation-overlay" onClick={handleCancelReveal}></div>
          <div className="confirmation-popup">
            <div className="confirmation-header">
              <AlertCircle size={48} color="#f59e0b" />
              <h3>Confirm Point Deduction</h3>
            </div>
            <div className="confirmation-body">
              <p>
                Viewing this coupon code will deduct{" "}
                <strong>{coupon.redeemCost} points</strong> from your balance.
              </p>
              <p className="confirmation-subtitle">
                Do you want to continue?
              </p>
            </div>
            <div className="confirmation-actions">
              <button 
                className="btn-cancel" 
                onClick={handleCancelReveal}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm" 
                onClick={handleConfirmReveal}
              >
                Confirm & View Code
              </button>
            </div>
          </div>
        </>
      )}

      {/* Overlay */}
      <div className="modal-overlay" onClick={onClose}></div>

      {/* Modal */}
      <div className="coupon-detail-modal">
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-content">
          {/* Modal Header */}
          <div className="modal-header">
            <h2>{coupon.title}</h2>
            <div className="modal-badges">
              {coupon.verified && (
                <span className="badge badge-verified">
                  <CheckCircle size={14} />
                  Verified
                </span>
              )}
              <span className="badge badge-category">{coupon.category}</span>
            </div>
          </div>

          {/* Modal Body */}
          <div className="modal-body">
            {/* Offer Details Grid - Consolidated */}
            <div className="details-section">
              <div className="details-grid">
                {coupon.platform && (
                  <div className="detail-item">
                    <label>Platform</label>
                    <p className="detail-value">{coupon.platform}</p>
                  </div>
                )}

                {coupon.type && (
                  <div className="detail-item">
                    <label>Discount Type</label>
                    <p className="detail-value">{coupon.type}</p>
                  </div>
                )}

                {coupon.discountValue && (
                  <div className="detail-item">
                    <label>Discount</label>
                    <p className="detail-value">{formatValue(coupon.discountValue)}</p>
                  </div>
                )}

                {coupon.minOrderValue && (
                  <div className="detail-item">
                    <label>Min Order</label>
                    <p className="detail-value">₹{formatValue(coupon.minOrderValue)}</p>
                  </div>
                )}

                {coupon.maxDiscountValue && (
                  <div className="detail-item">
                    <label>Max Discount</label>
                    <p className="detail-value">₹{formatValue(coupon.maxDiscountValue)}</p>
                  </div>
                )}

                {coupon.validTill && (
                  <div className="detail-item">
                    <label>Valid Till</label>
                    <div className="detail-value">
                      <Clock size={14} />
                      {formatValue(coupon.validTill)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Coupon Code Section */}
            <div className="coupon-code-section">
              <label>✨ Coupon Code</label>
              <div className="code-display">
                <div className="code-wrapper">
                  <span className="code-text">{displayCode}</span>
                </div>
                <button
                  className="btn-reveal"
                  onClick={handleRevealCode}
                  disabled={isDeductingPoints}
                  title={showCode ? "Hide code" : "Reveal code (costs 5 points)"}
                >
                  {isDeductingPoints ? (
                    <span>...</span>
                  ) : showCode ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
                <button
                  className={`btn-copy ${copied ? "copied" : ""}`}
                  onClick={handleCopyCode}
                  title="Copy to clipboard"
                >
                  <Copy size={18} />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Description Section */}
            {coupon.description && (
              <div className="description-section">
                <h3 className="section-title">Description</h3>
                <p className="description-text">{coupon.description}</p>
              </div>
            )}

            {/* Terms & Conditions Section */}
            {coupon.termsConditions && (
              <div className="terms-section">
                <h3 className="section-title">Terms & Conditions</h3>
                <p className="terms-text">{coupon.termsConditions}</p>
              </div>
            )}

            {/* Additional Details - Compact */}
            {(coupon.usageType || coupon.geoRestriction || coupon.requiresUniqueUser) && (
              <div className="compact-info">
                <div className="info-grid">
                  {coupon.usageType && (
                    <div className="info-item">
                      <span className="info-label">Usage:</span>
                      <span className="info-value">{formatValue(coupon.usageType)}</span>
                    </div>
                  )}
                  {coupon.geoRestriction && (
                    <div className="info-item">
                      <span className="info-label">Geo:</span>
                      <span className="info-value">{formatValue(coupon.geoRestriction)}</span>
                    </div>
                  )}
                  {coupon.requiresUniqueUser !== undefined && (
                    <div className="info-item">
                      <span className="info-label">Unique User:</span>
                      <span className="info-value">{formatValue(coupon.requiresUniqueUser)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
