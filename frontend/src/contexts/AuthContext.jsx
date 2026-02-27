import { createContext, useContext, useState, useEffect } from "react"
import { setUserCookie, getUserFromCookie, deleteUserCookie } from "../utils/storage"

const AuthContext = createContext(null)

// Set expiry duration (1 hour)
const EXPIRY_DAYS = 1 / 24 // 1 hour in days

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in (from cookie)
    const savedUser = getUserFromCookie()
    
    if (savedUser) {
      setUser(savedUser)
    }
    setIsLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    setUserCookie(userData, EXPIRY_DAYS)
  }

  const logout = () => {
    setUser(null)
    deleteUserCookie()
  }

  const updatePoints = (newPoints) => {
    if (user) {
      const updatedUser = { ...user, points: newPoints }
      setUser(updatedUser)
      setUserCookie(updatedUser, EXPIRY_DAYS)
    }
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updatePoints,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

