import { useState, useEffect } from "react"
import { Navbar } from "../../components/Navbar/Navbar"
import { Footer } from "../../components/Footer/Footer"
import { logsAPI } from "../../services/api"
import { setPageMeta, SEO } from "../../services/seo"
import { FileText, Calendar, User, AlertCircle, RefreshCw, Clock, Copy, Check } from "lucide-react"
import "./logs.css"

export function Logs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    setPageMeta("System Logs - DealVista", "View all system activity logs and user actions", "https://coupon-collector.vercel.app/logs")
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await logsAPI.getAllLogs()
      setLogs(data || [])
    } catch (err) {
      setError(err.message || "Failed to load logs")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A"
    try {
      const date = new Date(timestamp)
      return date.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    } catch {
      return timestamp
    }
  }

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return ""
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return "Just now"
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
      return formatDate(timestamp)
    } catch {
      return formatDate(timestamp)
    }
  }

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      log.message?.toLowerCase().includes(query) ||
      log.id?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="logs-page">
      <Navbar />

      <main className="main-content">
        <div className="container">
          {/* Page Header */}
          <div className="page-header">
            <div className="header-content">
              <div className="header-icon">
                <FileText size={32} />
              </div>
              <div className="header-text">
                <h1>System Logs</h1>
                <p>View all system activity and user action logs</p>
              </div>
            </div>
            <button className="btn btn-secondary" onClick={fetchLogs} disabled={loading}>
              <RefreshCw size={16} className={loading ? "spinning" : ""} />
              Refresh
            </button>
          </div>

          {/* Search Bar */}
          <div className="search-section">
            <div className="search-box">
              <FileText size={18} />
              <input
                type="text"
                placeholder="Search logs by message or log ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search" onClick={() => setSearchQuery("")}>
                  ×
                </button>
              )}
            </div>
            <div className="logs-count">
              <span className="count-badge">{filteredLogs.length}</span>
              <span className="count-text">
                {filteredLogs.length === 1 ? "log entry" : "log entries"}
              </span>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading logs...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="error-state">
              <AlertCircle size={48} />
              <h3>Failed to Load Logs</h3>
              <p>{error}</p>
              <button className="btn btn-primary" onClick={fetchLogs}>
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredLogs.length === 0 && (
            <div className="empty-state">
              <FileText size={64} />
              <h3>{searchQuery ? "No Logs Found" : "No Logs Available"}</h3>
              <p>
                {searchQuery
                  ? "Try adjusting your search query"
                  : "There are no log entries to display"}
              </p>
              {searchQuery && (
                <button className="btn btn-secondary" onClick={() => setSearchQuery("")}>
                  Clear Search
                </button>
              )}
            </div>
          )}

          {/* Logs Table */}
          {!loading && !error && filteredLogs.length > 0 && (
            <div className="logs-container">
              <div className="logs-table-wrapper">
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th className="timestamp-header">
                        <Clock size={16} />
                        <span>Timestamp</span>
                      </th>
                      <th className="message-header">
                        <FileText size={16} />
                        <span>Message</span>
                      </th>
                      <th className="id-header">
                        <Calendar size={16} />
                        <span>Log ID</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="timestamp-cell">
                          <div className="timestamp-wrapper">
                            <span className="timestamp-primary">{formatRelativeTime(log.createdAt)}</span>
                            <span className="timestamp-secondary">{formatDate(log.createdAt)}</span>
                          </div>
                        </td>
                        <td className="message-cell">
                          <div className="message-content">{log.message}</div>
                        </td>
                        <td className="id-cell">
                          <div className="id-wrapper">
                            <code className="log-id">{log.id?.slice(0, 8)}...</code>
                            <button
                              className="copy-btn"
                              onClick={() => copyToClipboard(log.id, log.id)}
                              title="Copy full ID"
                            >
                              {copiedId === log.id ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Stats */}
              <div className="logs-summary">
                <div className="summary-card">
                  <FileText size={20} />
                  <div className="summary-info">
                    <span className="summary-value">{filteredLogs.length}</span>
                    <span className="summary-label">Total Logs</span>
                  </div>
                </div>
                {filteredLogs.length > 0 && (
                  <div className="summary-card">
                    <Calendar size={20} />
                    <div className="summary-info">
                      <span className="summary-value">
                        {formatRelativeTime(filteredLogs[0]?.createdAt)}
                      </span>
                      <span className="summary-label">Latest Log</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
