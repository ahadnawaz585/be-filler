"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Download, Trash2, Loader2, ArrowLeft, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { GstRegistrationService, IDocument, IGstRegistration } from "@/services/gst-registration.service";
import { DocumentService } from "@/services/document.service";
import { axiosInstance } from "@/lib/ApiClient";
import { environment } from "@/environment/environment";
import Cookies from "js-cookie";

const documentTypes = [
    "Bank account maintenance certificates",
    "Article of association certificates",
    "Form A and 29 certificates",
    "Memorandum of association or partnership or trust deed certificates",
    "Partner or director or member authorization certificates",
    "Incorporation or partnership or trust registration certificates",
    "GPS tagged photographs of business",
    "Utility meter pictures",
    "GPS tagged photographs of utility installed",
    "GPS tagged photographs of industrial utility installed",
    "CNIC list",
    "Letter head",
    "Rent agreement or ownership documents list",
    "Latest paid utility bill",
] as const;

type DocumentType = typeof documentTypes[number];

const typeMapping: Record<DocumentType, string> = {
    "Bank account maintenance certificates": "bank",
    "Article of association certificates": "aoa",
    "Form A and 29 certificates": "form29",
    "Memorandum of association or partnership or trust deed certificates": "moa",
    "Partner or director or member authorization certificates": "authorization",
    "Incorporation or partnership or trust registration certificates": "registration",
    "GPS tagged photographs of business": "gps_business",
    "Utility meter pictures": "utility_meter",
    "GPS tagged photographs of utility installed": "gps_utility",
    "GPS tagged photographs of industrial utility installed": "gps_industrial",
    "CNIC list": "cnic",
    "Letter head": "letterhead",
    "Rent agreement or ownership documents list": "rent_ownership",
    "Latest paid utility bill": "utility_bill",
};

