"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LocalStorage } from "@/services/localStorage/localStorage"
import { StatsOverview } from "@/components/dashboard/admin/stats-overview"
import { RecentFilers } from "@/components/dashboard/admin/recent-filers"
import { UsersTable } from "@/components/dashboard/admin/users-table"

// Define user type
interface User {
  id: string
  name: string
  email: string
  role: string
}

// Constants for storage keys
const AUTH_TOKEN_KEY = "auth_token"
const USER_DATA_KEY = "user_data"

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)

  // Check authentication status directly with LocalStorage
  const checkAuth = () => {
    const token = LocalStorage.getItem<string>(AUTH_TOKEN_KEY, false)
    const userData = LocalStorage.getItem<User>(USER_DATA_KEY, true)

    const isAuth = !!token
    setIsAuthenticated(isAuth)

    if (isAuth && userData) {
      setUser(userData)
    } else {
      setUser(null)
    }

    return { isAuth, userData }
  }

  useEffect(() => {
    // Check authentication status
    const { isAuth, userData }: any = checkAuth()

    // If not authenticated, redirect to login
    if (!isAuth) {
      router.push("/auth/login")
      return
    }

    // If authenticated but not admin, redirect to appropriate dashboard
    if (userData && userData.role !== "admin") {
      router.push(userData.role === "accountant" ? "/dashboard/accountant" : "/dashboard")
      return
    }

    // Load any dashboard-specific data from localStorage if available
    const savedDashboardData = LocalStorage.getItem<any>("admin_dashboard_data", true)
    if (savedDashboardData) {
      setDashboardData(savedDashboardData)
    }

    // Set loading to false once everything is ready
    setIsLoading(false)
  }, [router])

  // Save dashboard preferences or state when needed
  const saveDashboardPreferences = (preferences: any) => {
    LocalStorage.setItem("admin_dashboard_preferences", preferences)
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-t-[#af0e0e] border-r-transparent border-l-transparent border-b-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="container px-4 mx-auto py-8 mt-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || "Admin"}! Overview and management of Befiler platform
        </p>
      </div>

      <div className="space-y-8">
        <StatsOverview />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentFilers />
        </div>

        <UsersTable />
      </div>
    </div>
  )
}
