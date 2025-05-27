"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TaxYearStepProps {
  formData: any
  handleInputChange: (field: string, value: any) => void
}

export function TaxYearStep({ formData, handleInputChange }: TaxYearStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Select Tax Year</h2>
      <div className="relative">
        <Select onValueChange={(value) => handleInputChange("taxYear", value)} value={formData.taxYear}>
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