const DocumentUpload = () => {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const [documents, setDocuments] = useState<Partial<Record<DocumentType, IDocument[]>>>({});
    const [registration, setRegistration] = useState<IGstRegistration | null>(null);
    const [uploading, setUploading] = useState<Partial<Record<DocumentType, boolean>>>({});
    const [deleting, setDeleting] = useState<Partial<Record<string, boolean>>>({});
    const { toast } = useToast();
    const router = useRouter();
    const documentService = new GstRegistrationService();
    const docService = new DocumentService();

    const fetchDocuments = async () => {
        if (!id) {
            toast({
                title: "Error",
                description: "Invalid registration ID.",
                variant: "destructive",
            });
            router.push("/user-services/gst-registration");
            return;
        }

        try {
            // Fetch GST registration to get document IDs
            const registrationF = await documentService.getById(id);
            if (!registrationF) {
                toast({
                    title: "Error",
                    description: "GST registration not found.",
                    variant: "destructive",
                });
                router.push("/user-services/gst-registration");
                return;
            }
            setRegistration(registrationF);
            console.log("Registration:", registrationF);

            // Filter out null document IDs
            const documentIds = (registrationF.documents || []).filter(
                (docId): docId is string => docId !== null
            );
            console.log("Document IDs:", documentIds);

            // Fetch documents for the valid IDs
            const fetchedDocs = await Promise.all(
                documentIds.map(async (docId) => await docService.getById(docId))
            );

            // Filter out any null results
            const validDocs = fetchedDocs.filter((doc): doc is IDocument => doc !== null);
            console.log("Valid Documents:", validDocs);

            // Categorize documents by type
            const categorizedDocs = documentTypes.reduce((acc, type) => {
                const backendType = typeMapping[type];
                acc[type] = validDocs.filter((doc) => doc.type === backendType);
                return acc;
            }, {} as Partial<Record<DocumentType, IDocument[]>>);

            setDocuments(categorizedDocs);
        } catch (error) {
            console.error("Error fetching documents:", error);
            toast({
                title: "Error",
                description: "Failed to load documents. Please try again.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [id, router, toast]);

    const handleUpload = async (type: DocumentType, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            toast({
                title: "Error",
                description: "No file selected.",
                variant: "destructive",
            });
            return;
        }

        // Validate file type and size
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (!allowedTypes.includes(file.type)) {
            toast({
                title: "Error",
                description: "Only PDF, JPEG, or PNG files are allowed.",
                variant: "destructive",
            });
            return;
        }
        if (file.size > maxSize) {
            toast({
                title: "Error",
                description: "File size must be less than 5MB.",
                variant: "destructive",
            });
            return;
        }

        try {
            setUploading((prev) => ({ ...prev, [type]: true }));
            const cookies = JSON.parse(Cookies.get("user") || "{}");
            if (!cookies.id) {
                throw new Error("User ID not found in cookies.");
            }

            // Prepare FormData
            const formData = new FormData();
            formData.append("file", file);
            formData.append("name", file.name);
            formData.append("type", typeMapping[type]);
            formData.append("userId", cookies.id);

            // Log FormData contents
            for (const [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }

            // Upload document
            const response = await axiosInstance.post(
                `${environment.apiUrl}/api/v1/secure/document/post-docs`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            const uploadedDoc: IDocument = response.data;

            // Update GST registration with document ID
            try {
                await axiosInstance.post(
                    `${environment.apiUrl}/api/v1/secure/gstRegistration/${id}/documents`,
                    { documents: uploadedDoc.id }
                );
            } catch (updateError) {
                console.error("Error updating GST registration:", updateError);
                toast({
                    title: "Warning",
                    description: "Document uploaded but failed to update GST registration.",
                    variant: "destructive",
                });
            }

            setDocuments((prev) => ({
                ...prev,
                [type]: [...(prev[type] || []), uploadedDoc],
            }));

            toast({
                title: "Success",
                description: `File ${file.name} uploaded successfully.`,
                className: "bg-green-100 text-green-800 border-green-500",
            });
        } catch (error) {
            console.error("Error uploading file:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to upload file.",
                variant: "destructive",
            });
        } finally {
            setUploading((prev) => ({ ...prev, [type]: false }));
        }
    };

    const handleDelete = async (type: DocumentType, docId: string) => {
        try {
            setDeleting((prev) => ({ ...prev, [docId]: true }));
            if (!registration) {
                throw new Error("Registration not loaded.");
            }
            console.log("Deleting document:", docId, "for type:", type);

            // Delete document
            await documentService.deleteDocument(registration.id, docId);

            // Update GST registration by removing document ID
            try {
                const updatedDocuments = (registration.documents || []).filter(
                    (id: string | null) => id !== docId
                );
                console.log("Updated documents:", updatedDocuments);
                await axiosInstance.post(
                    `${environment.apiUrl}/api/v1/secure/gstRegistration/${id}/documents`,
                    { documents: updatedDocuments }
                );
            } catch (updateError) {
                console.error("Error updating GST registration:", updateError);
                toast({
                    title: "Warning",
                    description: "Document deleted but failed to update GST registration.",
                    variant: "destructive",
                });
            }

            // Refetch documents to ensure UI is in sync with backend
            await fetchDocuments();

            toast({
                title: "Success",
                description: "File deleted successfully.",
                className: "bg-green-100 text-green-800 border-green-600",
            });
        } catch (error) {
            console.error("Error deleting file:", error);
            toast({
                title: "Error",
                description: "Failed to delete file. Please try again.",
                variant: "destructive",
            });
        } finally {
            setDeleting((prev) => ({ ...prev, [docId]: false }));
        }
    };

    const getDocumentCount = (type: DocumentType) => {
        return documents[type]?.length || 0;
    };

    const handleBack = () => {
        router.push(`/user-services/gst-registration/create`);
    };

    const handleNext = () => {
        router.push(`/user-services/gst-registration/${id}/review`);
    };

    if (!id) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 sm:p-20 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6">
                        <p className="text-gray-600 text-center">Invalid registration ID.</p>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/user-services/gst-registration")}
                            className="mt-4 w-full"
                        >
                            Go to Registrations
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 sm:p-20">
            <div className="max-w-7xl mx-auto w-full">
                {/* Stepper */}
                {registration?.status !== "completed" && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-gray-600">
                                    1
                                </div>
                                <span className="ml-2 font-medium text-gray-600">Business Details</span>
                            </div>
                            <div className="h-px flex-1 bg-gray-300 mx-4"></div>
                            <div className="flex items-center">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white">
                                    2
                                </div>
                                <span className="ml-2 font-medium text-gray-900">Document Upload</span>
                            </div>
                            <div className="h-px flex-1 bg-gray-300 mx-4"></div>
                            <div className="flex items-center">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-gray-600">
                                    3
                                </div>
                                <span className="ml-2 font-medium text-gray-600">Review & Submit</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Document Upload Card */}
                <Card className="border border-red-200 shadow-lg animate-in fade-in duration-500">
                    {registration?.status !== "completed" ? (
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold text-gray-900">Upload Documents</CardTitle>
                            <p className="text-gray-600">
                                Upload the required documents for GST registration.
                            </p>
                        </CardHeader>
                    ) : (
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold text-gray-900">Uploaded Documents</CardTitle>
                            <p className="text-gray-600">
                                Following documents are uploaded for your registration.
                            </p>
                        </CardHeader>
                    )}
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Document Type</TableHead>
                                        <TableHead>Uploaded Files</TableHead>
                                        <TableHead>No. of Attachments</TableHead>
                                        {registration?.status !== "completed" && <TableHead>Upload</TableHead>}
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {documentTypes.map((type) => (
                                        <TableRow
                                            key={type}
                                            className="transition-all duration-200 hover:bg-gray-100"
                                        >
                                            <TableCell className="font-medium text-gray-900">{type}</TableCell>
                                            <TableCell className="p-0">
                                                <div className="flex flex-col gap-2">
                                                    {(documents[type] || []).length > 0 ? (
                                                        documents[type].map((doc) => (
                                                            <div
                                                                key={doc._id}
                                                                className="group flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors duration-200 cursor-pointer"
                                                                onClick={() => {
                                                                    if (doc.fileUrl) {
                                                                        window.open(doc.fileUrl, "_blank");
                                                                    }
                                                                    toast({
                                                                        title: "Download",
                                                                        description: `Downloading ${doc.name}`,
                                                                        className: "bg-blue-100 text-blue-800 border-blue-500",
                                                                    });
                                                                }}
                                                            >
                                                                <FileText
                                                                    className={`h-4 w-4 ${doc.name.endsWith(".pdf")
                                                                        ? "text-red-500"
                                                                        : "text-blue-500"
                                                                        } flex-shrink-0`}
                                                                />
                                                                <span className="truncate max-w-[200px] group-hover:underline">
                                                                    {doc.name}
                                                                </span>
                                                                <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full hidden sm:inline">
                                                                    {doc.type}
                                                                </span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-sm text-gray-500 italic">
                                                            No files uploaded
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getDocumentCount(type)}</TableCell>
                                            {registration?.status !== "completed" && (
                                                <TableCell>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                        disabled={uploading[type]}
                                                        className="transition-shadow hover:shadow-sm"
                                                    >
                                                        <label className="cursor-pointer flex items-center">
                                                            {uploading[type] ? (
                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            ) : (
                                                                <Upload className="h-4 w-4 mr-2" />
                                                            )}
                                                            Upload
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                onChange={(e) => handleUpload(type, e)}
                                                            />
                                                        </label>
                                                    </Button>
                                                </TableCell>
                                            )}
                                            <TableCell>
                                                {(documents[type] || []).map((doc) => (
                                                    <div key={doc._id} className="flex space-x-2 mb-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="transition-shadow hover:shadow-sm"
                                                            onClick={() => {
                                                                if (doc.fileUrl) {
                                                                    window.open(doc.fileUrl, "_blank");
                                                                }
                                                                toast({
                                                                    title: "Download",
                                                                    description: `Downloading ${doc.name}`,
                                                                    className: "bg-blue-100 text-blue-800 border-blue-500",
                                                                });
                                                            }}
                                                        >
                                                            <Download className="h-4 w-4 mr-2" />
                                                            Download
                                                        </Button>
                                                        {registration?.status !== "completed" && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="transition-shadow hover:shadow-sm"
                                                                onClick={() => handleDelete(type, doc.id)}
                                                                disabled={deleting[doc.id]}
                                                            >
                                                                {deleting[doc.id] ? (
                                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                ) : (
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                )}
                                                                Delete
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        {registration?.status !== "completed" && (
                            <div className="flex justify-between mt-6">
                                <Button
                                    variant="outline"
                                    onClick={handleBack}
                                    className="flex items-center transition-shadow hover:shadow-sm"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                                <Button
                                    onClick={handleNext}
                                    className="bg-red-600 hover:bg-red-700 text-white transition-all duration-200 hover:shadow-lg"
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DocumentUpload;