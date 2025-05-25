"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, getCurrentUser } from "@/lib/auth"
import { StatsOverview } from "@/components/dashboard/admin/stats-overview"
import { RecentFilers } from "@/components/dashboard/admin/recent-filers"
import { UsersTable } from "@/components/dashboard/admin/users-table"
import { IUser } from "@/services/user.service"
import { UserServices } from "@/services/user.service"
import { useToast } from "@/hooks/use-toast"
import { ITaxFiling, TaxFilingService } from "@/services/taxFiling.service"
import { ReportService } from "@/services/reports.service"
import { IMonthlyStats, IRevenueSummary } from "@/services/reports.service"

// Define the Filer interface to match RecentFilers expectations
interface Filer {
  id: string;
  userId: string;
  taxYear: number;
  filingType: 'individual' | 'business';
  grossIncome: number;
  taxPaid: number;
  documents: string[];
  status: 'under_review' | 'completed' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
  user: {
    fullName: string;
    email: string;
  };
}

export default function AdminDashboard() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<IUser[]>([])
  const [totalFilings, setTotalFilings] = useState(0)
  const [pendingFilings, setPendingFilings] = useState(0)
  const [monthlyStats, setMonthlyStats] = useState<IMonthlyStats | null>(null)
  const [recentFilings, setRecentFilings] = useState<ITaxFiling[]>([])
  const [revenueSummary, setRevenueSummary] = useState<IRevenueSummary | null>(null)

  useEffect(() => {
    console.log("Checking auth...")
    if (!isAuthenticated()) {
      console.log("Not authenticated, redirecting to login")
      router.push("/auth/login")
      return
    }
    const currentUser = getCurrentUser()
    console.log("Client-side user:", currentUser)
    if (currentUser) {
      setUser(currentUser)
      if (currentUser.role == "admin") {
        return
      }
      if (currentUser.role == "user") {
        console.log("Redirecting to user dashboard")
        router.push("/dashboard")
      } else if (currentUser.role == "accountant") {
        console.log("Redirecting to accountant dashboard")
        router.push("/dashboard/accountant")
      }
    } else {
      console.log("No user found, redirecting to login")
      router.push("/auth/login")
    }
  }, [router])

  // Fetch all data
  useEffect(() => {
    if (!user || user.role !== "admin") return

    const fetchAllData = async () => {
      // setLoading(true) // Ensure loading is true at the start
      // let allDataFetched = true // Track if all data is successfully fetched

      // Fetch Users
   try {
      console.log("Fetching users...")
      const us = new UserServices()
      const usersRes = await us.getAllUsers()
      console.log("Users response:", usersRes)
      if (usersRes && Array.isArray(usersRes) && usersRes.length > 0) {
        // Filter out invalid user objects
        const validUsers = usersRes.filter(
          (u): u is IUser => u != null && u._id != null && u.fullName != null && u.email != null && u.cnic != null
        )
        setUsers(validUsers)
        console.log("Users fetched successfully:", validUsers.length)
        if (validUsers.length < usersRes.length) {
          console.warn(`Filtered out ${usersRes.length - validUsers.length} invalid user objects`)
        }
      } else {
        console.warn("No users data received")
        setUsers([])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: 'Error Fetching Users',
        description: 'Failed to fetch users data',
        variant: 'destructive'
      })
      setUsers([])
    }

      // Fetch Tax Filings
      try {
        console.log("Fetching tax filings...")
        const ts = new TaxFilingService()
        const filingsRes = await ts.getAll()
        console.log("Tax filings response:", filingsRes)
        if (filingsRes && Array.isArray(filingsRes)) {
          const tf = filingsRes.length
          setTotalFilings(tf)
          const pf = filingsRes.filter((filing: ITaxFiling) => filing.status === "under_review").length
          setPendingFilings(pf)
          const sortedFilings = filingsRes
            .sort((a: ITaxFiling, b: ITaxFiling) =>
              new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            )
            .slice(0, 5)
          setRecentFilings(sortedFilings)
          console.log("Tax filings fetched successfully:", tf, "pending:", pf, "recent:", sortedFilings)
        } else {
          // allDataFetched = false
          console.warn("No tax filings data received")
        }
      } catch (error) {
        console.error("Error fetching tax filings:", error)
        toast({
          title: 'Error Fetching Tax Filings',
          description: 'Failed to fetch tax filings data',
          variant: 'destructive'
        })
        // allDataFetched = false
      }

      // Fetch Monthly Reports
      try {
        console.log("Fetching monthly reports...")
        const rs = new ReportService()
        const reportsRes = await rs.getMonthlyStats(new Date().getFullYear())
        console.log("Monthly reports response:", reportsRes)
        if (reportsRes && Object.keys(reportsRes).length > 0) {
          setMonthlyStats(reportsRes)
          console.log("Monthly reports fetched successfully")
        } else {
          // allDataFetched = false
          console.warn("No monthly stats data received")
        }
      } catch (error) {
        console.error("Error fetching monthly reports:", error)
        toast({
          title: 'Error Fetching Monthly Reports',
          description: 'Failed to fetch monthly reports data',
          variant: 'destructive'
        })
        // allDataFetched = false
      }

      // Fetch Revenue Summary
      try {
        console.log("Fetching revenue summary...")
        const rs = new ReportService()
        const revenueSummaryTemp = await rs.getRevenueSummary()
        console.log("Revenue summary response:", revenueSummaryTemp)
        if (revenueSummaryTemp && (revenueSummaryTemp.totalGrossIncome > 0 || revenueSummaryTemp.totalTaxPaid > 0)) {
          setRevenueSummary(revenueSummaryTemp)
          console.log("Revenue summary fetched successfully:", revenueSummaryTemp)
        } else {
          // allDataFetched = false
          console.warn("No valid revenue summary data received")
        }
      } catch (error) {
        console.error("Error fetching revenue summary:", error)
        toast({
          title: 'Error Fetching Revenue Summary',
          description: 'Failed to fetch revenue summary data',
          variant: 'destructive'
        })
        // allDataFetched = false
      }

      // setLoading(!allDataFetched) // Stop loading only if all data is fetched
    }

    fetchAllData()
  }, [user, toast])

  const onCreateUser = async (data: Partial<IUser>) => {
    try {
      const us = new UserServices()
      await us.createUser(data)
      toast({
        title: 'User Created',
        description: 'User created successfully',
        variant: 'default'
      })
    } catch (err) {
      toast({
        title: 'Error Creating User',
        description: 'Failed to create user',
        variant: 'destructive'
      })
    }
  }

  const onUpdateUserRole = async (userId: string, newRole: string): Promise<void> => {
    try {
      const us = new UserServices()
      await us.updateUserRole(userId, newRole)
      toast({
        title: 'User Role Updated',
        description: 'User role updated successfully',
        variant: 'default'
      })
    } catch (err) {
      toast({
        title: 'Error Updating User Role',
        description: 'Failed to update user role',
        variant: 'destructive'
      })
    }
  }
  const onUpdateUser = async (userId: string, data: string): Promise<void> => {
    try {
      const us = new UserServices()
      await us.updateStatus(userId, data)
      toast({
        title: 'User Updated',
        description: 'User updated successfully',
        variant: 'default'
      })
    } catch (err) {
      toast({
        title: 'Error Updating User',
        description: 'Failed to update user',
        variant: 'destructive'
      })
    }
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-t-[#af0e0e] border-r-transparent border-l-transparent border-b-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const filers: any[] = recentFilings



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
          monthlyStats={monthlyStats || {}}
          revenueSummary={revenueSummary || { totalGrossIncome: 0, totalTaxPaid: 0 }}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentFilers filers={filers} />
        </div>

        {users && <UsersTable users={users} onCreateUser={onCreateUser} onUpdateUserRole={onUpdateUserRole} onStatusUpdate={onUpdateUser} />
        }</div>
    </div>
  )
}