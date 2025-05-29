"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TaxFilingService } from "@/services/taxFiling.service"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

interface TaxYearStepProps {
  formData: any
  handleInputChange: (field: string, value: any) => void
}

export function TaxYearStep({ formData, handleInputChange }: TaxYearStepProps) {
  const params = useParams();
  const filingId = params.id as string;
  const [filingYear, setFilingYear] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const stepData = async () => {
    try {
      const ts = new TaxFilingService();
      const res = await ts.getStep(filingId, '1');
      const yearString = res.taxYear?.toString();
      setFilingYear(yearString);
      handleInputChange("taxYear", yearString);
    } catch (error) {
      console.error("Error fetching step data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (filingId) {
      stepData();
    }
  }, [])


  // Don't render the select until we have data
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Select Tax Year</h2>
        <div>Loading...</div>
      </div>
    )
  }

  // Convert formData.taxYear to string for the select
  const selectValue = formData.taxYear ? String(formData.taxYear) : "";

  console.log("About to render select with value:", selectValue);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Select Tax Year</h2>
      <div className="relative">
        <Select
          onValueChange={(value) => handleInputChange("taxYear", value)}
          value={selectValue}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select tax year" />
          </SelectTrigger>
          <SelectContent className="absolute z-50 bg-white">
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - i
              return (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}