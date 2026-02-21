import { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { authAPI } from "../../services/api"
import { setPageMeta, SEO } from "../../services/seo"
import "./auth.css"

export default function AuthForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [activeTab, setActiveTab] = useState("login")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState("")

  useEffect(() => {
    setPageMeta(SEO.auth.title, SEO.auth.description, SEO.auth.canonical)
  }, [])

  // Get the page user was trying to access before being redirected to login
  const from = location.state?.from?.pathname || sessionStorage.getItem("redirectAfterLogin") || "/"

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  // Sign up form state
  const [fullName, setFullName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!loginEmail) {
      newErrors.loginEmail = "Email is required"
    } else if (!validateEmail(loginEmail)) {
      newErrors.loginEmail = "Please enter a valid email"
    }

    if (!loginPassword) {
      newErrors.loginPassword = "Password is required"
    } else if (loginPassword.length < 6) {
      newErrors.loginPassword = "Password must be at least 6 characters"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      const response = await authAPI.signin(loginEmail, loginPassword)
      
      // Store only non-sensitive user data (security: don't store id/email)
      const userData = {
        fullName: response.fullName,
        points: response.points,
        token: response.token,
      }
      
      login(userData)
      setSuccess("Login successful! Redirecting...")
      
      // Clear the redirect intent if it was set
      sessionStorage.removeItem("redirectAfterLogin")
      
      // Redirect to the page user was trying to access, or home
      setTimeout(() => {
        navigate(from, { replace: true })
      }, 1000)
    } catch (error) {
      setIsLoading(false)
      const errorMessage = error.message || "Login failed. Please try again."
      
      // Check for specific error types
      if (errorMessage.includes("connect") || errorMessage.includes("CORS")) {
        setErrors({ 
          general: "Cannot connect to server."
        })
      } else if (errorMessage.includes("403") || errorMessage.includes("Forbidden") || errorMessage.includes("Access Denied")) {
        setErrors({ 
          general: "Access denied. Please check if the backend security configuration allows this request."
        })
      } else if (errorMessage.includes("password") || errorMessage.includes("unauthorized") || errorMessage.includes("401")) {
        setErrors({ 
          loginPassword: "Invalid email or password",
          general: ""
        })
      } else {
        setErrors({ 
          general: errorMessage
        })
      }
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!signupEmail) {
      newErrors.signupEmail = "Email is required"
    } else if (!validateEmail(signupEmail)) {
      newErrors.signupEmail = "Please enter a valid email"
    }

    if (!signupPassword) {
      newErrors.signupPassword = "Password is required"
    } else if (signupPassword.length < 6) {
      newErrors.signupPassword = "Password must be at least 6 characters"
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (confirmPassword !== signupPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      const response = await authAPI.signup(fullName, signupEmail, signupPassword)
      
      // Store only non-sensitive user data (security: don't store id/email)
      const userData = {
        fullName: response.fullName,
        points: response.points,
        token: response.token,
      }
      
      login(userData)
      setSuccess("Account created successfully! Redirecting...")
      
      // Redirect to the page user was trying to access, or home
      setTimeout(() => {
        navigate(from, { replace: true })
      }, 1000)
    } catch (error) {
      setIsLoading(false)
      const errorMessage = error.message || "Signup failed. Please try again."
      
      // Check for specific error types
      if (errorMessage.includes("connect") || errorMessage.includes("CORS")) {
        setErrors({ 
          general: "Cannot connect to server. Please ensure the backend is running on https://coupon-collectoruyyf656789.onrender.com"
        })
      } else if (errorMessage.includes("email") || errorMessage.includes("exists")) {
        setErrors({ 
          signupEmail: errorMessage,
          general: ""
        })
      } else {
        setErrors({ 
          general: errorMessage
        })
      }
    }
  }

  const handleGoogleAuth = () => {
    setIsLoading(true)
    // Simulate Google OAuth
    setTimeout(() => {
      setIsLoading(false)
      // Simulate successful Google auth
      const userData = {
        email: "user@gmail.com",
        name: "Google User",
        id: Date.now().toString(),
      }
      login(userData)
      setSuccess("Google authentication successful! Redirecting...")
      setTimeout(() => {
        navigate(from, { replace: true })
      }, 1000)
    }, 1000)
  }

  const switchTab = (tab) => {
    setActiveTab(tab)
    setErrors({})
    setSuccess("")
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Logo */}
        <Link to="/" className="auth-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
            <rect x="2" y="6" width="20" height="8" rx="2" />
            <path d="M12 12v4" />
            <path d="M8 12v4" />
            <path d="M16 12v4" />
          </svg>
          DealVista
        </Link>

        {/* Subtitle */}
        <p className="auth-subtitle">Access your account or create a new one</p>

        {/* Success Message */}
        {success && (
          <div className="auth-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            {success}
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="auth-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {errors.general}
          </div>
        )}

        {/* Auth Card */}
        <div className="auth-card">
          {/* Tabs */}
          <div className="auth-tabs">
            <button className={`auth-tab ${activeTab === "login" ? "active" : ""}`} onClick={() => switchTab("login")}>
              Login
            </button>
            <button
              className={`auth-tab ${activeTab === "signup" ? "active" : ""}`}
              onClick={() => switchTab("signup")}
            >
              Sign Up
            </button>
          </div>

          {/* Login Form */}
          {activeTab === "login" && (
            <form className="auth-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="login-email">Email</label>
                <input
                  type="email"
                  id="login-email"
                  placeholder="Enter your email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={errors.loginEmail ? "error" : ""}
                />
                {errors.loginEmail && <span className="error-message">{errors.loginEmail}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input
                  type="password"
                  id="login-password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={errors.loginPassword ? "error" : ""}
                />
                {errors.loginPassword && <span className="error-message">{errors.loginPassword}</span>}
              </div>

              <div className="form-row">
                <label className="checkbox-label">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <a href="#" className="forgot-password">
                  Forgot password?
                </a>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>

              {/* <div className="divider">
                <span>OR</span>
              </div>

              <button
                type="button"
                className="btn btn-google btn-block"
                onClick={handleGoogleAuth}
                disabled={isLoading}
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button> */}

              <p className="auth-switch">
                Don't have an account?{" "}
                <button type="button" onClick={() => switchTab("signup")}>
                  Sign Up
                </button>
              </p>
            </form>
          )}

          {/* Sign Up Form */}
          {activeTab === "signup" && (
            <form className="auth-form" onSubmit={handleSignup}>
              <div className="form-group">
                <label htmlFor="full-name">Full Name</label>
                <input
                  type="text"
                  id="full-name"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={errors.fullName ? "error" : ""}
                />
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="signup-email">Email</label>
                <input
                  type="email"
                  id="signup-email"
                  placeholder="Enter your email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className={errors.signupEmail ? "error" : ""}
                />
                {errors.signupEmail && <span className="error-message">{errors.signupEmail}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="signup-password">Password</label>
                <input
                  type="password"
                  id="signup-password"
                  placeholder="Create a password (min 6 characters)"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className={errors.signupPassword ? "error" : ""}
                />
                {errors.signupPassword && <span className="error-message">{errors.signupPassword}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                  type="password"
                  id="confirm-password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? "error" : ""}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              {/* <div className="divider">
                <span>OR</span>
              </div>

              <button
                type="button"
                className="btn btn-google btn-block"
                onClick={handleGoogleAuth}
                disabled={isLoading}
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button> */}

              <p className="auth-switch">
                Already have an account?{" "}
                <button type="button" onClick={() => switchTab("login")}>
                  Login
                </button>
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="auth-footer">
          By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
