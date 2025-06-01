"use client";
import React, { useState, useEffect } from "react";
import {
    Plus,
    FileText,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    Play,
    User,
    DollarSign,
    AlertCircle,
    Filter,
    Search,
    Building,
    Loader2,
} from "lucide-react";
import { TaxFilingService, ITaxFiling } from "@/services/taxFiling.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import NewTaxFilingModal from "@/components/personal-tax-filing/new-tax-filing-modal";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

const TaxFilingsPage = () => {
    const [filings, setFilings] = useState<ITaxFiling[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const currentUser = getCurrentUser();

    const taxFilingService = new TaxFilingService();

    useEffect(() => {
        fetchFilings();
    }, []);

    const fetchFilings = async () => {
        try {
            setLoading(true);
            const userId = currentUser.id;
            console.log(currentUser.id)
            const data = await taxFilingService.getByUser(userId);
            console.log(data)
            setFilings(data);
        } catch (error) {
            console.error("Error fetching tax filings:", error);
            toast({
                title: "Error",
                description: "Failed to fetch tax filings. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCreateFiling = async (data: { taxYear: number; filingType: "individual" | "business" }) => {
        try {
            const newFiling = await taxFilingService.createMulti({
                taxYear: data.taxYear
            });
            setIsModalOpen(false);
            toast({
                title: "Success",
                description: `Tax filing for ${data.taxYear} created successfully.`,
            });
            router.push(`/user-services/personal-tax-filing/${newFiling._id}/`);
        } catch (error) {
            console.error("Error creating tax filing:", error);
            toast({
                title: "Error",
                description: "Failed to create tax filing. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleResumeFiling = (filingId: string) => {
        router.push(`/user-services/personal-tax-filing/${filingId}/`);
    };

    const handleReviewFiling = (filingId: string) => {
        router.push(`/user-services/personal-tax-filing/${filingId}/review`);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case "under_review":
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case "rejected":
                return <XCircle className="h-4 w-4 text-red-600" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-600" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            completed: "bg-green-100 text-green-800 hover:bg-green-200",
            under_review: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
            rejected: "bg-red-100 text-red-800 hover:bg-red-200",
            pending: "bg-gray-100 text-gray-800 hover:bg-gray-200",
        };

        return (
            <Badge className={variants[status as keyof typeof variants] || variants.pending}>
                {getStatusIcon(status)}
                <span className="ml-1 capitalize">{status.replace("_", " ")}</span>
            </Badge>
        );
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Not available";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return "Invalid date";
        }
    };

    const filteredFilings = filings.filter((filing) => {
        const matchesSearch =
            filing.personalInfo?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            filing.taxYear.toString().includes(searchTerm);
        const matchesStatus = statusFilter === "all" || filing.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getFilingTypeIcon = (type: string) => {
        return type === "business" ? <Building className="h-4 w-4" /> : <User className="h-4 w-4" />;
    };

    const getActionButton = (filing: ITaxFiling) => {
        switch (filing.status) {
            case "pending":
                return (
                    <Button
                        onClick={() => handleResumeFiling(filing._id)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <Play className="h-4 w-4" />
                        Resume Filing
                    </Button>
                );
            case "completed":
                return (
                    <Button
                        onClick={() => handleReviewFiling(filing._id)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <Eye className="h-4 w-4" />
                        Review Filing
                    </Button>
                );
            case "under_review":
                return (
                    <Button variant="outline" size="sm" disabled className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Under Review
                    </Button>
                );
            case "rejected":
                return (
                    <Button
                        onClick={() => handleResumeFiling(filing._id)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <AlertCircle className="h-4 w-4" />
                        Resubmit
                    </Button>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                        <span className="ml-2 text-gray-600">Loading tax filings...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-20" >
            <div className="max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tax Filings</h1>
                        <p className="text-gray-600">Manage and track your tax filing submissions</p>
                    </div>
                    <Button
                        onClick={handleOpenModal}
                        className="mt-4 sm:mt-0 bg-red-600 hover:bg-red-700 text-white"
                        aria-label="Create new tax filing"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Tax Filing
                    </Button>
                </div>

                {/* Modal */}
                <NewTaxFilingModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleCreateFiling}
                />

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search by name or tax year..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            aria-label="Filter by status"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="under_review">Under Review</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Filings</p>
                                    <p className="text-2xl font-bold text-gray-900">{filings.length}</p>
                                </div>
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {filings.filter((f) => f.status === "pending").length}
                                    </p>
                                </div>
                                <Clock className="h-8 w-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Completed</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {filings.filter((f) => f.status === "completed").length}
                                    </p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Under Review</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {filings.filter((f) => f.status === "under_review").length}
                                    </p>
                                </div>
                                <Eye className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filings List */}
                {filteredFilings.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No tax filings found</h3>
                            <p className="text-gray-600 mb-6">
                                {filings.length === 0
                                    ? "Get started by creating your first tax filing."
                                    : "Try adjusting your search or filter criteria."}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredFilings.map((filing) => (
                            <Card key={filing._id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                {getFilingTypeIcon(filing.filingType)}
                                                <h3 className="text-lg font-semibold text-gray-900">Tax Year {filing.taxYear}</h3>
                                                {getStatusBadge(filing.status)}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    <span>{filing.personalInfo?.fullName || "Not provided"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    {filing.createdAt && <span>Created: {formatDate(filing.createdAt)}</span>}
                                                </div>
                                                {filing.payment?.amount && (
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="h-4 w-4" />
                                                        <span>Amount: PKR {filing.payment.amount.toLocaleString() || ""}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {filing.remarks && (
                                                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                                    <strong>Remarks:</strong> {filing.remarks}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 lg:mt-0 lg:ml-6">{getActionButton(filing)}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaxFilingsPage;