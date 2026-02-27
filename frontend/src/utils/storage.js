/**
 * Cookie storage utility functions using js-cookie
 */
import Cookies from "js-cookie"

const USER_COOKIE = "dealvista_user"
const COOKIE_OPTIONS = {
  sameSite: "strict",
  secure: window.location.protocol === "https:",
}

/**
 * Save user data to cookie
 * @param {object} userData - User data object
 * @param {number} days - Expiration in days
 */
export const setUserCookie = (userData, days = 7) => {
  Cookies.set(USER_COOKIE, JSON.stringify(userData), {
    expires: days,
    ...COOKIE_OPTIONS,
  })
}

/**
 * Get user data from cookie
 * @returns {object|null} - User data or null
 */
export const getUserFromCookie = () => {
  const userCookie = Cookies.get(USER_COOKIE)
  if (userCookie) {
    try {
      return JSON.parse(userCookie)
    } catch (error) {
      return null
    }
  }
  return null
}

/**
 * Delete user cookie
 */
export const deleteUserCookie = () => {
  Cookies.remove(USER_COOKIE, COOKIE_OPTIONS)
}

/**
 * Get auth token from user cookie
 * @returns {string|null} - Auth token or null
 */
export const getAuthToken = () => {
  const user = getUserFromCookie()
  return user?.token || null
}
