"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useState } from "react"

interface TaxCreditsStepProps {
  formData: any
  handleInputChange: (field: string, value: any) => void
}

export function TaxCreditsStep({ formData, handleInputChange }: TaxCreditsStepProps) {
  // Initialize taxCredits with defaults if undefined or incomplete
  const taxCredits = {
    donations: formData.taxCredits?.donations || { enabled: false, taxCreditAmount: undefined },
    pensionFund: formData.taxCredits?.pensionFund || { enabled: false, taxCreditAmount: undefined },
    tuitionFees: formData.taxCredits?.tuitionFees || { enabled: false, taxCreditAmount: undefined },
  }

  // State for validation errors
  const [errors, setErrors] = useState({
    donations: "",
    pensionFund: "",
    tuitionFees: "",
  })

  // Handle checkbox toggle for each tax credit type
  const handleCheckboxChange = (type: string, checked: boolean) => {
    const updatedTaxCredits = {
      ...taxCredits,
      [type]: {
        enabled: checked,
        taxCreditAmount: checked ? taxCredits[type].taxCreditAmount || "" : undefined,
      },
    }

    // Clear error when disabling
    if (!checked) {
      setErrors((prev) => ({ ...prev, [type]: "" }))
    }

    handleInputChange("taxCredits", updatedTaxCredits)
  }

  // Handle tax credit amount input
  const handleAmountChange = (type: string, value: string) => {
    const numericValue = value === "" ? "" : Number(value)

    // Validate input
    let error = ""
    if (taxCredits[type].enabled && (numericValue <= 0 || isNaN(numericValue))) {
      error = "Tax credit amount must be greater than 0"
    }

    setErrors((prev) => ({ ...prev, [type]: error }))

    const updatedTaxCredits = {
      ...taxCredits,
      [type]: {
        ...taxCredits[type],
        taxCreditAmount: numericValue === "" ? "" : numericValue,
      },
    }

    handleInputChange("taxCredits", updatedTaxCredits)
  }

  // Calculate total tax credits with defensive checks
  const totalTaxCredits =
    ((taxCredits.donations?.enabled && taxCredits.donations.taxCreditAmount && !isNaN(Number(taxCredits.donations.taxCreditAmount))
      ? Number(taxCredits.donations.taxCreditAmount)
      : 0) +
      (taxCredits.pensionFund?.enabled && taxCredits.pensionFund.taxCreditAmount && !isNaN(Number(taxCredits.pensionFund.taxCreditAmount))
        ? Number(taxCredits.pensionFund.taxCreditAmount)
        : 0) +
      (taxCredits.tuitionFees?.enabled && taxCredits.tuitionFees.taxCreditAmount && !isNaN(Number(taxCredits.tuitionFees.taxCreditAmount))
        ? Number(taxCredits.tuitionFees.taxCreditAmount)
        : 0))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tax Credits</CardTitle>
        <p className="text-sm text-muted-foreground">
          Specify any applicable tax credits for donations, pension funds, or tuition fees.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Donations */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="donations"
              checked={taxCredits.donations.enabled}
              onCheckedChange={(checked) => handleCheckboxChange("donations", checked as boolean)}
            />
            <Label htmlFor="donations" className="font-medium">
              Donations
            </Label>
          </div>
          {taxCredits.donations.enabled && (
            <div className="ml-6 space-y-1">
              <Label htmlFor="donationsAmount">Donation Tax Credit Amount (PKR)</Label>
              <Input
                id="donationsAmount"
                type="number"
                min="0"
                value={taxCredits.donations.taxCreditAmount ?? ""}
                onChange={(e) => handleAmountChange("donations", e.target.value)}
                placeholder="Enter donation tax credit amount"
                className={errors.donations ? "border-red-500" : ""}
              />
              {errors.donations && (
                <Alert variant="destructive" className="py-1">
                  <AlertDescription className="text-xs">{errors.donations}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        {/* Pension Fund */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pensionFund"
              checked={taxCredits.pensionFund.enabled}
              onCheckedChange={(checked) => handleCheckboxChange("pensionFund", checked as boolean)}
            />
            <Label htmlFor="pensionFund" className="font-medium">
              Pension Fund Contributions
            </Label>
          </div>
          {taxCredits.pensionFund.enabled && (
            <div className="ml-6 space-y-1">
              <Label htmlFor="pensionFundAmount">Pension Fund Tax Credit Amount (PKR)</Label>
              <Input
                id="pensionFundAmount"
                type="number"
                min="0"
                value={taxCredits.pensionFund.taxCreditAmount ?? ""}
                onChange={(e) => handleAmountChange("pensionFund", e.target.value)}
                placeholder="Enter pension fund tax credit amount"
                className={errors.pensionFund ? "border-red-500" : ""}
              />
              {errors.pensionFund && (
                <Alert variant="destructive" className="py-1">
                  <AlertDescription className="text-xs">{errors.pensionFund}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        {/* Tuition Fees */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tuitionFees"
              checked={taxCredits.tuitionFees.enabled}
              onCheckedChange={(checked) => handleCheckboxChange("tuitionFees", checked as boolean)}
            />
            <Label htmlFor="tuitionFees" className="font-medium">
              Tuition Fees
            </Label>
          </div>
          {taxCredits.tuitionFees.enabled && (
            <div className="ml-6 space-y-1">
              <Label htmlFor="tuitionFeesAmount">Tuition Fees Tax Credit Amount (PKR)</Label>
              <Input
                id="tuitionFeesAmount"
                type="number"
                min="0"
                value={taxCredits.tuitionFees.taxCreditAmount ?? ""}
                onChange={(e) => handleAmountChange("tuitionFees", e.target.value)}
                placeholder="Enter tuition fees tax credit amount"
                className={errors.tuitionFees ? "border-red-500" : ""}
              />
              {errors.tuitionFees && (
                <Alert variant="destructive" className="py-1">
                  <AlertDescription className="text-xs">{errors.tuitionFees}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        {/* Total Tax Credits Summary */}
        {totalTaxCredits > 0 && (
          <div className="mt-4 p-4 bg-muted-foreground/10 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Tax Credits:</span>
              <span className="font-semibold text-lg">PKR {totalTaxCredits.toLocaleString()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}