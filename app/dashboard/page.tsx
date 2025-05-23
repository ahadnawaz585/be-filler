"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, getCurrentUser } from "@/lib/auth"
import { UserStats } from "@/components/dashboard/user-stats"
import { TaxFilingStatus } from "@/components/dashboard/tax-filing-status"
import { RecentActivity } from "@/components/dashboard/recent-activity"

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check authentication and user
    const isAuth = isAuthenticated()
    if (!isAuth) {
      router.push("/auth/login")
      return
    }

    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/auth/login")
      return
    }

    // Set user and handle role-based redirection
    setUser(currentUser)
    if (currentUser.role === "admin") {
      router.push("/dashboard/admin")
      return
    }
    if (currentUser.role === "accountant") {
      router.push("/dashboard/accountant") // Fix typo: "dasboard" → "dashboard"
      return
    }

    setLoading(false)
  }, [router]) // Remove 'user' from dependencies

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-t-[#af0e0e] border-r-transparent border-l-transparent border-b-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return <div className="text-center py-8 text-red-500">Failed to load user data</div>
  }

  return (
    <div className="container px-4 mx-auto py-8 mt-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name || "User"}</h1>
        <p className="text-muted-foreground">Here's an overview of your tax filing status and recent activity</p>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <UserStats userId={user.id} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TaxFilingStatus />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}