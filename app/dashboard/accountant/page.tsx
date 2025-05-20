"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, getCurrentUser } from "@/services/localStorage/auth"
import { FilingStats } from "@/components/dashboard/accountant/filing-stats"
import { ClientList } from "@/components/dashboard/accountant/client-list"

export default function AccountantDashboard() {
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
    const currentUser: any = getCurrentUser()
    if (currentUser) {
      if (currentUser.role !== "accountant") {
        router.push("/dashboard")
        return
      }
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
        <h1 className="text-3xl font-bold">Accountant Dashboard</h1>
        <p className="text-muted-foreground">Manage client tax filings and compliance</p>
      </div>

      <div className="space-y-8">
        <FilingStats />
        <ClientList />
      </div>
    </div>
  )
}
