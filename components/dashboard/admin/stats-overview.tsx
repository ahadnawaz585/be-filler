"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileCheck, Clock, DollarSign } from 'lucide-react'
import { mockAdminUsers, mockMonthlyFilings, mockRevenueData, mockRecentFilers } from "@/services/localStorage/constants"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/services/localStorage/utils"
import { LocalStorage } from "@/services/localStorage/localStorage"

// Define types for our data
interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  status: string
  filings: number
}

interface Filing {
  id: string
  userId: string
  type: string
  status: string
  date: string
}

interface MonthlyFiling {
  month: string
  filings: number
}

interface RevenueData {
  month: string
  revenue: number
}

// LocalStorage keys
const LS_KEYS = {
  ADMIN_USERS: "admin_users_data",
  RECENT_FILINGS: "admin_recent_filings",
  MONTHLY_FILINGS: "admin_monthly_filings",
  REVENUE_DATA: "admin_revenue_data",
  LAST_UPDATED: "admin_stats_last_updated",
}

export function StatsOverview() {
  // State for our data
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [recentFilers, setRecentFilers] = useState<Filing[]>([])
  const [monthlyFilings, setMonthlyFilings] = useState<MonthlyFiling[]>([])
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  // Load data from localStorage or use mock data
  useEffect(() => {
    // Try to load data from localStorage
    const storedUsers = LocalStorage.getItem<AdminUser[] | any>(LS_KEYS.ADMIN_USERS, true)
    const storedFilings = LocalStorage.getItem<Filing[] | any>(LS_KEYS.RECENT_FILINGS, true)
    const storedMonthlyFilings = LocalStorage.getItem<MonthlyFiling[] | any>(LS_KEYS.MONTHLY_FILINGS, true)
    const storedRevenueData = LocalStorage.getItem<RevenueData[] | any>(LS_KEYS.REVENUE_DATA, true)
    const storedLastUpdated = LocalStorage.getItem<string | any>(LS_KEYS.LAST_UPDATED, false)

    // If we have stored data, use it
    if (storedUsers && storedFilings && storedMonthlyFilings && storedRevenueData) {
      setAdminUsers(storedUsers)
      setRecentFilers(storedFilings)
      setMonthlyFilings(storedMonthlyFilings)
      setRevenueData(storedRevenueData)
      if (storedLastUpdated) {
        setLastUpdated(storedLastUpdated)
      }
    } else {
      // Otherwise use mock data and store it in localStorage
      setAdminUsers(mockAdminUsers)
      setRecentFilers(mockRecentFilers)
      setMonthlyFilings(mockMonthlyFilings)
      setRevenueData(mockRevenueData)

      // Store mock data in localStorage for future use
      LocalStorage.setItem(LS_KEYS.ADMIN_USERS, mockAdminUsers)
      LocalStorage.setItem(LS_KEYS.RECENT_FILINGS, mockRecentFilers)
      LocalStorage.setItem(LS_KEYS.MONTHLY_FILINGS, mockMonthlyFilings)
      LocalStorage.setItem(LS_KEYS.REVENUE_DATA, mockRevenueData)

      // Set last updated timestamp
      const now = new Date().toISOString()
      LocalStorage.setItem(LS_KEYS.LAST_UPDATED, now)
      setLastUpdated(now)
    }

    setIsLoading(false)
  }, [])

  // Function to update data in localStorage
  const updateStats = (
    newUsers?: AdminUser[],
    newFilings?: Filing[],
    newMonthlyFilings?: MonthlyFiling[],
    newRevenueData?: RevenueData[]
  ) => {
    // Update state and localStorage for each data type if provided
    if (newUsers) {
      setAdminUsers(newUsers)
      LocalStorage.setItem(LS_KEYS.ADMIN_USERS, newUsers)
    }

    if (newFilings) {
      setRecentFilers(newFilings)
      LocalStorage.setItem(LS_KEYS.RECENT_FILINGS, newFilings)
    }

    if (newMonthlyFilings) {
      setMonthlyFilings(newMonthlyFilings)
      LocalStorage.setItem(LS_KEYS.MONTHLY_FILINGS, newMonthlyFilings)
    }

    if (newRevenueData) {
      setRevenueData(newRevenueData)
      LocalStorage.setItem(LS_KEYS.REVENUE_DATA, newRevenueData)
    }

    // Update last updated timestamp
    const now = new Date().toISOString()
    LocalStorage.setItem(LS_KEYS.LAST_UPDATED, now)
    setLastUpdated(now)
  }

  // Function to refresh data (could be called from a refresh button)
  const refreshData = () => {
    // In a real app, this would fetch fresh data from an API
    // For this example, we'll just update with the mock data
    updateStats(mockAdminUsers, mockRecentFilers, mockMonthlyFilings, mockRevenueData)
  }

  // Calculate stats from the loaded data
  const totalUsers = adminUsers.length
  const activeUsers = adminUsers.filter((user) => user.status === "Active").length
  const totalFilings = adminUsers.reduce((sum, user) => sum + user.filings, 0)
  const pendingFilings = recentFilers.filter((filing) => filing.status === "Under Review").length

  // Get current and previous month indices
  const currentMonth = new Date().getMonth()
  const previousMonth = currentMonth - 1 < 0 ? 11 : currentMonth - 1

  // Revenue calculations
  const thisMonthRevenue = revenueData[currentMonth]?.revenue || 0
  const lastMonthRevenue = revenueData[previousMonth]?.revenue || 1 // Avoid division by zero
  const revenueChange = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100

  // Monthly filings comparison
  const thisMonthFilings = monthlyFilings[currentMonth]?.filings || 0
  const lastMonthFilings = monthlyFilings[previousMonth]?.filings || 0
  const filingsChange = thisMonthFilings - lastMonthFilings

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mt-2"></div>
                  </div>
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] bg-gray-100 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Dashboard Overview</h2>
        <button
          onClick={refreshData}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : "Never"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* User Stats Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">{activeUsers} active users</p>
              </div>
              <div className="w-10 h-10 bg-[#af0e0e]/10 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-[#af0e0e]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filings Stats Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Filings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{totalFilings}</div>
                <p className="text-xs text-muted-foreground mt-1">{pendingFilings} pending approval</p>
              </div>
              <div className="w-10 h-10 bg-[#af0e0e]/10 rounded-full flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-[#af0e0e]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Month Filing Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month Filings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{thisMonthFilings}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {filingsChange >= 0 ? "↑" : "↓"}
                  {Math.abs(filingsChange)} from last month
                </p>
              </div>
              <div className="w-10 h-10 bg-[#af0e0e]/10 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-[#af0e0e]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{formatCurrency(thisMonthRevenue)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {revenueChange >= 0 ? "↑" : "↓"}
                  {Math.abs(revenueChange).toFixed(1)}% from last month
                </p>
              </div>
              <div className="w-10 h-10 bg-[#af0e0e]/10 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-[#af0e0e]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Filings Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Filings</CardTitle>
            <CardDescription>Number of tax returns filed each month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyFilings}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 10,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="filings"
                    stroke="var(--chart-1)"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Revenue generated from tax filing services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueData}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 10,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                    formatter={(value) => [formatCurrency(value as number), "Revenue"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--chart-2)"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
