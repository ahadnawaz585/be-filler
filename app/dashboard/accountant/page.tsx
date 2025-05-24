"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, getCurrentUser } from "@/lib/auth"
import { FilingStats } from "@/components/dashboard/accountant/filing-stats"
import { ClientList } from "@/components/dashboard/accountant/client-list"
import { toast } from "@/hooks/use-toast"
import { ITaxFiling, TaxFilingService } from "@/services/taxFiling.service"
import { IUser, UserServices } from "@/services/user.service"

export default function AccountantDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [taxFilings, setTaxFilings] = useState<ITaxFiling[]>([])
  const [users, setUsers] = useState<IUser[]>([])

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push("/auth/login")
      return
    }

    // Get current user information
    const currentUser = getCurrentUser()
    console.log("Client-side user:", currentUser)
    if (!currentUser) {
      router.push("/auth/login")
      return
    }
    if (currentUser) {
      if (currentUser.role == "accountant") {
      }
      if (currentUser.role == "admin") {
        router.push("/dashboard/admin")
      }
      if (currentUser.role == "user") {
        router.push("/dashboard")
      }
      setUser(currentUser)
    }

    setLoading(false)
  }, [router])


  useEffect(() => {
    const fetchData = async () => {
      try {
        const ts = new TaxFilingService()
        const response: ITaxFiling[] = await ts.getAll();
        setTaxFilings(response)

        const us = new UserServices()
        const users: IUser[] = await us.getAllUsers();
        const clients = users.filter((user) => user.role === "user");
        setUsers(clients)

      } catch (err) {
        console.error("Error fetching data:", err)
        toast({
          title: "Error Fetching Data",
          description: "Failed to fetch data",
          variant: "destructive"
        })
      }

    }
    fetchData();
  }, [])

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
        <FilingStats taxFilings={taxFilings} />
        <ClientList clients={users} taxFilings={taxFilings} onFilingCreated={() => { }} />
      </div>
    </div>
  )
}
