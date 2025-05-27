"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface BankDetailsStepProps {
  formData: any
  handleInputChange: (field: string, value: any) => void
}

export function BankDetailsStep({ formData, handleInputChange }: BankDetailsStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Bank Details</h2>
      <p className="text-sm text-muted-foreground">Provide bank details for tax refunds</p>
      <div className="space-y-2">
        <Label htmlFor="bankDetails">Bank Account Details</Label>
        <Input
          id="bankDetails"
          value={formData.bankDetails}
          onChange={(e) => handleInputChange("bankDetails", e.target.value)}
          placeholder="Enter IBAN or account number"
        />
      </div>
    </div>
  )
}
