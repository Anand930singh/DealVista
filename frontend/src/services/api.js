const API_BASE_URL = "https://coupon-collectoruyyf656789.onrender.com/api"

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  const user = localStorage.getItem("user")
  if (user) {
    try {
      const userData = JSON.parse(user)
      return userData.token
    } catch (error) {
      return null
    }
  }
  return null
}

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken()
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  // Don't send Authorization header for auth endpoints
  const isAuthEndpoint = endpoint.startsWith("/auth/")
  if (token && !isAuthEndpoint) {
    headers.Authorization = `Bearer ${token}`
  }

  const config = {
    ...options,
    headers,
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, config)
    const text = await response.text()

    if (!response.ok) {
      let errorMessage = "An error occurred"
      try {
        const errorData = text ? JSON.parse(text) : {}
        errorMessage =
          errorData.message ||
          errorData.error ||
          (typeof errorData === "string" ? errorData : null) ||
          errorMessage
      } catch {
        if (text && text.length < 200) errorMessage = text
        else if (response.status === 404)
          errorMessage =
            "API not found. Check that the backend is running and the URL is correct (e.g. " + API_BASE_URL + ")."
        else if (response.status === 401) errorMessage = "Invalid email or password"
        else if (response.status === 403)
          errorMessage = "Access denied. You may need to sign in or the login URL may be misconfigured."
        else errorMessage = "Request failed (" + response.status + "). " + (text ? text.slice(0, 100) : "")
      }
      throw new Error(errorMessage)
    }

    return text ? JSON.parse(text) : null
  } catch (error) {
    // Handle network errors (CORS, connection refused, etc.)
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(
        "Unable to connect to the server. Please check if the backend is running and CORS is configured correctly."
      )
    }
    // Re-throw other errors
    throw error
  }
}

// Auth API
export const authAPI = {
  signup: async (fullName, email, password) => {
    return apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password }),
    })
  },

  signin: async (email, password) => {
    return apiRequest("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },

  getUserProfile: async () => {
    return apiRequest("/auth/profile", {
      method: "GET",
    })
  },
}

// Extract API (Gemini) - extract coupon fields from text
export const extractAPI = {
  extractFromText: async (prompt) => {
    return apiRequest("/extract", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    })
  },
}

// Coupon API (for future use when endpoints are ready)
export const couponAPI = {
  listCoupon: async (couponData) => {
    return apiRequest("/coupons", {
      method: "POST",
      body: JSON.stringify(couponData),
    })
  },

  browseCoupons: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString()
    return apiRequest(`/coupons/browse${queryParams ? `?${queryParams}` : ""}`, {
      method: "GET",
    })
  },

  getCouponById: async (couponId) => {
    return apiRequest(`/coupons/${couponId}`, {
      method: "GET",
    })
  },

  viewCouponCode: async (couponId) => {
    return apiRequest(`/coupons/${couponId}/view-code`, {
      method: "POST",
    })
  },
}

// Logs API
export const logsAPI = {
  getAllLogs: async () => {
    return apiRequest("/logs", {
      method: "GET",
    })
  },

  getLogById: async (logId) => {
    return apiRequest(`/logs/${logId}`, {
      method: "GET",
    })
  },
}

export default {
  authAPI,
  couponAPI,
  extractAPI,
  logsAPI,
}

