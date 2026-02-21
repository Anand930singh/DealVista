import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Gift, Menu, X, LogOut, User, Award } from "lucide-react"
import "./Navbar.css"

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
    setMenuOpen(false)
  }

  const getFirstName = () => {
    if (user?.fullName) {
      return user.fullName.split(" ")[0]
    }
    return "User"
  }

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <Gift className="logo-icon" />
          <span>DealVista</span>
        </Link>
        <nav className={`nav ${menuOpen ? "nav-open" : ""}`}>
          <Link to="/#how-it-works" onClick={() => setMenuOpen(false)}>
            How It Works
          </Link>
          <Link to="/#categories" onClick={() => setMenuOpen(false)}>
            Categories
          </Link>
          <Link to="/#rewards" onClick={() => setMenuOpen(false)}>
            Rewards
          </Link>
          <Link to="/logs" onClick={() => setMenuOpen(false)}>
            Logs
          </Link>
        </nav>
        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <div className="points-display">
                <Award size={18} />
                <span className="points-value">{user?.points || 0}</span>
              </div>
              <div className="user-info">
                <User size={18} />
                <span className="user-name">{getFirstName()}</span>
              </div>
              <button className="btn btn-secondary btn-signin" onClick={handleLogout}>
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="btn btn-secondary btn-signin" onClick={() => setMenuOpen(false)}>
                Sign In
              </Link>
              <Link to="/auth" className="btn btn-primary btn-getstarted" onClick={() => setMenuOpen(false)}>
                Get Started
              </Link>
            </>
          )}
          <button className="btn-mobile-menu" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  )
}

