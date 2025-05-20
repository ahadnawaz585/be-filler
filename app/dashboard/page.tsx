"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, getCurrentUser } from "@/services/localStorage/auth"
import { UserStats } from "@/components/dashboard/user-stats"
import { TaxFilingStatus } from "@/components/dashboard/tax-filing-status"
import { RecentActivity } from "@/components/dashboard/recent-activity"

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push("/auth/login")
      return
    }

    // Get current user information
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }

    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-t-[#af0e0e] border-r-transparent border-l-transparent border-b-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="container px-4 mx-auto py-8 mt-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name || "User"}</h1>
        <p className="text-muted-foreground">Here's an overview of your tax filing status and recent activity</p>
      </div>

      {/* Check UserStats for Progress component usage */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <UserStats />
      </div>

      {/* Check TaxFilingStatus and RecentActivity for Progress component usage */}
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
