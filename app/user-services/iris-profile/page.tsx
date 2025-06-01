"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { irisProfileService, CreateIrisProfileDto } from "@/services/iris.service";
import { getCurrentUser } from "@/lib/auth";

// Array of income sources
const incomeSources = [
    "salary",
    "rental income",
    "capital assets",
    "agriculture",
    "foreign other sources",
    "business income",
    "no source of income",
];

const CreateIrisProfile = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<CreateIrisProfileDto>({
        userId: "",
        email: "",
        phoneNumber: "",
        address: "",
        pin: "",
        password: "",
        bankAccounts: [{ bankName: "", iban: "" }],
        employerName: "",
        createdAt: "",
        sourceOfIncome: "", // New field for source of income
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch existing profile on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const user = getCurrentUser();
                const response = await irisProfileService.getByUser(user.id);
                if (response) {
                    const data = response.data;
                    console.log(data);
                    setFormData({
                        userId: user.id,
                        email: data.personalInfo.email || "",
                        phoneNumber: data.personalInfo.phoneNumber || "",
                        address: data.personalInfo.address || "",
                        pin: data.personalInfo.pin || "",
                        password: data.personalInfo.password || "", // Avoid prefilling password in production
                        bankAccounts: data.bankAccounts || [{ bankName: "", iban: "" }],
                        employerName: data.employerInfo.employerName || "",
                        createdAt: data.createdAt || "",
                        sourceOfIncome: data.sourceOfIncome || "", // Prefill source of income if exists
                    });
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData((prev) => ({ ...prev, sourceOfIncome: value }));
        console.log(formData.sourceOfIncome)
    };

    const handleBankAccountChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newBankAccounts = [...formData.bankAccounts];
        newBankAccounts[index] = { ...newBankAccounts[index], [name]: value };
        setFormData((prev) => ({ ...prev, bankAccounts: newBankAccounts }));
    };

    const addBankAccount = () => {
        setFormData((prev) => ({
            ...prev,
            bankAccounts: [...prev.bankAccounts, { bankName: "", iban: "" }],
        }));
    };

    const removeBankAccount = (index: number) => {
        const newBankAccounts = formData.bankAccounts.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, bankAccounts: newBankAccounts }));
    };

    const validateStep1 = () => {
        const { email, phoneNumber, address, pin, password, bankAccounts, sourceOfIncome } = formData;
        if (!email || !email.includes("@")) {
            setError("Please enter a valid email address");
            return false;
        }
        if (!phoneNumber || !/^\d{11}$/.test(phoneNumber.replace(/[^0-9]/g, ""))) {
            setError("Please enter a valid 11-digit mobile number");
            return false;
        }
        if (!address) {
            setError("Present address is required");
            return false;
        }
        if (!pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
            setError("PIN must be a 4-digit number");
            return false;
        }
        if (!password || password.length < 6) {
            setError("Password must be at least 6 characters");
            return false;
        }
        if (bankAccounts.length === 0 || bankAccounts.some((account) => !account.bankName || !account.iban)) {
            setError("All bank accounts must have a name and IBAN");
            return false;
        }
        if (!sourceOfIncome) {
            setError("Source of income is required");
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        const { employerName } = formData;
        if (!employerName) {
            setError("Employer name is required");
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;
        setError(null);
        setStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setError(null);
        setStep((prev) => prev - 1);
    };

    const handleSubmit = async () => {
        if (!validateStep1() || !validateStep2()) return;

        const timestamp = new Date().toISOString(); // e.g., "2025-06-01T13:17:00.000Z" (01:17 PM PKT)
        const { userId, ...formDataWithoutUserId } = formData as any;
        const updatedFormData = { ...formDataWithoutUserId, createdAt: timestamp };

        try {
            const user = getCurrentUser();
            await irisProfileService.createOrUpdate({ userId: user.id, ...updatedFormData });
            toast({
                title: "Success",
                description: "IRIS profile created successfully",
                variant: "default",
            });
            router.push("/dashboard");
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create IRIS profile",
                variant: "destructive",
            });
        }
    };

    if (loading) return <div className="text-center text-gray-600">Loading...</div>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-red-100 p-6">
            <div className="mt-10 bg-white rounded-lg shadow-xl max-w-2xl w-full p-8 transition-all duration-300">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create IRIS Profile</h2>

                {/* Progress Indicator */}
                <div className="flex justify-center mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 ${step >= 1 ? "bg-red-500" : "bg-gray-300"
                                    }`}
                            >
                                1
                            </div>
                            <span className="text-sm mt-2 text-gray-600">Personal Info</span>
                        </div>
                        <div className="h-1 w-24 bg-gray-300 rounded">
                            <div
                                className={`h-full rounded transition-all duration-300 ${step === 2 ? "w-full bg-red-500" : "w-0"
                                    }`}
                            />
                        </div>
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 ${step === 2 ? "bg-red-500" : "bg-gray-300"
                                    }`}
                            >
                                2
                            </div>
                            <span className="text-sm mt-2 text-gray-600">Employer Info</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-md mb-6 text-center">
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <form className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Email Address</Label>
                            <Input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="email@example.com"
                                className="border-gray-300 focus:ring-2 focus:ring-red-500 transition-all duration-200"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Mobile No.</Label>
                            <Input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                placeholder="92300xxxxxxx"
                                className="border-gray-300 focus:ring-2 focus:ring-red-500 transition-all duration-200"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Present Address</Label>
                            <Input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="123 Main St, Lahore"
                                className="border-gray-300 focus:ring-2 focus:ring-red-500 transition-all duration-200"
                                required
                            />
                        </div>
                        <div className="flex space-x-4">
                            <div className="space-y-2 w-1/2">
                                <Label className="text-gray-700 font-medium">PIN</Label>
                                <Input
                                    type="text"
                                    name="pin"
                                    value={formData.pin}
                                    onChange={handleInputChange}
                                    placeholder="1234"
                                    className="border-gray-300 focus:ring-2 focus:ring-red-500 transition-all duration-200"
                                    required
                                />
                            </div>
                            <div className="space-y-2 w-1/2">
                                <Label className="text-gray-700 font-medium">Password</Label>
                                <Input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter password"
                                    className="border-gray-300 focus:ring-2 focus:ring-red-500 transition-all duration-200"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Source of Income</Label>
                            <Select onValueChange={handleSelectChange} value={formData.sourceOfIncome} required>
                                <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-red-500 transition-all duration-200">
                                    <SelectValue placeholder="Select source of income" />
                                </SelectTrigger>
                                <SelectContent>
                                    {incomeSources.map((source) => (
                                        <SelectItem key={source} value={source}>
                                            {source.charAt(0).toUpperCase() + source.slice(1).replace(/([a-z])([A-Z])/g, "$1 $2")}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-4">
                            <Label className="text-gray-700 font-medium">Bank Accounts</Label>
                            {formData.bankAccounts.map((account, index) => (
                                <div key={index} className="flex space-x-4 items-center bg-gray-50 p-4 rounded-md">
                                    <Input
                                        type="text"
                                        name="bankName"
                                        value={account.bankName}
                                        onChange={(e) => handleBankAccountChange(index, e)}
                                        placeholder="Bank Name"
                                        className="border-gray-300 focus:ring-2 focus:ring-red-500 transition-all duration-200"
                                        required
                                    />
                                    <Input
                                        type="text"
                                        name="iban"
                                        value={account.iban}
                                        onChange={(e) => handleBankAccountChange(index, e)}
                                        placeholder="IBAN"
                                        className="border-gray-300 focus:ring-2 focus:ring-red-500 transition-all duration-200"
                                        required
                                    />
                                    {formData.bankAccounts.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={() => removeBankAccount(index)}
                                            className="hover:bg-red-600 transition-all duration-200"
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addBankAccount}
                                className="w-full hover:bg-gray-100 transition-all duration-200"
                            >
                                Add Bank Account
                            </Button>
                        </div>
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                onClick={handleNext}
                                className="bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
                            >
                                Next
                            </Button>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Employer Name</Label>
                            <Input
                                type="text"
                                name="employerName"
                                value={formData.employerName}
                                onChange={handleInputChange}
                                placeholder="Company Name"
                                className="border-gray-300 focus:ring-2 focus:ring-red-500 transition-all duration-200"
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleBack}
                                className="hover:bg-gray-100 transition-all duration-200"
                            >
                                Back
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                className="bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
                            >
                                Submit
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CreateIrisProfile;