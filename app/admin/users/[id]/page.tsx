"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, FileText, CheckCircle, Clock, XCircle, FileCheck, FileSearch, FileX } from "lucide-react"
import { IUser, UserServices } from "@/services/user.service"
import { DocumentService } from "@/services/document.service"
import { TaxFilingService, ITaxFiling } from "@/services/taxFiling.service"
import { Bar } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js"
import { getCurrentUser } from "@/lib/auth"
import Unauthorized from "@/components/Unauthorized"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface DocumentStats {
    total: number
    approved: number
    pending: number
    rejected: number
}

interface TaxFilingStats {
    total: number
    pending: number
    underReview: number
    completed: number
    rejected: number
}

export default function UserDetail() {
    const params = useParams()
    const { toast } = useToast()
    const [user, setUser] = useState<IUser | null>(null)
    const [documentStats, setDocumentStats] = useState<DocumentStats | null>(null)
    const [taxFilingStats, setTaxFilingStats] = useState<TaxFilingStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const userId = params.id as string
    const userRed = getCurrentUser();
    if (userRed.role !== 'admin') {
        return <Unauthorized />
    }

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userService = new UserServices()
                const documentService = new DocumentService()
                const taxFilingService = new TaxFilingService()

                // Fetch user details
                const userData = await userService.getById(userId)
                if (!userData) {
                    throw new Error("User not found")
                }
                setUser({
                    ...userData,
                    status: userData.status?.toLowerCase() === "active" ? "active" : "inactive",
                })

                // Fetch document stats
                const documents = await documentService.getByUser(userId)
                const docStats: DocumentStats = {
                    total: documents.length || 0,
                    approved: documents.filter((doc: any) => doc.status === "approved").length || 0,
                    pending: documents.filter((doc: any) => doc.status === "pending").length || 0,
                    rejected: documents.filter((doc: any) => doc.status === "rejected").length || 0,
                }
                setDocumentStats(docStats)

                // Fetch tax filing stats
                const taxFilings = await taxFilingService.getByUserId(userId)
                const taxStats: TaxFilingStats = {
                    total: taxFilings.length || 0,
                    pending: taxFilings.filter((filing: ITaxFiling) => filing.status === "pending").length || 0,
                    underReview: taxFilings.filter((filing: ITaxFiling) => filing.status === "under_review").length || 0,
                    completed: taxFilings.filter((filing: ITaxFiling) => filing.status === "completed").length || 0,
                    rejected: taxFilings.filter((filing: ITaxFiling) => filing.status === "rejected").length || 0,
                }
                setTaxFilingStats(taxStats)
            } catch (error: any) {
                console.error("Fetch error:", error)
                setError(error.message || "Failed to load user data")
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load user data. Please try again.",
                })
            } finally {
                setLoading(false)
            }
        }

        if (userId) {
            fetchUserData()
        }
    }, [userId, toast])

    const handleRoleChange = async (newRole: string) => {
        if (!user) return
        try {
            const userService = new UserServices()
            await userService.updateUserRole(user._id, newRole)
            setUser({ ...user, role: newRole })
            toast({
                title: "Success",
                description: "User role updated successfully.",
            })
        } catch (error: any) {
            console.error("Update role error:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update role. Please try again.",
            })
        }
    }

    const handleStatusChange = async (newStatus: string) => {
        if (!user) return
        try {
            const userService = new UserServices()
            await userService.updateStatus(user._id, newStatus)
            setUser({ ...user, status: newStatus })
            toast({
                title: "Success",
                description: "User status updated successfully.",
            })
        } catch (error: any) {
            console.error("Update status error:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update status. Please try again.",
            })
        }
    }

    // Document Chart Data
    const documentChartData = {
        labels: ["Approved", "Pending", "Rejected"],
        datasets: [
            {
                label: "Documents",
                data: documentStats
                    ? [documentStats.approved, documentStats.pending, documentStats.rejected]
                    : [0, 0, 0],
                backgroundColor: ["#10B981", "#F59E0B", "#EF4444"],
                borderColor: ["#ffffff", "#ffffff", "#ffffff"],
                borderWidth: 2,
            },
        ],
    }

    // Tax Filing Chart Data
    const taxFilingChartData = {
        labels: ["Pending", "Under Review", "Completed", "Rejected"],
        datasets: [
            {
                label: "Tax Filings",
                data: taxFilingStats
                    ? [
                        taxFilingStats.pending,
                        taxFilingStats.underReview,
                        taxFilingStats.completed,
                        taxFilingStats.rejected,
                    ]
                    : [0, 0, 0, 0],
                backgroundColor: ["#F59E0B", "#3B82F6", "#10B981", "#EF4444"],
                borderColor: ["#ffffff", "#ffffff", "#ffffff", "#ffffff"],
                borderWidth: 2,
            },
        ],
    }

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
                labels: {
                    font: {
                        size: 14,
                    },
                },
            },
            title: {
                display: true,
                font: {
                    size: 16,
                },
            },
        },
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-4rem)]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    if (error || !user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-2xl mx-auto shadow-lg border border-gray-200">
                    <CardHeader className="bg-gray-100">
                        <CardTitle className="text-2xl text-primary">User Not Found</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p className="text-gray-600">{error || "No user found with the specified ID."}</p>
                        <Button
                            asChild
                            variant="outline"
                            className="mt-4 text-primary border-primary hover:bg-primary hover:text-white transition-colors"
                        >
                            <a href="/admin/users">Back to Users</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

    return (
        <div className="container mx-auto px-4 py-8 mt-10">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800">{user.fullName}</h1>
                <p className="text-gray-500 text-sm mt-2">User details, document, and tax filing statistics</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* User Details */}
                <Card className="lg:col-span-1 shadow-lg border border-gray-200">
                    <CardHeader className="bg-gray-100">
                        <CardTitle className="text-2xl text-primary">User Information</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Full Name</p>
                                <p className="text-lg font-semibold">{user.fullName}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Email</p>
                                <p className="text-lg">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">ID</p>
                                <p className="text-lg font-mono">{user._id}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Role</p>
                                <Select value={user.role} onValueChange={handleRoleChange}>
                                    <SelectTrigger className="w-full border-primary text-primary focus:ring-primary">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="accountant">Accountant</SelectItem>
                                        <SelectItem value="user">User</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Status</p>
                                <Select value={user.status || "inactive"} onValueChange={handleStatusChange}>
                                    <SelectTrigger className="w-full border-primary text-primary focus:ring-primary">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            className="w-full cursor-pointer text-red-500 border-red-500 hover:bg-red-500 hover:text-white transition-colors"
                        >
                            <a href="/admin/users">Back to Users</a>
                        </Button>
                    </CardContent>
                </Card>

                {/* Document and Tax Filing Stats */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Document Stats */}
                    <Card className="shadow-lg border border-gray-200">
                        <CardHeader className="bg-gray-100">
                            <CardTitle className="text-2xl text-primary">Document Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {documentStats ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <FileText className="h-6 w-6 text-primary" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Total Documents</p>
                                                <p className="text-lg font-bold">{documentStats.total}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <CheckCircle className="h-6 w-6 text-primary" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Approved</p>
                                                <p className="text-lg font-bold">{documentStats.approved}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <Clock className="h-6 w-6 text-primary" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Pending</p>
                                                <p className="text-lg font-bold">{documentStats.pending}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <XCircle className="h-6 w-6 text-primary" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Rejected</p>
                                                <p className="text-lg font-bold">{documentStats.rejected}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-64">
                                        <Bar
                                            data={documentChartData}
                                            options={{
                                                ...chartOptions,
                                                plugins: {
                                                    ...chartOptions.plugins,
                                                    title: {
                                                        display: true,
                                                        text: "Document Status Distribution",
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-600">No document statistics available.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Tax Filing Stats */}
                    <Card className="shadow-lg border border-gray-200">
                        <CardHeader className="bg-gray-100">
                            <CardTitle className="text-2xl text-primary">Tax Filing Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {taxFilingStats ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <FileText className="h-6 w-6 text-primary" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Total Filings</p>
                                                <p className="text-lg font-bold">{taxFilingStats.total}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <Clock className="h-6 w-6 text-primary" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Pending</p>
                                                <p className="text-lg font-bold">{taxFilingStats.pending}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <FileSearch className="h-6 w-6 text-primary" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Under Review</p>
                                                <p className="text-lg font-bold">{taxFilingStats.underReview}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <FileCheck className="h-6 w-6 text-primary" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Completed</p>
                                                <p className="text-lg font-bold">{taxFilingStats.completed}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <FileX className="h-6 w-6 text-primary" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Rejected</p>
                                                <p className="text-lg font-bold">{taxFilingStats.rejected}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-64">
                                        <Bar
                                            data={taxFilingChartData}
                                            options={{
                                                ...chartOptions,
                                                plugins: {
                                                    ...chartOptions.plugins,
                                                    title: {
                                                        display: true,
                                                        text: "Tax Filing Status Distribution",
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-600">No tax filing statistics available.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}