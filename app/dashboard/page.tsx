"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  User,
  Users,
  FileText,
  UserCheck,
  Building,
  Receipt,
  DollarSign,
  Calculator,
  MailQuestion,
  Video,
  BookOpenText,
} from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { ITaxFiling, TaxFilingService } from "@/services/taxFiling.service"
import Cookies from "js-cookie"
import Unauthorized from "@/components/Unauthorized"

interface INumbers {
  completed: number,
  active: number,
  pending: number,
  total: number
}

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [taxFiling, setTaxFiling] = useState<ITaxFiling[]>([])
  const [numbers, setNumbers] = useState<INumbers>({
    completed: 0,
    active: 0,
    pending: 0,
    total: 0
  })

  // const userRed:any = getCurrentUser();
  // if (userRed?.role !== 'admin') {
  //   return <Unauthorized />
  // }

  useEffect(() => {
    // For development - bypass authentication and use mock user
    const cookieData = getCurrentUser()
    if (!cookieData) {
      // Cookies.remove('user')
      // Cookies.remove('token')
      // router.push('/auth/login')
    }
    setUser(cookieData);
    const fetchTaxFilings = async () => {
      try {
        console.log(user)
        const ts = new TaxFilingService();
        const res = await ts.getByUser(cookieData.id);
        setTaxFiling(res);
        generateNumbers(res)
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false)
      }
    }
    fetchTaxFilings();
  }, [router])

  const generateNumbers = (filings: ITaxFiling[]) => {
    if (!filings || filings.length === 0) {
      setNumbers({
        completed: 0,
        active: 0,
        pending: 0,
        total: 0
      });
      return;
    }

    const counts = filings.reduce((acc, filing) => {
      const status = filing.status?.toLowerCase();

      switch (status) {
        case 'completed':
        case 'approved':
        case 'submitted':
          acc.completed++;
          break;
        case 'active':
        case 'under_review':
        case 'processing':
          acc.active++;
          break;
        case 'pending':
        case 'draft':
        case 'review':
          acc.pending++;
          break;
        default:
          acc.pending++;
          break;
      }
      return acc;
    }, { completed: 0, active: 0, pending: 0 });

    setNumbers({
      ...counts,
      total: filings.length
    });
  }

  const services = [
    {
      title: "Personal Tax Filing",
      description: "File your individual income tax returns",
      icon: User,
      href: "/user-services/personal-tax-filing",
      color: "bg-green-500",
    },
    {
      title: "Family Tax Filing",
      description: "File tax returns for family members",
      icon: Users,
      href: "/user-services/family-tax-filing",
      color: "bg-purple-500",
    },
    {
      title: "NTN Registration",
      description: "Register for National Tax Number",
      icon: FileText,
      href: "/user-services/ntn-registration",
      color: "bg-orange-500",
    },
    {
      title: "IRIS Profile Update",
      description: "Update your IRIS profile information",
      icon: UserCheck,
      href: "/user-services/iris-profile",
      color: "bg-cyan-500",
    },
    {
      title: "Business Incorporation",
      description: "Register and incorporate your business",
      icon: Building,
      href: "/user-services/business-incorporation",
      color: "bg-indigo-500",
    },
    {
      title: "GST Registration",
      description: "Register for Goods and Services Tax",
      icon: Receipt,
      href: "/user-services/gst-registration",
      color: "bg-pink-500",
    },
    {
      title: "Service Charges",
      description: "View and pay service charges",
      icon: DollarSign,
      href: "/user-services/service-charges",
      color: "bg-yellow-500",
    },
    {
      title: "Salary Tax Calculator",
      description: "Calculate your salary tax obligations",
      icon: Calculator,
      href: "/user-services/salary-tax-calculator",
      color: "bg-red-500",
    },
    {
      title: "FAQs",
      description: "View frquently asked questions",
      icon: MailQuestion,
      href: "/user-services/faqs",
      color: "bg-blue-500",
    },
    {
      title: "Videos",
      description: "View videos realted to tax filing and ntn registration",
      icon: Video,
      href: "/user-services/videos",
      color: "bg-red-500",
    },
    {
      title: "Blogs & Updates",
      description: "View all blogs and updates related to taxfiling and our app",
      icon: BookOpenText,
      href: "/user-services/blogs-and-updates",
      color: "bg-red-500",
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
      <div className="mt-12 mb-12 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[#af0e0e]">{numbers.active}</div>
            <p className="text-sm text-muted-foreground">Active Filings</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{numbers.completed}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{numbers.pending}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{numbers.total}</div>
            <p className="text-sm text-muted-foreground">Total Filings</p>
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
                  Get Started
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>


    </div>
  )
}
