"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TaxCreditsStepProps {
  formData: any
  handleInputChange: (field: string, value: any) => void
}

export function TaxCreditsStep({ formData, handleInputChange }: TaxCreditsStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Tax Credits</h2>
      <p className="text-sm text-muted-foreground">Enter any applicable tax credits</p>
      <div className="space-y-2">
        <Label htmlFor="taxCredits">Tax Credits (PKR)</Label>
        <Input
          id="taxCredits"
          type="number"
          value={formData.taxCredits}
          onChange={(e) => handleInputChange("taxCredits", e.target.value)}
          placeholder="Enter total tax credits"
        />
      </div>
    </div>
  )
}
