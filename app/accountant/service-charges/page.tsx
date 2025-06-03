"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ServiceChargesService } from "@/services/serviceCharges.service";
import { getCurrentUser } from "@/lib/auth";
import Unauthorized from "@/components/Unauthorized";

export default function AddServiceCharge() {
    const router = useRouter();
    const { toast } = useToast();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [formData, setFormData] = useState<any>({
        category: "",
        services: [{ name: "", fee: "", completionTime: "", requirements: [], contactMethods: [] }],
    });
    const [loading, setLoading] = useState(false);

    // Check user authorization on client-side mount
    useEffect(() => {
        const user: any = getCurrentUser();
        if (!user || user?.role !== "accountant") {
            setIsAuthorized(false);
        } else {
            setIsAuthorized(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const sc = new ServiceChargesService();
            await sc.createServiceCharge(formData);
            toast({
                title: "Success",
                description: "Service charge added successfully.",
            });
            router.push("/accountant/service-charges");
        } catch (e) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to add service charge. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    if (isAuthorized === false) {
        return <Unauthorized />;
    }

    if (isAuthorized === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-t-[#af0e0e] border-r-transparent border-l-transparent border-b-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="container px-4 mx-auto py-8 mt-16">
            <Card className="w-full max-w-2xl mx-auto border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Add New Service Charge</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="category" className="text-sm font-medium">
                                Category
                            </label>
                            <Input
                                id="category"
                                value={formData.category}
                                onChange={(e) =>
                                    setFormData({ ...formData, category: e.target.value })
                                }
                                placeholder="Enter category name"
                                required
                            />
                        </div>
                        {/* Add fields for services, etc. */}
                        <Button
                            type="submit"
                            className="bg-[#af0e0e] hover:bg-[#8a0b0b] text-white"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Service Charge"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}