"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FileText,
  DollarSign,
  FileCheck,
  User,
  Users,
  FileText as FileTextAlt,
  UserCheck,
  Building,
  Receipt,
  Calculator,
  MailQuestion,
  Video,
  BookOpenText,
  ReceiptCent,
} from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { ITaxFiling, TaxFilingService } from "@/services/taxFiling.service"
import Cookies from "js-cookie"
import { ServiceChargesService } from "@/services/serviceCharges.service"
import { DocumentService } from "@/services/document.service"
import Unauthorized from "@/components/Unauthorized"

interface INumbers {
  documents: number,
  serviceCharges: number,
  taxFilings: number
}

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [numbers, setNumbers] = useState<INumbers>({
    documents: 0,
    serviceCharges: 0,
    taxFilings: 0
  })
  const userRed = getCurrentUser();
  if (userRed.role !== 'accountant') {
    return <Unauthorized />
  }

  useEffect(() => {
    const cookieData = getCurrentUser()
    if (!cookieData) {
      Cookies.remove('user')
      Cookies.remove('token')
      router.push('/auth/login')
    }
    setUser(cookieData)

    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch Tax Filings
        const ts = new TaxFilingService()
        const taxFilingsRes = await ts.getAll()

        // Fetch Service Charges
        const sc = new ServiceChargesService()
        const serviceChargesRes = await sc.getAllServiceCharges()

        // Fetch Documents
        const ds = new DocumentService()
        const documentsRes = await ds.getAll()

        // Update numbers state with all fetched data
        setNumbers({
          documents: documentsRes.length || 0,
          serviceCharges: serviceChargesRes.length || 0,
          taxFilings: taxFilingsRes.length || 0
        })
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const services = [
    {
      title: "Document Management",
      description: "Organize and manage all your business documents efficiently.",
      icon: FileText,
      href: "/accountant/document-management",
      color: "bg-blue-500",
    },
    {
      title: "Service Charges Management",
      description: "Track and manage service charges for your clients seamlessly.",
      icon: DollarSign,
      href: "/accountant/service-charges",
      color: "bg-green-500",
    },
    {
      title: "Tax Filing Management",
      description: "Handle tax filings and compliance with ease.",
      icon: FileCheck,
      href: "/accountant/tax-filing",
      color: "bg-red-500",
    },
    {
      title: "Reports Generator",
      description: "Generate document reports of users.",
      icon: BookOpenText,
      href: "/accountant/reports",
      color: "bg-yellow-500",
    }
  ]

  const handleServiceClick = (href: string) => {
    router.push(href)
  }

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
        <p className="text-muted-foreground">Choose a service to get started with your tax and business needs</p>
      </div>
      {/* Quick Stats Section */}
      <div className="w-full flex flex-row gap-6 py-4">
        <Card className="text-center w-1/3">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[#af0e0e]">{numbers.documents}</div>
            <p className="text-sm text-muted-foreground">Total Documents</p>
          </CardContent>
        </Card>
        <Card className="text-center w-1/3">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{numbers.serviceCharges}</div>
            <p className="text-sm text-muted-foreground">Total Service Charges</p>
          </CardContent>
        </Card>
        <Card className="text-center w-1/3">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{numbers.taxFilings}</div>
            <p className="text-sm text-muted-foreground">Total Tax Filings</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => {
          const IconComponent = service.icon
          return (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => handleServiceClick(service.href)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${service.color} text-white group-hover:scale-110 transition-transform`}
                  >
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-[#af0e0e] transition-colors">
                      {service.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground mb-4">{service.description}</CardDescription>
                <Button
                  variant="outline"
                  className="w-full group-hover:bg-[#af0e0e] group-hover:text-white group-hover:border-[#af0e0e] transition-colors"
                >
                  View : 
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}