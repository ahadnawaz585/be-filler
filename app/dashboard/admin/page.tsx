"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, getCurrentUser } from "@/lib/auth"
import { StatsOverview } from "@/components/dashboard/admin/stats-overview"
import { RecentFilers } from "@/components/dashboard/admin/recent-filers"
import { UsersTable } from "@/components/dashboard/admin/users-table"
import { IUser } from "@/services/user.service";
import { UserServices } from "@/services/user.service"
import { User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { TaxFilingService } from "@/services/taxFiling.service"
import { set } from "date-fns"
import { ReportService } from "@/services/reports.service"
import { IMonthlyStats } from "@/services/reports.service"

export default function AdminDashboard() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<IUser[]>([])
  const [totalFilings, setTotalFilings] = useState(0)
  const [pendingFilings, setPendingFilings] = useState(0)
  const [monthlyStats, setMonthlyStats] = useState<IMonthlyStats>({})

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
      if (currentUser.role !== "admin") {
        router.push("/auth/login")
        return
      }
    }

    setLoading(false)
  }, [router])

  // Combine all API calls into one useEffect to prevent multiple renders
  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const fetchAllData = async () => {
      // Fetch Users
      try {
        console.log("Fetching users...")
        const us = new UserServices()
        const usersRes = await us.getAllUsers();
        if (usersRes) {
          setUsers(usersRes)
          console.log("Users fetched successfully:", usersRes.length)
        }
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: 'Error Fetching Users',
          description: 'Failed to fetch users data',
          variant: 'destructive'
        });
      }

      // Fetch Tax Filings
      try {
        console.log("Fetching tax filings...")
        const ts = new TaxFilingService()
        const filingsRes = await ts.getAll();
        if (filingsRes) {
          const tf = filingsRes.length;
          setTotalFilings(tf);
          const pf = filingsRes.filter((filing: any) => filing.status === "under_review").length;
          setPendingFilings(pf);
          console.log("Tax filings fetched successfully:", tf, "pending:", pf)
        }
      } catch (error) {
        console.error("Error fetching tax filings:", error)
        toast({
          title: 'Error Fetching Tax Filings',
          description: 'Failed to fetch tax filings data',
          variant: 'destructive'
        });
      }

      // Fetch Monthly Reports
      try {
        console.log("Fetching monthly reports...")
        const rs = new ReportService();
        const reportsRes = await rs.getMonthlyStats(new Date().getFullYear());
        console.log("Monthly reports response:", reportsRes)
        if (reportsRes) {
          setMonthlyStats(reportsRes);
          console.log("Monthly reports fetched successfully")
        }
      } catch (error) {
        console.error("Error fetching monthly reports:", error)
        toast({
          title: 'Error Fetching Monthly Reports',
          description: 'Failed to fetch monthly reports data',
          variant: 'destructive'
        });
      }
    }

    fetchAllData()
  }, [user, toast])

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
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview and management of Befiler platform</p>
      </div>

      <div className="space-y-8">
        <StatsOverview
          activeUsers={users.length}
          pendingFilings={pendingFilings}
          totalFilings={totalFilings}
          monthlyStats={monthlyStats}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentFilers />
        </div>

        <UsersTable users={users} />
      </div>
    </div>
  )
}