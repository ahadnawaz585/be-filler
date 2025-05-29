"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, ArrowLeft, RefreshCw, DollarSign, Receipt } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function TaxCalculator() {
    const router = useRouter();
    const { toast } = useToast();
    const [monthlySalary, setMonthlySalary] = useState<string>("");
    const [results, setResults] = useState<{
        yearlySalary: number;
        monthlyTax: number;
        yearlyTax: number;
        monthlySalaryAfterTax: number;
        yearlySalaryAfterTax: number;
    } | null>(null);

    const TAX_RATE = 0.0477273; // 4.77273%

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat("en-PK", {
            style: "currency",
            currency: "PKR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleCalculate = () => {
        const salary = parseFloat(monthlySalary);

        // Validation
        if (isNaN(salary) || salary <= 0) {
            toast({
                title: "Error",
                description: "Please enter a valid monthly salary greater than 0.",
                variant: "destructive",
            });
            return;
        }

        // Calculations
        const yearlySalary = salary * 12;
        const monthlyTax = salary * TAX_RATE;
        const yearlyTax = yearlySalary * TAX_RATE;
        const monthlySalaryAfterTax = salary - monthlyTax;
        const yearlySalaryAfterTax = yearlySalary - yearlyTax;

        setResults({
            yearlySalary,
            monthlyTax,
            yearlyTax,
            monthlySalaryAfterTax,
            yearlySalaryAfterTax,
        });
    };

    const handleReset = () => {
        setMonthlySalary("");
        setResults(null);
    };

    const handleBack = () => {
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 sm:p-20">
            <div className="max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Calculator className="h-8 w-8 text-[#af0e0e]" />
                        <h1 className="text-3xl font-bold text-gray-900">Salary Tax Calculator</h1>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        className="flex items-center transition-shadow hover:shadow-sm"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </div>

                {/* Calculator Card */}
                <Card className="border border-red-200 shadow-lg animate-in fade-in duration-500">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold text-gray-900">
                            Calculate Your Tax
                        </CardTitle>
                        <p className="text-gray-600">
                            Enter your monthly salary to calculate your tax obligations at a rate of 4.77%.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Input Form */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="monthly-salary" className="text-gray-700">
                                        Monthly Salary (PKR)
                                    </Label>
                                    <Input
                                        id="monthly-salary"
                                        type="number"
                                        placeholder="Enter your monthly salary"
                                        value={monthlySalary}
                                        onChange={(e) => setMonthlySalary(e.target.value)}
                                        className="border-gray-300 focus:border-[#af0e0e] focus:ring-[#af0e0e]"
                                    />
                                </div>
                                <div className="flex items-end space-x-3">
                                    <Button
                                        onClick={handleCalculate}
                                        className="bg-[#af0e0e] hover:bg-[#af0e0e]/90 text-white transition-all duration-200 hover:shadow-lg"
                                    >
                                        <Calculator className="h-4 w-4 mr-2" />
                                        Calculate Tax
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleReset}
                                        className="transition-shadow hover:shadow-sm"
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Reset
                                    </Button>
                                </div>
                            </div>

                            {/* Results */}
                            {results && (
                                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Calculation Results</h3>
                                    <div className="space-y-6">
                                        {/* Monthly Figures Row */}
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Monthly Figures</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-[#af0e0e] rounded-lg text-white">
                                                        <DollarSign className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">Monthly Salary</p>
                                                        <p className="text-lg font-semibold text-gray-900">
                                                            {formatCurrency(parseFloat(monthlySalary))}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-orange-500 rounded-lg text-white">
                                                        <Receipt className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">Monthly Tax (4.77%)</p>
                                                        <p className="text-lg font-semibold text-gray-900">
                                                            {formatCurrency(results.monthlyTax)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-green-500 rounded-lg text-white">
                                                        <DollarSign className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">Monthly Salary After Tax</p>
                                                        <p className="text-lg font-semibold text-gray-900">
                                                            {formatCurrency(results.monthlySalaryAfterTax)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Yearly Figures Row */}
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Yearly Figures</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-[#af0e0e] rounded-lg text-white">
                                                        <DollarSign className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">Yearly Salary</p>
                                                        <p className="text-lg font-semibold text-gray-900">
                                                            {formatCurrency(results.yearlySalary)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-orange-500 rounded-lg text-white">
                                                        <Receipt className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">Yearly Tax (4.77%)</p>
                                                        <p className="text-lg font-semibold text-gray-900">
                                                            {formatCurrency(results.yearlyTax)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-blue-500 rounded-lg text-white">
                                                        <DollarSign className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">Yearly Salary After Tax</p>
                                                        <p className="text-lg font-semibold text-gray-900">
                                                            {formatCurrency(results.yearlySalaryAfterTax)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}