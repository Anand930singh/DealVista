import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { couponAPI } from "../../services/api"
import "./couponform.css"

export function CouponForm() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [formData, setFormData] = useState({
    proofScreenshotUrl: "",
    code: "",
    title: "",
    description: "",
    platform: "",
    category: "",
    discountType: "",
    discountValue: "",
    minOrderValue: "",
    maxDiscountValue: "",
    terms: "",
    validFrom: "",
    validTill: "",
    requiresUniqueUser: false,
    usageType: "single-use",
    geoRestriction: "",
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [imageError, setImageError] = useState("")
  const [toasts, setToasts] = useState([])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setImageError("File size must be less than 5MB")
        return
      }
      
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setImageError("Please upload a valid image file")
        return
      }

      setImageError("")
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        setFormData((prev) => ({
          ...prev,
          proofScreenshotUrl: reader.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const showToast = (message) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message }])
    
    // Auto remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 4000)
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Field name to user-friendly label mapping
    const fieldLabels = {
      proofScreenshotUrl: "Upload Coupon Image",
      code: "Coupon Code",
      title: "Title",
      platform: "Platform",
      category: "Category",
      discountType: "Discount Type",
      validFrom: "Valid From",
      validTill: "Valid Till",
    }

    // Check all required fields
    const requiredFields = [
      { key: "proofScreenshotUrl", label: fieldLabels.proofScreenshotUrl },
      { key: "code", label: fieldLabels.code },
      { key: "title", label: fieldLabels.title },
      { key: "platform", label: fieldLabels.platform },
      { key: "category", label: fieldLabels.category },
      { key: "discountType", label: fieldLabels.discountType },
      { key: "validFrom", label: fieldLabels.validFrom },
      { key: "validTill", label: fieldLabels.validTill },
    ]

    const missingFields = requiredFields.filter((field) => {
      const value = formData[field.key]
      return !value || value.trim() === ""
    })

    // Show toast for each missing field
    if (missingFields.length > 0) {
      missingFields.forEach((field) => {
        showToast(`${field.label} is mandatory`)
      })
      
      // Scroll to first missing field
      const firstMissingField = missingFields[0]
      if (firstMissingField.key === "proofScreenshotUrl") {
        setImageError("Please upload a coupon image")
        document.querySelector(".image-upload-section")?.scrollIntoView({ behavior: "smooth", block: "center" })
      } else {
        // Clear image error if it's not the first missing field
        setImageError("")
        const fieldElement = document.querySelector(`[name="${firstMissingField.key}"]`)
        if (fieldElement) {
          fieldElement.scrollIntoView({ behavior: "smooth", block: "center" })
          fieldElement.focus()
        }
      }
      return
    }

    // Clear any previous errors
    setImageError("")
    setSubmitError("")
    setIsSubmitting(true)

    try {
      // Prepare coupon data for API
      const couponPayload = {
        code: formData.code,
        title: formData.title,
        description: formData.description || "",
        platform: formData.platform,
        category: formData.category,
        discountType: formData.discountType,
        discountValue: formData.discountValue ? parseFloat(formData.discountValue) : null,
        minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : null,
        maxDiscountValue: formData.maxDiscountValue ? parseFloat(formData.maxDiscountValue) : null,
        terms: formData.terms || "",
        validFrom: formData.validFrom,
        validTill: formData.validTill,
        requiresUniqueUser: formData.requiresUniqueUser,
        usageType: formData.usageType,
        geoRestriction: formData.geoRestriction || "",
        proofScreenshotUrl: formData.proofScreenshotUrl,
      }

      // Call API to list coupon
      await couponAPI.listCoupon(couponPayload)
      
      setSubmitSuccess(true)
      showToast("Coupon listed successfully!")
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          proofScreenshotUrl: "",
          code: "",
          title: "",
          description: "",
          platform: "",
          category: "",
          discountType: "",
          discountValue: "",
          minOrderValue: "",
          maxDiscountValue: "",
          terms: "",
          validFrom: "",
          validTill: "",
          requiresUniqueUser: false,
          usageType: "single-use",
          geoRestriction: "",
        })
        setImagePreview(null)
        setSubmitSuccess(false)
        // Optionally redirect to browse page
        // navigate("/browse")
      }, 2000)
    } catch (error) {
      setSubmitError(error.message || "Failed to list coupon. Please try again.")
      showToast(error.message || "Failed to list coupon. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const platforms = [
    "Amazon",
    "Flipkart",
    "Swiggy",
    "Zomato",
    "GPay",
    "PhonePe",
    "Paytm",
    "Myntra",
    "Ajio",
    "BigBasket",
    "Other",
  ]
  const categories = [
    "Shopping",
    "Food & Dining",
    "Travel",
    "Electronics",
    "Fashion",
    "Groceries",
    "Entertainment",
    "Health & Beauty",
    "Services",
    "Other",
  ]
  const discountTypes = ["Percentage", "Flat", "Cashback", "Other"]

  return (
    <div className="list-coupon-page">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            <div className="toast-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <span className="toast-message">{toast.message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          <div className="form-header">
            <h1>List Your Coupon</h1>
            <p>Share your unused coupons and earn reward points</p>
          </div>

          <form className="coupon-form" onSubmit={handleSubmit}>
            {/* Image Upload Section - At Top */}
            <section className="form-section image-upload-section">
              <div className="section-header-with-icon">
                <div className="section-icon-wrapper">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17,8 12,3 7,8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="sparkle-icon"
                  >
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                  </svg>
                </div>
                <div>
                  <h2>
                    Upload Coupon Image <span className="required-asterisk">*</span>
                  </h2>
                  <p className="section-description">
                    Upload a clear image of your coupon. We'll automatically extract details like code, discount, validity, and platform to autofill the form below. You can review and edit any extracted information.
                  </p>
                </div>
              </div>

              <div className={`image-upload-wrapper ${imageError ? "has-error" : ""}`}>
                <label htmlFor="proofScreenshot" className="image-upload-label">
                  {imagePreview ? (
                    <div className="image-preview">
                      <img src={imagePreview || "/placeholder.svg"} alt="Coupon image" />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={(e) => {
                          e.preventDefault()
                          setImagePreview(null)
                          setFormData((prev) => ({ ...prev, proofScreenshotUrl: "" }))
                          setImageError("")
                          // Reset file input
                          const fileInput = document.getElementById("proofScreenshot")
                          if (fileInput) fileInput.value = ""
                        }}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="processing-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                        </svg>
                        Processing image...
                      </div>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <div className="upload-icon-wrapper">
                        <svg
                          width="56"
                          height="56"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17,8 12,3 7,8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="sparkle-overlay"
                        >
                          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                        </svg>
                      </div>
                      <span className="upload-text">Upload coupon image to auto-fill form</span>
                      <span className="upload-hint">We'll extract coupon code, discount, platform, and validity automatically</span>
                      <span className="upload-format">PNG, JPG up to 5MB</span>
                    </div>
                  )}
                </label>
                <input
                  type="file"
                  id="proofScreenshot"
                  name="proofScreenshot"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className={`image-input ${imageError ? "error" : ""}`}
                  required
                />
                {imageError && (
                  <div className="image-error-message">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {imageError}
                  </div>
                )}
              </div>
            </section>

            {/* Basic Info Section */}
            <section className="form-section">
              <h2>Basic Information</h2>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="code">
                    Coupon Code <span className="required-asterisk">*</span>
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., SAVE50"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="title">
                    Title <span className="required-asterisk">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Flat ₹100 OFF"
                    required
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe how to use this coupon..."
                  rows="3"
                />
              </div>
            </section>

            {/* Platform & Category Section */}
            <section className="form-section">
              <h2>Platform & Category</h2>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="platform">
                    Platform <span className="required-asterisk">*</span>
                  </label>
                  <select id="platform" name="platform" value={formData.platform} onChange={handleInputChange} required>
                    <option value="">Select platform</option>
                    {platforms.map((platform) => (
                      <option key={platform} value={platform.toLowerCase()}>
                        {platform}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="category">
                    Category <span className="required-asterisk">*</span>
                  </label>
                  <select id="category" name="category" value={formData.category} onChange={handleInputChange} required>
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category.toLowerCase()}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Discount Details Section */}
            <section className="form-section">
              <h2>Discount Details</h2>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="discountType">
                    Discount Type <span className="required-asterisk">*</span>
                  </label>
                  <select
                    id="discountType"
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select type</option>
                    {discountTypes.map((type) => (
                      <option key={type} value={type.toLowerCase()}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="discountValue">Discount Value</label>
                  <input
                    type="number"
                    id="discountValue"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    placeholder="e.g., 100 or 10"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="minOrderValue">Minimum Order Value</label>
                  <input
                    type="number"
                    id="minOrderValue"
                    name="minOrderValue"
                    value={formData.minOrderValue}
                    onChange={handleInputChange}
                    placeholder="e.g., 500"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="maxDiscountValue">Maximum Discount</label>
                  <input
                    type="number"
                    id="maxDiscountValue"
                    name="maxDiscountValue"
                    value={formData.maxDiscountValue}
                    onChange={handleInputChange}
                    placeholder="e.g., 200"
                  />
                </div>
              </div>
            </section>

            {/* Validity Section */}
            <section className="form-section">
              <h2>Validity Period</h2>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="validFrom">
                    Valid From <span className="required-asterisk">*</span>
                  </label>
                  <input
                    type="date"
                    id="validFrom"
                    name="validFrom"
                    value={formData.validFrom}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="validTill">
                    Valid Till <span className="required-asterisk">*</span>
                  </label>
                  <input
                    type="date"
                    id="validTill"
                    name="validTill"
                    value={formData.validTill}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Usage & Restrictions Section */}
            <section className="form-section">
              <h2>Usage & Restrictions</h2>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="usageType">Usage Type</label>
                  <select id="usageType" name="usageType" value={formData.usageType} onChange={handleInputChange}>
                    <option value="single-use">Single Use</option>
                    <option value="multi-use">Multi Use</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="geoRestriction">Geographic Restriction</label>
                  <input
                    type="text"
                    id="geoRestriction"
                    name="geoRestriction"
                    value={formData.geoRestriction}
                    onChange={handleInputChange}
                    placeholder="e.g., India, Mumbai only"
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="requiresUniqueUser"
                    checked={formData.requiresUniqueUser}
                    onChange={handleInputChange}
                  />
                  <span className="checkbox-custom"></span>
                  <span>First-time users only (new account required)</span>
                </label>
              </div>
            </section>

            {/* Terms & Conditions Section */}
            <section className="form-section">
              <h2>Terms & Conditions</h2>

              <div className="form-group full-width">
                <label htmlFor="terms">Additional Terms</label>
                <textarea
                  id="terms"
                  name="terms"
                  value={formData.terms}
                  onChange={handleInputChange}
                  placeholder="Any specific terms or conditions for using this coupon..."
                  rows="4"
                />
              </div>
            </section>

            {/* Reward Info */}
            <div className="reward-info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <p>
                You will earn <strong>5 reward points</strong> when your coupon is verified and listed!
              </p>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button type="button" className="btn btn-secondary btn-lg">
                Save as Draft
              </button>
              <button type="submit" className="btn btn-primary btn-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                List Coupon
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
