import React, { useState, useEffect } from "react";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useParams } from "next/navigation";
import { TaxFilingService } from "@/services/taxFiling.service";
import { toast } from "../ui/use-toast";

// Define interfaces matching backend structure
interface BankTransaction {
  transactionType: string;
  bankName: string;
  accountNo: string;
  taxDeducted: number;
}

interface Utility {
  utilityType: string;
  provider: string;
  consumerNo: string;
  taxDeducted: number;
}

interface Vehicle {
  activityType: string;
  vehicleType: string;
  registrationNo: string;
  taxDeducted: number;
}

interface OtherDeduction {
  propertyPurchaseTax: number;
  propertySaleTax: number;
  functionsGatheringTax: number;
  pensionWithdrawalTax: number;
}

interface TaxDeducted {
  bankTransactions?: BankTransaction[];
  utilities?: Utility[];
  vehicles?: Vehicle[];
  other?: OtherDeduction;
}

interface FormData {
  deductions: string[];
  deductionDetails: TaxDeducted;
}

interface Deduction {
  id: string;
  label: string;
}

interface DeductionsStepProps {
  formData: FormData;
  handleInputChange: (field: string, value: any) => void;
}

export default function DeductionsStep({ formData, handleInputChange }: DeductionsStepProps) {
  const params = useParams();
  const filingId = params.id as string;
  const [isLoading, setIsLoading] = useState(false);

  const deductions: Deduction[] = [
    { id: "bank_transactions", label: "Bank Transactions" },
    { id: "vehicles", label: "Vehicles" },
    { id: "utilities", label: "Utilities" },
    { id: "other", label: "Other Deductions" },
  ];

  const stepData = async () => {
    try {
      setIsLoading(true);
      const ts = new TaxFilingService();
      const res = await ts.getStep(filingId, "4");

      // Extract deduction types from taxDeducted
      const taxDeducted: TaxDeducted = res?.taxDeducted || {};
      const deductionTypes: string[] = [];
      if (Array.isArray(taxDeducted.bankTransactions) && taxDeducted.bankTransactions.length > 0) {
        deductionTypes.push("bank_transactions");
      }
      if (Array.isArray(taxDeducted.vehicles) && taxDeducted.vehicles.length > 0) {
        deductionTypes.push("vehicles");
      }
      if (Array.isArray(taxDeducted.utilities) && taxDeducted.utilities.length > 0) {
        deductionTypes.push("utilities");
      }
      if (
        taxDeducted.other &&
        Object.values(taxDeducted.other).some((value) => value > 0)
      ) {
        deductionTypes.push("other");
      }

      // Update formData.deductions and deductionDetails
      handleInputChange("deductions", deductionTypes);
      handleInputChange("deductionDetails", taxDeducted);
    } catch (error) {
      console.error("Error fetching step data:", error);
      toast({
        title: "Error",
        description: "Failed to load deduction data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (filingId) {
      stepData();
    }
  }, [filingId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Select Deductions</CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose the deductions you want to claim. You can provide details in the next step.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Loading deductions...</div>
        ) : (
          <div className="space-y-2">
            {deductions.map((deduction) => (
              <div key={deduction.id} className="flex items-center space-x-2">
                <Checkbox
                  id={deduction.id}
                  checked={formData.deductions?.includes(deduction.id) || false}
                  onCheckedChange={(checked) => {
                    const currentDeductions = Array.isArray(formData.deductions) ? [...formData.deductions] : [];
                    if (checked) {
                      if (!currentDeductions.includes(deduction.id)) {
                        handleInputChange("deductions", [...currentDeductions, deduction.id]);
                      }
                    } else {
                      handleInputChange(
                        "deductions",
                        currentDeductions.filter((id) => id !== deduction.id)
                      );
                    }
                  }}
                />
                <Label htmlFor={deduction.id} className="text-sm">
                  {deduction.label}
                </Label>
              </div>
            ))}
          </div>
        )}
        {(!formData.deductions || formData.deductions.length === 0) && !isLoading && (
          <p className="text-sm text-yellow-600">Please select at least one deduction to proceed.</p>
        )}
      </CardContent>
    </Card>
  );
}