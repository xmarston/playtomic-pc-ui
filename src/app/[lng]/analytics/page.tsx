"use client"

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useTranslation } from '@/app/i18n/client'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

interface Stats {
  totalViews: number
  uniqueSessions: number
  todayViews: number
  weekViews: number
  topPages: { path: string; count: number }[]
  topReferrers: { referrer: string; count: number }[]
  browsers: { browser: string; count: number }[]
  userAgents: { userAgent: string; count: number }[]
}

interface ViewData {
  date: string
  views: number
  uniqueVisitors: number
}

type DatePreset = '7days' | '30days' | '90days' | 'custom'

function getDateRange(preset: DatePreset): { startDate: string; endDate: string } {
  const end = new Date()
  const start = new Date()

  switch (preset) {
    case '7days':
      start.setDate(start.getDate() - 7)
      break
    case '30days':
      start.setDate(start.getDate() - 30)
      break
    case '90days':
      start.setDate(start.getDate() - 90)
      break
    default:
      start.setDate(start.getDate() - 30)
  }

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  }
}

export default function AnalyticsDashboard() {
  const params = useParams()
  const lng = params.lng as string
  const { t, isReady } = useTranslation(lng, 'common', {})

  const [stats, setStats] = useState<Stats | null>(null)
  const [viewsData, setViewsData] = useState<ViewData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<{
    user: string
    pass: string
  } | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [cleanupLoading, setCleanupLoading] = useState(false)
  const [cleanupResult, setCleanupResult] = useState<{ success: boolean; count: number } | null>(null)

  // Date range state
  const [datePreset, setDatePreset] = useState<DatePreset>('30days')
  const [startDate, setStartDate] = useState(() => getDateRange('30days').startDate)
  const [endDate, setEndDate] = useState(() => getDateRange('30days').endDate)
  const [showCustom, setShowCustom] = useState(false)

  // Load credentials from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('analytics_credentials')
    if (stored) {
      try {
        setCredentials(JSON.parse(stored))
      } catch {
        sessionStorage.removeItem('analytics_credentials')
      }
    }
    setCheckingAuth(false)
  }, [])

  // Save credentials to sessionStorage when they change
  const handleLogin = (creds: { user: string; pass: string }) => {
    sessionStorage.setItem('analytics_credentials', JSON.stringify(creds))
    setCredentials(creds)
  }

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('analytics_credentials')
    setCredentials(null)
  }, [])

  const fetchData = useCallback(async () => {
    if (!credentials) return

    const fetchWithAuth = async (url: string) => {
      const response = await fetch(url, {
        headers: {
          Authorization: `Basic ${btoa(`${credentials.user}:${credentials.pass}`)}`,
        },
      })
      if (response.status === 401) {
        handleLogout()
        throw new Error('Invalid credentials')
      }
      if (!response.ok) throw new Error('Failed to fetch')
      return response.json()
    }

    setLoading(true)
    setError(null)
    try {
      const dateParams = `startDate=${startDate}&endDate=${endDate}`
      const [statsRes, viewsRes] = await Promise.all([
        fetchWithAuth(`/api/analytics/stats?${dateParams}`),
        fetchWithAuth(`/api/analytics/views?${dateParams}`),
      ])
      setStats(statsRes)
      setViewsData(viewsRes.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [credentials, startDate, endDate, handleLogout])

  useEffect(() => {
    if (!credentials || checkingAuth) return
    fetchData()
  }, [credentials, checkingAuth, fetchData])

  const handlePresetChange = (preset: DatePreset) => {
    setDatePreset(preset)
    if (preset === 'custom') {
      setShowCustom(true)
    } else {
      setShowCustom(false)
      const range = getDateRange(preset)
      setStartDate(range.startDate)
      setEndDate(range.endDate)
    }
  }

  const handleApplyCustom = () => {
    fetchData()
  }

  const handleCleanup = async () => {
    if (!credentials) return
    if (!confirm(t('analytics_cleanup_confirm'))) return

    setCleanupLoading(true)
    setCleanupResult(null)

    try {
      const response = await fetch('/api/analytics/cleanup', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(`${credentials.user}:${credentials.pass}`)}`,
        },
      })

      if (!response.ok) {
        throw new Error('Cleanup failed')
      }

      const data = await response.json()
      setCleanupResult({ success: true, count: data.details.deletedCount })
      fetchData() // Refresh stats after cleanup
    } catch {
      setCleanupResult({ success: false, count: 0 })
    } finally {
      setCleanupLoading(false)
    }
  }

  if (!isReady || checkingAuth) return null

  if (!credentials) {
    return <LoginForm t={t} onLogin={handleLogin} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">{t('analytics_loading')}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {t('analytics_title')}
          </h1>

          {/* Date Range Selector and Cleanup */}
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            {/* Cleanup Button */}
            <button
              onClick={handleCleanup}
              disabled={cleanupLoading}
              className="px-3 py-1.5 text-sm rounded-md bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300 transition-colors"
            >
              {cleanupLoading ? t('analytics_cleanup_running') : t('analytics_cleanup_button')}
            </button>
            {cleanupResult && (
              <span className={`text-sm ${cleanupResult.success ? 'text-green-600' : 'text-red-600'}`}>
                {cleanupResult.success
                  ? t('analytics_cleanup_success', { count: cleanupResult.count })
                  : t('analytics_cleanup_error')}
              </span>
            )}
            <div className="flex gap-1 bg-white rounded-lg shadow-sm p-1">
              <button
                onClick={() => handlePresetChange('7days')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  datePreset === '7days'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {t('analytics_last_7_days')}
              </button>
              <button
                onClick={() => handlePresetChange('30days')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  datePreset === '30days'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {t('analytics_last_30_days')}
              </button>
              <button
                onClick={() => handlePresetChange('90days')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  datePreset === '90days'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {t('analytics_last_90_days')}
              </button>
              <button
                onClick={() => handlePresetChange('custom')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  datePreset === 'custom'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {t('analytics_custom')}
              </button>
            </div>

            {showCustom && (
              <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-gray-500 text-sm">-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={handleApplyCustom}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  {t('analytics_apply')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title={t('analytics_total_views')} value={stats?.totalViews || 0} />
          <StatCard
            title={t('analytics_unique_visitors')}
            value={stats?.uniqueSessions || 0}
          />
          <StatCard title={t('analytics_today')} value={stats?.todayViews || 0} />
          <StatCard title={t('analytics_last_7_days')} value={stats?.weekViews || 0} />
        </div>

        {/* Views Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            {t('analytics_page_views')} ({startDate} - {endDate})
          </h2>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => val.slice(5)}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name={t('analytics_page_views')}
                />
                <Line
                  type="monotone"
                  dataKey="uniqueVisitors"
                  stroke="#10b981"
                  strokeWidth={2}
                  name={t('analytics_unique_visitors')}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Pages */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              {t('analytics_top_pages')}
            </h2>
            <ul className="space-y-2">
              {stats?.topPages.map((page, i) => (
                <li
                  key={i}
                  className="flex justify-between text-sm text-gray-600"
                >
                  <span className="truncate mr-2">{page.path}</span>
                  <span className="font-medium">{page.count}</span>
                </li>
              ))}
              {(!stats?.topPages || stats.topPages.length === 0) && (
                <li className="text-sm text-gray-400">{t('analytics_no_data')}</li>
              )}
            </ul>
          </div>

          {/* Top Referrers */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              {t('analytics_top_referrers')}
            </h2>
            <ul className="space-y-2">
              {stats?.topReferrers.map((ref, i) => (
                <li
                  key={i}
                  className="flex justify-between text-sm text-gray-600"
                >
                  <span className="truncate mr-2">{ref.referrer}</span>
                  <span className="font-medium">{ref.count}</span>
                </li>
              ))}
              {(!stats?.topReferrers || stats.topReferrers.length === 0) && (
                <li className="text-sm text-gray-400">{t('analytics_no_data')}</li>
              )}
            </ul>
          </div>

          {/* Browsers */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              {t('analytics_browsers')}
            </h2>
            {stats?.browsers && stats.browsers.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.browsers} layout="vertical">
                    <XAxis type="number" fontSize={12} />
                    <YAxis
                      dataKey="browser"
                      type="category"
                      fontSize={12}
                      width={80}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-gray-400">{t('analytics_no_data')}</p>
            )}
          </div>
        </div>

        {/* User Agents */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mt-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            {t('analytics_user_agents')}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 font-medium text-gray-600">User Agent</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-600 w-20">#</th>
                </tr>
              </thead>
              <tbody>
                {stats?.userAgents.map((ua, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2 text-gray-600 font-mono text-xs break-all">
                      {ua.userAgent}
                    </td>
                    <td className="py-2 px-2 text-right font-medium text-gray-800">
                      {ua.count}
                    </td>
                  </tr>
                ))}
                {(!stats?.userAgents || stats.userAgents.length === 0) && (
                  <tr>
                    <td colSpan={2} className="py-4 text-center text-gray-400">
                      {t('analytics_no_data')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl sm:text-3xl font-bold text-gray-800">
        {value.toLocaleString()}
      </p>
    </div>
  )
}

function LoginForm({
  t,
  onLogin,
}: {
  t: (key: string) => string
  onLogin: (creds: { user: string; pass: string }) => void
}) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/analytics/stats', {
        headers: {
          Authorization: `Basic ${btoa(`${user}:${pass}`)}`,
        },
      })

      if (response.status === 401) {
        setError(t('analytics_invalid_credentials'))
        return
      }

      if (!response.ok) {
        setError(t('analytics_server_error'))
        return
      }

      onLogin({ user, pass })
    } catch {
      setError(t('analytics_connection_error'))
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-xl font-bold text-gray-800 mb-6 text-center">
          {t('analytics_login')}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('analytics_username')}
            </label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('analytics_password')}
            </label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md"
          >
            {t('analytics_login_button')}
          </button>
        </form>
      </div>
    </div>
  )
}
