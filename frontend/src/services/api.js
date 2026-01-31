const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"

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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    
    if (!response.ok) {
      let errorMessage = "An error occurred"
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`
      } catch (parseError) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || `HTTP error! status: ${response.status}`
      }
      throw new Error(errorMessage)
    }

    return await response.json()
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
}

export default {
  authAPI,
  couponAPI,
}

