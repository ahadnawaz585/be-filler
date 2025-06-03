"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { DocumentService, IDocument, UpdateStatusDto } from "@/services/document.service"
import { getCurrentUser } from "@/lib/auth"
import Unauthorized from "@/components/Unauthorized"

export default function DocumentManagement() {
    const router = useRouter()
    const { toast } = useToast()
    const [documents, setDocuments] = useState<IDocument[]>([])
    const [filteredDocuments, setFilteredDocuments] = useState<IDocument[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filters, setFilters] = useState({
        type: "",
        status: "",
    })
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const user:any = getCurrentUser();
    if (user?.role !== 'admin') {
        return <Unauthorized />
    }

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const service = new DocumentService()
                const docs = await service.getAll()
                setDocuments(docs)
                setFilteredDocuments(docs)
            } catch (e) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to fetch documents. Please try again.",
                })
            } finally {
                setLoading(false)
            }
        }
        fetchDocuments()
    }, [toast])

    useEffect(() => {
        let result = documents

        // Apply search
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(
                (doc) =>
                    doc.name.toLowerCase().includes(query) ||
                    doc.gstRegistration.toLowerCase().includes(query)
            )
        }

        // Apply filters
        if (filters.type && filters.type !== "all") {
            result = result.filter((doc) => doc.type === filters.type)
        }
        if (filters.status && filters.status !== "all") {
            result = result.filter((doc) => doc.status === filters.status)
        }

        setFilteredDocuments(result)
        setCurrentPage(1) // Reset to first page on filter change
    }, [searchQuery, filters, documents])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    const handleViewDocument = (documentId: string) => {
        router.push(`/admin/document-management/${documentId}`)
    }

    const handleStatusChange = async (documentId: string, newStatus: UpdateStatusDto['status'], notes?: string) => {
        try {
            const service = new DocumentService()
            const updateData: UpdateStatusDto = { status: newStatus, notes }
            const updatedDocument = await service.updateStatus(documentId, newStatus, notes)

            // Update local state
            setDocuments(prev =>
                prev.map(doc =>
                    doc.id === documentId ? { ...doc, status: updatedDocument.status, notes: updatedDocument.notes } : doc
                )
            )

            toast({
                title: "Success",
                description: "Document status updated successfully",
            })
        } catch (e) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update document status. Please try again.",
            })
        }
    }

    // Pagination
    const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage)
    const paginatedDocuments = filteredDocuments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const documentTypes = Array.from(
        new Set(documents.map((doc) => doc.type))
    ).sort()

    return (
        <div className="container px-4 mx-auto py-8 mt-16">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    View and manage documents
                </p>
            </div>

            <Card className="w-full border shadow-sm">
                <CardHeader className="bg-gray-50">
                    <CardTitle className="text-xl">Documents</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <Label htmlFor="search" className="text-sm font-medium">
                                Search by Name or GST Registration
                            </Label>
                            <div className="relative mt-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Enter name or GST registration"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    className="pl-8"
                                    aria-label="Search documents"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div>
                                <Label htmlFor="type" className="text-sm font-medium">
                                    Document Type
                                </Label>
                                <Select
                                    value={filters.type}
                                    onValueChange={(value) => handleFilterChange("type", value)}
                                >
                                    <SelectTrigger id="type" className="w-[120px] mt-1">
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {documentTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="status" className="text-sm font-medium">
                                    Status
                                </Label>
                                <Select
                                    value={filters.status}
                                    onValueChange={(value) => handleFilterChange("status", value)}
                                >
                                    <SelectTrigger id="status" className="w-[120px] mt-1">
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Documents Table */}
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-4 border-t-[#af0e0e] border-r-transparent border-l-transparent border-b-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-3 font-medium">Name</th>
                                            <th className="p-3 font-medium">GST Registration</th>
                                            <th className="p-3 font-medium">Type</th>
                                            <th className="p-3 font-medium">Status</th>
                                            <th className="p-3 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedDocuments.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-3 text-center text-muted-foreground">
                                                    No documents found
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedDocuments.map((doc) => (
                                                <tr key={doc.id} className="border-b">
                                                    <td className="p-3">{doc.name || "N/A"}</td>
                                                    <td className="p-3">{doc.gstRegistration || "N/A"}</td>
                                                    <td className="p-3 capitalize">{doc.type}</td>
                                                    <td className="p-3">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs ${doc.status === "approved"
                                                                ? "bg-green-100 text-green-800"
                                                                : doc.status === "rejected"
                                                                    ? "bg-red-100 text-red-800"
                                                                    : "bg-gray-100 text-gray-800"
                                                                }`}
                                                        >
                                                            {doc.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewDocument(doc.id)}
                                                            className="text-[#af0e0e] border-[#af0e0e] hover:bg-[#af0e0e] hover:text-white"
                                                            aria-label={`View document ${doc.name || "N/A"}`}
                                                        >
                                                            View
                                                        </Button>
                                                        <Select
                                                            value={doc.status}
                                                            onValueChange={(value) => handleStatusChange(doc.id, value as UpdateStatusDto['status'], doc.notes)}
                                                        >
                                                            <SelectTrigger className="w-1/2.5">
                                                                <SelectValue placeholder="Change Status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="pending">Pending</SelectItem>
                                                                <SelectItem value="approved">Approved</SelectItem>
                                                                <SelectItem value="rejected">Rejected</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center mt-4">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                                        {Math.min(currentPage * itemsPerPage, filteredDocuments.length)} of{" "}
                                        {filteredDocuments.length} documents
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage((prev) => prev - 1)}
                                            aria-label="Previous page"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage((prev) => prev + 1)}
                                            aria-label="Next page"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}