import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute/AdminRoute'
import { Home } from './pages/home/home'
import { Upload } from './pages/uploadcoupon/upload'
import { BrowseCoupons } from './pages/browsecoupon/browsecoupon'
import { Logs } from './pages/logs/logs'
import { Profile } from './pages/profile/profile'
import AuthForm from './pages/auth/auth'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/browse" element={<BrowseCoupons />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs"
            element={
              <AdminRoute>
                <Logs />
              </AdminRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
