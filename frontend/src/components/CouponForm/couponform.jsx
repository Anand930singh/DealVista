import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { couponAPI, extractAPI } from "../../services/api"
import "./couponform.css"
import { createWorker } from "tesseract.js"

export function CouponForm() {
  const navigate = useNavigate()
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
  const [imagePreviewUrls, setImagePreviewUrls] = useState([])
  const [uploadedImageFiles, setUploadedImageFiles] = useState([])
  const [imagePreview, setImagePreview] = useState(null)
  const [extractedTexts, setExtractedTexts] = useState([])
  const [isProcessingImages, setIsProcessingImages] = useState(false)
  const [imageError, setImageError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isAutoFilling, setIsAutoFilling] = useState(false)
  const [toasts, setToasts] = useState([])

  const parseImageToText = async (image) => {
    let worker
    try {
      worker = await createWorker("eng")
      const recognizePromise = worker.recognize(image)
      const timeoutMs = 45000 // 45s per image so OCR doesn't hang forever
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("OCR timeout")), timeoutMs)
      )
      const ret = await Promise.race([recognizePromise, timeoutPromise])
      return ret?.data?.text ?? ""
    } catch (err) {
      return ""
    } finally {
      if (worker) await worker.terminate()
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleImageUpload = async (e) => {
    const files = e.target.files
    if (!files?.length) return

    const fileList = Array.from(files)
    for (const file of fileList) {
      if (file.size > 5 * 1024 * 1024) {
        setImageError("File size must be less than 5MB")
        return
      }
      if (!file.type.startsWith("image/")) {
        setImageError("Please upload a valid image file")
        return
      }
    }

    setImageError("")
    setImagePreviewUrls((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url))
      return []
    })
    const previewUrls = fileList.map((f) => URL.createObjectURL(f))
    setImagePreviewUrls(previewUrls)
    setUploadedImageFiles(fileList)

    // Form: set first image for preview and proof immediately (so UI doesn't feel stuck)
    const firstFile = fileList[0]
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
      setFormData((prev) => ({
        ...prev,
        proofScreenshotUrl: reader.result,
      }))
    }
    reader.readAsDataURL(firstFile)

    // Run OCR in background; always clear processing state so spinner never gets stuck
    setIsProcessingImages(true)
    try {
      const texts = []
      for (const file of fileList) {
        const text = await parseImageToText(file)
        texts.push(text ?? "")
      }
      setExtractedTexts(texts)
    } catch (err) {
      setExtractedTexts(fileList.map(() => ""))
    } finally {
      setIsProcessingImages(false)
    }
  }

  const showToast = (message, type = "error") => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 4000)
  }

  const handleAutoFill = async () => {
    const combinedText = (extractedTexts || []).filter(Boolean).join("\n\n").trim()
    if (!combinedText) {
      showToast("Wait for image processing to finish, or upload an image first.")
      return
    }
    setIsAutoFilling(true)
    setImageError("")
    try {
      const { result } = await extractAPI.extractFromText(combinedText)
      if (!result) {
        showToast("Could not extract coupon details. Try a clearer image.")
        return
      }
      setFormData((prev) => {
        let next = { ...prev }
        const r = result

        if (r.title != null && r.title !== "") next.title = r.title
        if (r.description != null && r.description !== "") next.description = r.description
        if (r.code != null && r.code !== "") next.code = r.code
        if (r.platform != null && r.platform !== "") next.platform = String(r.platform).toLowerCase()
        if (r.category != null && r.category !== "") next.category = String(r.category).toLowerCase()
        if (r.discountType != null && r.discountType !== "") next.discountType = String(r.discountType).toLowerCase()
        if (r.discountValue != null) next.discountValue = r.discountValue === "" ? "" : String(r.discountValue)
        if (r.minOrderValue != null) next.minOrderValue = r.minOrderValue === "" ? "" : String(r.minOrderValue)
        if (r.maxDiscountValue != null) next.maxDiscountValue = r.maxDiscountValue === "" ? "" : String(r.maxDiscountValue)
        if (r.validFrom != null && r.validFrom !== "") next.validFrom = r.validFrom
        if (r.validTill != null && r.validTill !== "") next.validTill = r.validTill
        if (typeof r.requiresUniqueUser === "boolean") next.requiresUniqueUser = r.requiresUniqueUser
        if (r.usageType != null && r.usageType !== "") {
          const u = String(r.usageType).toUpperCase().replace(/-/g, "_")
          next.usageType = u === "SINGLE_USE" ? "single-use" : u === "MULTI_USE" || u === "UNLIMITED" ? "multi-use" : prev.usageType
        }
        if (r.geoRestriction != null && r.geoRestriction !== "") next.geoRestriction = r.geoRestriction
        if (r.terms != null && r.terms !== "") next.terms = r.terms
        return next
      })
      showToast("Form auto-filled from coupon image. Review and edit as needed.", "success")
    } catch (err) {
      showToast(err.message || "Auto-fill failed. Try again or enter details manually.", "error")
    } finally {
      setIsAutoFilling(false)
    }
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
      // Prepare coupon data for API (backend expects enum discountType: FLAT | PERCENTAGE)
      const discountTypeForApi =
        formData.discountType === "flat" || formData.discountType === "percentage"
          ? formData.discountType.toUpperCase()
          : null
      const couponPayload = {
        code: formData.code || null,
        title: formData.title,
        description: formData.description || "",
        platform: formData.platform || null,
        category: formData.category || null,
        discountType: discountTypeForApi,
        discountValue: formData.discountValue ? parseFloat(formData.discountValue) : null,
        minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : null,
        maxDiscountValue: formData.maxDiscountValue ? parseFloat(formData.maxDiscountValue) : null,
        terms: formData.terms || "",
        validFrom: formData.validFrom || null,
        validTill: formData.validTill || null,
        requiresUniqueUser: formData.requiresUniqueUser ?? false,
        usageType: formData.usageType || "single-use",
        geoRestriction: formData.geoRestriction || "",
        isActive: true,
        totalQuantity: 1,
        price: null,
        isFree: true,
      }

      // Call API to list coupon
      await couponAPI.listCoupon(couponPayload)
      
      setSubmitSuccess(true)
      showToast("Coupon listed successfully!", "success")
      
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
        setImagePreviewUrls((prev) => {
          prev.forEach((url) => URL.revokeObjectURL(url))
          return []
        })
        setImagePreview(null)
        setUploadedImageFiles([])
        setExtractedTexts([])
        setSubmitSuccess(false)
        // Optionally redirect to browse page
        // navigate("/browse")
      }, 2000)
    } catch (error) {
      let errorMessage = "Failed to list coupon. Please try again."
      
      // Try to extract error message from backend response
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setSubmitError(errorMessage)
      showToast(errorMessage, "error")
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
          <div key={toast.id} className={`toast toast-${toast.type || "error"}`}>
            <div className="toast-icon">
              {toast.type === "success" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
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
                  {imagePreviewUrls.length > 0 ? (
                    <div className="image-preview-grid">
                      <div className="image-preview-grid-inner">
                        {imagePreviewUrls.map((url, index) => (
                          <div key={index} className="image-preview-item">
                            <img src={url} alt={`Coupon ${index + 1}`} />
                            <span className="image-preview-index">{index + 1}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={(e) => {
                          e.preventDefault()
                          imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url))
                          setImagePreviewUrls([])
                          setImagePreview(null)
                          setUploadedImageFiles([])
                          setExtractedTexts([])
                          setFormData((prev) => ({ ...prev, proofScreenshotUrl: "" }))
                          setImageError("")
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
                      {isProcessingImages && (
                        <div className="processing-badge is-processing">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                          </svg>
                          Processing images...
                        </div>
                      )}
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
                  multiple
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

            {/* Auto Fill Form - between upload and form */}
            {imagePreviewUrls.length > 0 && (
              <div className="autofill-form-actions">
                <button
                  type="button"
                  className="btn btn-autofill"
                  onClick={handleAutoFill}
                  disabled={isProcessingImages || isAutoFilling}
                >
                  {isAutoFilling ? (
                    <>
                      <svg className="spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                      </svg>
                      Filling...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                      </svg>
                      Auto Fill form
                    </>
                  )}
                </button>
                {isProcessingImages && (
                  <span className="autofill-hint">Wait for image processing to finish</span>
                )}
                {!isProcessingImages && extractedTexts.length > 0 && !isAutoFilling && (
                  <span className="autofill-hint">Click to fill form from extracted text</span>
                )}
              </div>
            )}

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
              <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                      <circle cx="12" cy="12" r="10" fill="none" stroke-dasharray="60" stroke-dashoffset="0" />
                      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-dasharray="20" stroke-dashoffset="0" />
                    </svg>
                    Listing...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    List Coupon
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
