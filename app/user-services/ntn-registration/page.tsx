
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, FileText, Upload, CheckCircle } from "lucide-react";
import { irisProfileService, CreateIrisProfileDto } from "@/services/iris.service";
import { getCurrentUser } from "@/lib/auth";
import { axiosInstance } from "@/lib/ApiClient";
import { environment } from "@/environment/environment";
import { UserServices } from "@/services/user.service";

export default function NTNRegistration() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<CreateIrisProfileDto>>({
        userId: "",
        email: "",
        phoneNumber: "",
        employerInfo: {
            employerName: "",
            employerAddress: "",
            employerNTN: "",
        },
        identityCard: "",
        createdAt: "",
    });
    const [file, setFile] = useState<File | null>(null);
    const [documentName, setDocumentName] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch user's IRIS profile on mount
    useEffect(() => {
        async function fetchProfile() {
            try {
                setLoading(true);
                const user = getCurrentUser();
                if (!user.id) {
                    throw new Error("User not authenticated");
                }
                const response = await irisProfileService.getByUser(user.id);
                if (response) {
                    const data = response.data;
                    setFormData({
                        userId: user.id,
                        email: data.personalInfo.email || "",
                        phoneNumber: data.personalInfo.phoneNumber || "",
                        employerInfo: {
                            employerName: data.employerInfo.employerName || "",
                            employerAddress: data.employerInfo.employerAddress || "",
                            employerNTN: data.employerInfo.employerNTN || "",
                        },
                        identityCard: data.identityCard || "",
                        createdAt: data.createdAt || "",
                    });
                } else {
                    setFormData((prev) => ({ ...prev, userId: user.id }));
                }
                setError(null);
            } catch (err) {
                setError("Failed to fetch profile. Please try again.");
                toast({
                    title: "Error",
                    description: "Could not fetch profile status.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name.startsWith("employerInfo.")) {
            const field = name.split(".")[1];
            setFormData((prev) => ({
                ...prev,
                employerInfo: { ...prev.employerInfo!, [field]: value },
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    // Validate steps
    const validateStep1 = async () => {
        const { phoneNumber } = formData;
        if (!phoneNumber || !/^\d{11}$/.test(phoneNumber.replace(/[^0-9]/g, ""))) {
            setError("Please enter a valid 11-digit mobile number");
            return false;
        }
        const us = new UserServices();
        const user = getCurrentUser();
        await us.update(user.id, {
            phoneNumber: phoneNumber || "",
        })
        return true;
    };

    const validateStep2 = () => {
        const { employerName, employerAddress, employerNTN } = formData.employerInfo!;
        if (!employerName) {
            setError("Employer name is required");
            return false;
        }
        if (!employerAddress) {
            setError("Employer address is required");
            return false;
        }
        if (!employerNTN || !/^\d{7}-?\d?$/.test(employerNTN.replace(/[^0-9]/g, ""))) {
            setError("Employer NTN must be a 7 or 8-digit number");
            return false;
        }
        return true;
    };

    const validateStep3 = () => {
        if (!file || !documentName) {
            setError("Please provide a document name and file");
            return false;
        }
        return true;
    };

    // Handle navigation
    const handleNext = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;
        setError(null);
        setStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setError(null);
        if (step === 1) {
            router.push("/dashboard");
        } else {
            setStep((prev) => prev - 1);
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateStep1() || !validateStep2() || !validateStep3()) return;

        setSubmitting(true);
        try {
            const user = getCurrentUser();
            if (!user.id) {
                throw new Error("User ID not found.");
            }

            // Upload CNIC
            const formDataUpload = new FormData();
            formDataUpload.append("file", file!);
            formDataUpload.append("name", documentName);
            formDataUpload.append("type", "cnic");
            formDataUpload.append("userId", user.id);

            const response = await axiosInstance.post(
                `${environment.apiUrl}/api/v1/secure/document/post-docs`,
                formDataUpload,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            const document = response.data;

            setFormData((prev) => ({
                ...prev,
                identityCard: document.id,
            }));
            setFile(null);
            setDocumentName("");
            toast({
                title: "Success",
                description: formData.identityCard
                    ? "CNIC updated successfully."
                    : "CNIC uploaded successfully.",
            });
        } catch (err) {
            setError("Failed to process CNIC upload. Please try again.");
            toast({
                title: "Error",
                description: "Could not complete NTN registration.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-6">
                <p className="text-gray-600">Loading profile status...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-6">
            <Card className="w-full max-w-md border-gray-200 shadow-md rounded-xl">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <FileText className="h-6 w-6 text-[#af0e0e]" />
                            <CardTitle className="text-2xl font-bold text-gray-900">
                                NTN Registration
                            </CardTitle>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            className="border-[#af0e0e] text-[#af0e0e] hover:bg-[#af0e0e]/10 hover:text-[#8a0b0b] transition-all duration-200 rounded-full"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Progress Indicator */}
                    <div className="flex justify-center mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 ${step >= 1 ? "bg-[#af0e0e]" : "bg-gray-300"
                                        } `}
                                >
                                    1
                                </div>
                                <span className="text-sm mt-2 text-gray-600">Personal Info</span>
                            </div>
                            <div className="h-1 w-16 bg-gray-300 rounded">
                                <div
                                    className={`h-full rounded transition-all duration-300 ${step >= 2 ? "w-full bg-[#af0e0e]" : "w-0"
                                        } `}
                                />
                            </div>
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 ${step >= 2 ? "bg-[#af0e0e]" : "bg-gray-300"
                                        } `}
                                >
                                    2
                                </div>
                                <span className="text-sm mt-2 text-gray-600">Employer Info</span>
                            </div>
                            <div className="h-1 w-16 bg-gray-300 rounded">
                                <div
                                    className={`h-full rounded transition-all duration-300 ${step === 3 ? "w-full bg-[#af0e0e]" : "w-0"
                                        } `}
                                />
                            </div>
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 ${step === 3 ? "bg-[#af0e0e]" : "bg-gray-300"
                                        } `}
                                >
                                    3
                                </div>
                                <span className="text-sm mt-2 text-gray-600">CNIC Upload</span>
                            </div>
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded-md text-center">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Personal Info */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-700">
                                    Email Address
                                </Label>
                                <Input
                                    type="email"
                                    name="email"
                                    value={formData.email || ""}
                                    onChange={handleInputChange}
                                    placeholder="email@example.com"
                                    className="mt-1 border-gray-300 focus:ring-2 focus:ring-[#af0e0e] rounded-md transition-all duration-200"
                                    required
                                    disabled
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">
                                    Mobile No.
                                </Label>
                                <Input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber || ""}
                                    onChange={handleInputChange}
                                    placeholder="92300xxxxxxx"
                                    className="mt-1 border-gray-300 focus:ring-2 focus:ring-[#af0e0e] rounded-md transition-all duration-200"
                                    required
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="bg-gradient-to-r from-[#af0e0e] to-[#8a0b0b] hover:from-[#8a0b0b] hover:to-[#6b0808] text-white transition-transform hover:scale-105 rounded-full"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Employer Info */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-700">
                                    Employer Name
                                </Label>
                                <Input
                                    type="text"
                                    name="employerInfo.employerName"
                                    value={formData.employerInfo?.employerName || ""}
                                    onChange={handleInputChange}
                                    placeholder="Company Name"
                                    className="mt-1 border-gray-300 focus:ring-2 focus:ring-[#af0e0e] rounded-md transition-all duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">
                                    Employer Address
                                </Label>
                                <Input
                                    type="text"
                                    name="employerInfo.employerAddress"
                                    value={formData.employerInfo?.employerAddress || ""}
                                    onChange={handleInputChange}
                                    placeholder="Company Address, City"
                                    className="mt-1 border-gray-300 focus:ring-2 focus:ring-[#af0e0e] rounded-md transition-all duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">
                                    Employer NTN
                                </Label>
                                <Input
                                    type="text"
                                    name="employerInfo.employerNTN"
                                    value={formData.employerInfo?.employerNTN || ""}
                                    onChange={handleInputChange}
                                    placeholder="1234567-8"
                                    className="mt-1 border-gray-300 focus:ring-2 focus:ring-[#af0e0e] rounded-md transition-all duration-200"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleBack}
                                    className="border-[#af0e0e] text-[#af0e0e] hover:bg-[#af0e0e]/10 hover:text-[#8a0b0b] transition-all duration-200 rounded-full"
                                >
                                    Back
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="bg-gradient-to-r from-[#af0e0e] to-[#8a0b0b] hover:from-[#8a0b0b] hover:to-[#6b0808] text-white transition-transform hover:scale-105 rounded-full"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: CNIC Upload */}
                    {step === 3 && (
                        <div className="space-y-4">
                            {/* NTN Registered */}
                            {formData.identityCard && !file && (
                                <div className="text-center space-y-4">
                                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                                    <p className="text-lg font-semibold text-gray-900">
                                        NTN is Registered
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Your CNIC has been uploaded. Upload a new file to replace it.
                                    </p>
                                </div>
                            )}
                            <div>
                                <Label className="text-sm font-medium text-gray-700">
                                    Document Name
                                </Label>
                                <Input
                                    type="text"
                                    value={documentName}
                                    onChange={(e) => setDocumentName(e.target.value)}
                                    placeholder="e.g., CNIC Front"
                                    className="mt-1 border-gray-300 focus:ring-2 focus:ring-[#af0e0e] rounded-md transition-all duration-200"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">
                                    Upload CNIC
                                </Label>
                                <div className="mt-1 flex items-center space-x-4">
                                    <Input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                        className="border-gray-300 focus:ring-2 focus:ring-[#af0e0e] rounded-md transition-all duration-200"
                                    />
                                    {file && (
                                        <span className="text-sm text-gray-600">{file.name}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleBack}
                                    className="border-[#af0e0e] text-[#af0e0e] hover:bg-[#af0e0e]/10 hover:text-[#8a0b0b] transition-all duration-200 rounded-full"
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={submitting || !file || !documentName}
                                    className="bg-gradient-to-r from-[#af0e0e] to-[#8a0b0b] hover:from-[#8a0b0b] hover:to-[#6b0808] text-white transition-transform hover:scale-105 rounded-full"
                                >
                                    {submitting ? (
                                        "Processing..."
                                    ) : formData.identityCard ? (
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
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}