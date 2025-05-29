"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Cookies from "js-cookie";
import { ArrowLeft, FileText, Upload, CheckCircle } from "lucide-react";
import { NTNService } from "@/services/ntn.service";
import { DocumentService, IDocument } from "@/services/document.service";
import { toast } from "@/components/ui/use-toast";
import { axiosInstance } from "@/lib/ApiClient";
import { environment } from "@/environment/environment";

interface NTN {
    _id?: string;
    user: string;
    isRegistered: boolean;
    pin?: string;
    password?: string;
    identityCard?: string;
    createdAt?: string;
    updatedAt?: string;
}

export default function NTNRegistration() {
    const router = useRouter();
    const [ntn, setNtn] = useState<NTN | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState("");
    const [type, setType] = useState("cnic");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const ntnService = new NTNService();

    // Fetch user's NTN on mount
    useEffect(() => {
        async function fetchNTN() {
            try {
                setLoading(true);
                const ntns = await ntnService.getAllNTNs();
                if (ntns.length > 0) {
                    setNtn(ntns[0]); // Assume one NTN per user
                }
                setError(null);
            } catch (err) {
                setError("Failed to fetch NTN status. Please try again.");
                toast({
                    title: "Error",
                    description: "Could not fetch NTN status.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        }
        fetchNTN();
    }, []);

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    // Handle CNIC upload or update
    const handleSubmit = async () => {
        if (!file || !name || !type) {
            toast({
                title: "Error",
                description: "Please provide a file, name, and document type.",
                variant: "destructive",
            });
            return;
        }

        setSubmitting(true);
        try {
            let ntnId = ntn?._id;
            const cookies = JSON.parse(Cookies.get("user") || "{}");
            if (!cookies.id) {
                throw new Error("User ID not found in cookies.");
            }
            // If no NTN exists, create one
            if (!ntn) {
                const newNtn = await ntnService.createNTN({});
                ntnId = newNtn._id;
                setNtn(newNtn);
            }
            const formData = new FormData();
            formData.append("file", file);
            formData.append("name", file.name);
            formData.append("type", 'cnic');
            formData.append('userId', cookies.id)
            // Upload CNIC to Documents collection
            const response = await axiosInstance.post(`${environment.apiUrl}/api/v1/secure/document/post-docs`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            )
            const document: IDocument = response.data

            // Register or update NTN with document ID
            const updatedNtn = await ntnService.registerNTN(ntnId!, document.id);
            setNtn(updatedNtn);
            setFile(null);
            setName("");
            setType("");
            toast({
                title: "Success",
                description: ntn?.identityCard
                    ? "CNIC updated successfully."
                    : "CNIC uploaded successfully.",
            });
        } catch (err) {
            setError("Failed to process CNIC upload. Please try again.");
            toast({
                title: "Error",
                description: "Could not upload CNIC.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => {
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-gray-200 shadow-md">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <FileText className="h-6 w-6 text-[#af0e0e]" />
                            <CardTitle className="text-2xl font-bold text-gray-900">
                                NTN Registration
                            </CardTitle>
                        </div>
                        {/* <Button
                            variant="outline"
                            onClick={handleBack}
                            className="flex items-center border-[#af0e0e] text-[#af0e0e] hover:bg-[#af0e0e] hover:text-white transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button> */}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Loading State */}
                    {loading && (
                        <div className="text-center">
                            <p className="text-gray-600">Loading NTN status...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="text-center text-red-600">{error}</div>
                    )}

                    {/* NTN Registered */}
                    {!loading && !error && ntn?.isRegistered === true && (
                        <div className="text-center space-y-4">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                            <p className="text-lg font-semibold text-gray-900">
                                NTN is Registered
                            </p>
                            <p className="text-sm text-gray-600">
                                Your CNIC has been approved, and your NTN is active.
                            </p>
                        </div>
                    )}

                    {/* CNIC Upload or Update */}
                    {!loading && !error && (!ntn || (ntn && !ntn.isRegistered)) && (
                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Document Name
                                </label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., CNIC Front"
                                    className="mt-1 border-gray-300 focus:border-[#af0e0e] focus:ring-[#af0e0e]"
                                />
                            </div>
                            <div className="hidden">
                                <label
                                    htmlFor="type"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Document Type
                                </label>
                                <input type="text" name="type" id="type" defaultValue={'cnic'} />
                            </div>
                            <div>
                                <label
                                    htmlFor="cnic"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Upload CNIC
                                </label>
                                <div className="mt-1 flex items-center space-x-4">
                                    <Input
                                        id="cnic"
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                        className="border-gray-300 focus:border-[#af0e0e] focus:ring-[#af0e0e]"
                                    />
                                    {file && (
                                        <span className="text-sm text-gray-600">{file.name}</span>
                                    )}
                                </div>
                                {ntn?.identityCard && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        Current CNIC uploaded. Select a new file to replace it.
                                    </p>
                                )}
                            </div>
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting || !file || !name || !type}
                                className="w-full bg-[#af0e0e] text-white hover:bg-[#af0e0e]/90"
                            >
                                {submitting ? (
                                    "Processing..."
                                ) : ntn?.identityCard ? (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Update CNIC
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload CNIC
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}