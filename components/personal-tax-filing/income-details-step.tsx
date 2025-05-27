"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, X, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface IncomeDetailsStepProps {
  formData: any
  handleInputChange: (field: string, value: any) => void
}

export function IncomeDetailsStep({ formData, handleInputChange }: IncomeDetailsStepProps) {
  const [currentIncomeIndex, setCurrentIncomeIndex] = useState(0)

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "")
    return numericValue ? Number.parseInt(numericValue).toLocaleString() : ""
  }

  const handleCurrencyInput = (field: string, value: string) => {
    const numericValue = value.replace(/[^\d]/g, "")
    handleInputChange(field, numericValue)
  }

  const incomeSourcesMap = {
    salary: "Salary Income",
    business: "Business/Self Employed",
    freelancer: "Freelancer",
    professional: "Professional Services",
    pension: "Pension",
    agriculture: "Agriculture",
    commission: "Commission/Service",
    partnership: "Partnership/AOP",
    property: "Rent/Property Sale",
    savings: "Profit on Savings",
    dividend: "Dividend/Capital Gain",
    other: "Other Income",
  }

  const selectedIncomeSources = formData.incomeSources || []
  const currentSourceId = selectedIncomeSources[currentIncomeIndex]
  const currentSourceTitle = incomeSourcesMap[currentSourceId as keyof typeof incomeSourcesMap]

  const isIncomeSourceCompleted = (sourceId: string) => {
    switch (sourceId) {
      case "salary":
        return !!(formData.salaryIncome && formData.employerName)
      case "business":
        return !!(formData.businessIncome && formData.businessType)
      case "freelancer":
        return !!formData.freelancerIncome
      case "professional":
        return !!(formData.professionalIncome && formData.profession)
      case "pension":
        return !!formData.pensionIncome
      case "agriculture":
        return !!formData.agricultureIncome
      case "commission":
        return !!(
          formData.lifeInsuranceAmount ||
          formData.generalInsuranceAmount ||
          formData.realEstateTravelAmount ||
          formData.servicesConsultancyAmount ||
          formData.otherCommissionsAmount
        )
      case "partnership":
        return !!(formData.partnershipIncome && formData.partnershipName)
      case "property":
        return !!(
          (formData.propertyRentEntries && formData.propertyRentEntries.length > 0) ||
          (formData.propertySaleEntries && formData.propertySaleEntries.length > 0)
        )
      case "savings":
        return !!formData.savingsIncome
      case "dividend":
        return !!(formData.dividendIncome || formData.capitalGain)
      case "other":
        return !!(formData.otherIncomeInflows && formData.otherIncomeInflows.length > 0)
      default:
        return false
    }
  }

  const handlePreviousIncome = () => {
    if (currentIncomeIndex > 0) {
      setCurrentIncomeIndex(currentIncomeIndex - 1)
    }
  }

  const handleNextIncome = () => {
    if (currentIncomeIndex < selectedIncomeSources.length - 1) {
      setCurrentIncomeIndex(currentIncomeIndex + 1)
    }
  }

  const handleIncomeNavigation = (index: number) => {
    setCurrentIncomeIndex(index)
  }

  const renderIncomeSection = (sourceId: string, title: string) => {
    switch (sourceId) {
      case "salary":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryIncome">Annual Salary (PKR)</Label>
                <Input
                  id="salaryIncome"
                  value={formatCurrency(formData.salaryIncome || "")}
                  onChange={(e) => handleCurrencyInput("salaryIncome", e.target.value)}
                  placeholder="Enter annual salary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxDeductedBySalaryEmployer">Tax Deducted by Employer (PKR)</Label>
                <Input
                  id="taxDeductedBySalaryEmployer"
                  value={formatCurrency(formData.taxDeductedBySalaryEmployer || "")}
                  onChange={(e) => handleCurrencyInput("taxDeductedBySalaryEmployer", e.target.value)}
                  placeholder="Enter tax deducted"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="employerName">Employer Name</Label>
              <Input
                id="employerName"
                value={formData.employerName || ""}
                onChange={(e) => handleInputChange("employerName", e.target.value)}
                placeholder="Enter employer name"
              />
            </div>
          </div>
        )

      case "business":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessIncome">Annual Business Income (PKR)</Label>
                <Input
                  id="businessIncome"
                  value={formatCurrency(formData.businessIncome || "")}
                  onChange={(e) => handleCurrencyInput("businessIncome", e.target.value)}
                  placeholder="Enter business income"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessExpenses">Business Expenses (PKR)</Label>
                <Input
                  id="businessExpenses"
                  value={formatCurrency(formData.businessExpenses || "")}
                  onChange={(e) => handleCurrencyInput("businessExpenses", e.target.value)}
                  placeholder="Enter business expenses"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType">Type of Business</Label>
              <Select
                onValueChange={(value) => handleInputChange("businessType", value)}
                value={formData.businessType || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trading">Trading</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "freelancer":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="freelancerIncome">Annual Freelance Income (PKR)</Label>
                <Input
                  id="freelancerIncome"
                  value={formatCurrency(formData.freelancerIncome || "")}
                  onChange={(e) => handleCurrencyInput("freelancerIncome", e.target.value)}
                  placeholder="Enter freelance income"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="freelancerExpenses">Business Expenses (PKR)</Label>
                <Input
                  id="freelancerExpenses"
                  value={formatCurrency(formData.freelancerExpenses || "")}
                  onChange={(e) => handleCurrencyInput("freelancerExpenses", e.target.value)}
                  placeholder="Enter expenses"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="freelanceServices">Type of Services</Label>
              <Textarea
                id="freelanceServices"
                value={formData.freelanceServices || ""}
                onChange={(e) => handleInputChange("freelanceServices", e.target.value)}
                placeholder="Describe your freelance services"
              />
            </div>
          </div>
        )

      case "professional":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="professionalIncome">Annual Professional Income (PKR)</Label>
                <Input
                  id="professionalIncome"
                  value={formatCurrency(formData.professionalIncome || "")}
                  onChange={(e) => handleCurrencyInput("professionalIncome", e.target.value)}
                  placeholder="Enter professional income"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="professionalExpenses">Professional Expenses (PKR)</Label>
                <Input
                  id="professionalExpenses"
                  value={formatCurrency(formData.professionalExpenses || "")}
                  onChange={(e) => handleCurrencyInput("professionalExpenses", e.target.value)}
                  placeholder="Enter expenses"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profession">Profession</Label>
              <Select
                onValueChange={(value) => handleInputChange("profession", value)}
                value={formData.profession || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select profession" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="lawyer">Lawyer</SelectItem>
                  <SelectItem value="engineer">Engineer</SelectItem>
                  <SelectItem value="architect">Architect</SelectItem>
                  <SelectItem value="consultant">Consultant</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "pension":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pensionIncome">Annual Pension Amount (PKR)</Label>
              <Input
                id="pensionIncome"
                value={formatCurrency(formData.pensionIncome || "")}
                onChange={(e) => handleCurrencyInput("pensionIncome", e.target.value)}
                placeholder="Enter annual pension amount"
              />
            </div>
          </div>
        )

      case "agriculture":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agricultureIncome">Annual Agriculture Income (PKR)</Label>
              <Input
                id="agricultureIncome"
                value={formatCurrency(formData.agricultureIncome || "")}
                onChange={(e) => handleCurrencyInput("agricultureIncome", e.target.value)}
                placeholder="Enter annual agriculture income"
              />
            </div>
          </div>
        )

      case "commission":
        return (
          <div className="space-y-6">
            {/* Life Insurance Agent */}
            <div className="border rounded-lg p-4 bg-blue-50/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-blue-900">Life Insurance Agent</h4>
                <Badge variant="outline" className="text-xs">
                  8% up to 5 lac, 12% above 5 lac
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lifeInsuranceAmount">Amount (PKR)</Label>
                  <Input
                    id="lifeInsuranceAmount"
                    value={formatCurrency(formData.lifeInsuranceAmount || "")}
                    onChange={(e) => handleCurrencyInput("lifeInsuranceAmount", e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lifeInsuranceTaxDeducted">Tax Deducted (PKR)</Label>
                  <Input
                    id="lifeInsuranceTaxDeducted"
                    value={formatCurrency(formData.lifeInsuranceTaxDeducted || "")}
                    onChange={(e) => handleCurrencyInput("lifeInsuranceTaxDeducted", e.target.value)}
                    placeholder="Enter tax deducted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lifeInsuranceExpense">Expense (PKR)</Label>
                  <Input
                    id="lifeInsuranceExpense"
                    value={formatCurrency(formData.lifeInsuranceExpense || "")}
                    onChange={(e) => handleCurrencyInput("lifeInsuranceExpense", e.target.value)}
                    placeholder="Enter expense"
                  />
                </div>
              </div>
            </div>

            {/* Insurance Agent - General/Others */}
            <div className="border rounded-lg p-4 bg-green-50/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-green-900">Insurance Agent - General/Others</h4>
                <Badge variant="outline" className="text-xs">
                  Taxed at 12%
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="generalInsuranceAmount">Amount (PKR)</Label>
                  <Input
                    id="generalInsuranceAmount"
                    value={formatCurrency(formData.generalInsuranceAmount || "")}
                    onChange={(e) => handleCurrencyInput("generalInsuranceAmount", e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="generalInsuranceTaxDeducted">Tax Deducted (PKR)</Label>
                  <Input
                    id="generalInsuranceTaxDeducted"
                    value={formatCurrency(formData.generalInsuranceTaxDeducted || "")}
                    onChange={(e) => handleCurrencyInput("generalInsuranceTaxDeducted", e.target.value)}
                    placeholder="Enter tax deducted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="generalInsuranceExpense">Expense (PKR)</Label>
                  <Input
                    id="generalInsuranceExpense"
                    value={formatCurrency(formData.generalInsuranceExpense || "")}
                    onChange={(e) => handleCurrencyInput("generalInsuranceExpense", e.target.value)}
                    placeholder="Enter expense"
                  />
                </div>
              </div>
            </div>

            {/* Real Estate/Travel Agent */}
            <div className="border rounded-lg p-4 bg-orange-50/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-orange-900">Real Estate/Travel Agent</h4>
                <Badge variant="outline" className="text-xs">
                  Taxed at 12%
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="realEstateTravelAmount">Amount (PKR)</Label>
                  <Input
                    id="realEstateTravelAmount"
                    value={formatCurrency(formData.realEstateTravelAmount || "")}
                    onChange={(e) => handleCurrencyInput("realEstateTravelAmount", e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="realEstateTravelTaxDeducted">Tax Deducted (PKR)</Label>
                  <Input
                    id="realEstateTravelTaxDeducted"
                    value={formatCurrency(formData.realEstateTravelTaxDeducted || "")}
                    onChange={(e) => handleCurrencyInput("realEstateTravelTaxDeducted", e.target.value)}
                    placeholder="Enter tax deducted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="realEstateTravelExpense">Expense (PKR)</Label>
                  <Input
                    id="realEstateTravelExpense"
                    value={formatCurrency(formData.realEstateTravelExpense || "")}
                    onChange={(e) => handleCurrencyInput("realEstateTravelExpense", e.target.value)}
                    placeholder="Enter expense"
                  />
                </div>
              </div>
            </div>

            {/* Services/Consultancy */}
            <div className="border rounded-lg p-4 bg-purple-50/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-purple-900">Services/Consultancy</h4>
                <Badge variant="outline" className="text-xs">
                  Taxed at 10%
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="servicesConsultancyAmount">Amount (PKR)</Label>
                  <Input
                    id="servicesConsultancyAmount"
                    value={formatCurrency(formData.servicesConsultancyAmount || "")}
                    onChange={(e) => handleCurrencyInput("servicesConsultancyAmount", e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servicesConsultancyTaxDeducted">Tax Deducted (PKR)</Label>
                  <Input
                    id="servicesConsultancyTaxDeducted"
                    value={formatCurrency(formData.servicesConsultancyTaxDeducted || "")}
                    onChange={(e) => handleCurrencyInput("servicesConsultancyTaxDeducted", e.target.value)}
                    placeholder="Enter tax deducted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servicesConsultancyExpense">Expense (PKR)</Label>
                  <Input
                    id="servicesConsultancyExpense"
                    value={formatCurrency(formData.servicesConsultancyExpense || "")}
                    onChange={(e) => handleCurrencyInput("servicesConsultancyExpense", e.target.value)}
                    placeholder="Enter expense"
                  />
                </div>
              </div>
            </div>

            {/* Other Commissions */}
            <div className="border rounded-lg p-4 bg-gray-50/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Other Commissions</h4>
                <Badge variant="outline" className="text-xs">
                  Taxed at 12%
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="otherCommissionsAmount">Amount (PKR)</Label>
                  <Input
                    id="otherCommissionsAmount"
                    value={formatCurrency(formData.otherCommissionsAmount || "")}
                    onChange={(e) => handleCurrencyInput("otherCommissionsAmount", e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otherCommissionsTaxDeducted">Tax Deducted (PKR)</Label>
                  <Input
                    id="otherCommissionsTaxDeducted"
                    value={formatCurrency(formData.otherCommissionsTaxDeducted || "")}
                    onChange={(e) => handleCurrencyInput("otherCommissionsTaxDeducted", e.target.value)}
                    placeholder="Enter tax deducted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otherCommissionsExpense">Expense (PKR)</Label>
                  <Input
                    id="otherCommissionsExpense"
                    value={formatCurrency(formData.otherCommissionsExpense || "")}
                    onChange={(e) => handleCurrencyInput("otherCommissionsExpense", e.target.value)}
                    placeholder="Enter expense"
                  />
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-3">Commission Income Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                {[
                  {
                    label: "Life Insurance",
                    amount: formData.lifeInsuranceAmount,
                    expense: formData.lifeInsuranceExpense,
                    tax: formData.lifeInsuranceTaxDeducted,
                  },
                  {
                    label: "General Insurance",
                    amount: formData.generalInsuranceAmount,
                    expense: formData.generalInsuranceExpense,
                    tax: formData.generalInsuranceTaxDeducted,
                  },
                  {
                    label: "Real Estate/Travel",
                    amount: formData.realEstateTravelAmount,
                    expense: formData.realEstateTravelExpense,
                    tax: formData.realEstateTravelTaxDeducted,
                  },
                  {
                    label: "Services/Consultancy",
                    amount: formData.servicesConsultancyAmount,
                    expense: formData.servicesConsultancyExpense,
                    tax: formData.servicesConsultancyTaxDeducted,
                  },
                  {
                    label: "Other Commissions",
                    amount: formData.otherCommissionsAmount,
                    expense: formData.otherCommissionsExpense,
                    tax: formData.otherCommissionsTaxDeducted,
                  },
                ].map((item, index) => {
                  const netIncome = Number(item.amount || 0) - Number(item.expense || 0)
                  if (netIncome <= 0) return null
                  return (
                    <div key={index} className="p-3 bg-white rounded border">
                      <div className="font-medium text-xs text-muted-foreground mb-1">{item.label}</div>
                      <div className="text-sm font-semibold">PKR {netIncome.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        Tax Deducted: PKR {Number(item.tax || 0).toLocaleString()}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Commission Income:</span>
                  <span className="font-semibold text-lg">
                    PKR{" "}
                    {[
                      Number(formData.lifeInsuranceAmount || 0) - Number(formData.lifeInsuranceExpense || 0),
                      Number(formData.generalInsuranceAmount || 0) - Number(formData.generalInsuranceExpense || 0),
                      Number(formData.realEstateTravelAmount || 0) - Number(formData.realEstateTravelExpense || 0),
                      Number(formData.servicesConsultancyAmount || 0) -
                        Number(formData.servicesConsultancyExpense || 0),
                      Number(formData.otherCommissionsAmount || 0) - Number(formData.otherCommissionsExpense || 0),
                    ]
                      .reduce((total, income) => total + Math.max(0, income), 0)
                      .toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )

      case "partnership":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partnershipIncome">Annual Partnership Income (PKR)</Label>
                <Input
                  id="partnershipIncome"
                  value={formatCurrency(formData.partnershipIncome || "")}
                  onChange={(e) => handleCurrencyInput("partnershipIncome", e.target.value)}
                  placeholder="Enter partnership income"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partnershipShare">Your Share (%)</Label>
                <Input
                  id="partnershipShare"
                  type="number"
                  max="100"
                  value={formData.partnershipShare || ""}
                  onChange={(e) => handleInputChange("partnershipShare", e.target.value)}
                  placeholder="Enter your share percentage"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="partnershipName">Partnership/AOP Name</Label>
              <Input
                id="partnershipName"
                value={formData.partnershipName || ""}
                onChange={(e) => handleInputChange("partnershipName", e.target.value)}
                placeholder="Enter partnership name"
              />
            </div>
          </div>
        )

      case "property":
        return (
          <div className="space-y-6">
            {/* Property Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Select Property Income Types</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="propertyRent"
                    checked={formData.propertyTypes?.includes("rent") || false}
                    onChange={(e) => {
                      const currentTypes = formData.propertyTypes || []
                      if (e.target.checked) {
                        handleInputChange("propertyTypes", [...currentTypes, "rent"])
                      } else {
                        handleInputChange(
                          "propertyTypes",
                          currentTypes.filter((type: string) => type !== "rent"),
                        )
                        // Clear related data
                        handleInputChange("propertyRentEntries", [])
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="propertyRent" className="cursor-pointer">
                    Property Rent
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="propertySale"
                    checked={formData.propertyTypes?.includes("sale") || false}
                    onChange={(e) => {
                      const currentTypes = formData.propertyTypes || []
                      if (e.target.checked) {
                        handleInputChange("propertyTypes", [...currentTypes, "sale"])
                      } else {
                        handleInputChange(
                          "propertyTypes",
                          currentTypes.filter((type: string) => type !== "sale"),
                        )
                        // Clear related data
                        handleInputChange("propertySaleEntries", [])
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="propertySale" className="cursor-pointer">
                    Gain on Sale of Property
                  </Label>
                </div>
              </div>
            </div>

            {/* Property Rent Section */}
            {formData.propertyTypes?.includes("rent") && (
              <div className="border rounded-lg p-4 bg-blue-50/50">
                <h4 className="font-medium mb-4 text-blue-900">Property Rent Income</h4>

                {/* Add New Rent Entry Form */}
                <div className="border rounded-lg p-4 bg-white mb-4">
                  <h5 className="font-medium mb-3">Add New Rental Property</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newRentPropertyAddress">Property Address</Label>
                      <Input
                        id="newRentPropertyAddress"
                        value={formData.newRentPropertyAddress || ""}
                        onChange={(e) => handleInputChange("newRentPropertyAddress", e.target.value)}
                        placeholder="Enter property address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newRentAnnualRent">Annual Rent Received (PKR)</Label>
                      <Input
                        id="newRentAnnualRent"
                        value={formatCurrency(formData.newRentAnnualRent || "")}
                        onChange={(e) => handleCurrencyInput("newRentAnnualRent", e.target.value)}
                        placeholder="Enter annual rent"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newRentExpenses">Rent Expenses During Year (PKR)</Label>
                      <Input
                        id="newRentExpenses"
                        value={formatCurrency(formData.newRentExpenses || "")}
                        onChange={(e) => handleCurrencyInput("newRentExpenses", e.target.value)}
                        placeholder="Enter expenses"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newRentTaxDeducted">Tax Deducted by Tenant (PKR)</Label>
                      <Input
                        id="newRentTaxDeducted"
                        value={formatCurrency(formData.newRentTaxDeducted || "")}
                        onChange={(e) => handleCurrencyInput("newRentTaxDeducted", e.target.value)}
                        placeholder="Enter tax deducted (if any)"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        if (formData.newRentPropertyAddress && formData.newRentAnnualRent) {
                          const newRentEntry = {
                            id: Date.now().toString(),
                            address: formData.newRentPropertyAddress,
                            annualRent: formData.newRentAnnualRent,
                            expenses: formData.newRentExpenses || "0",
                            taxDeducted: formData.newRentTaxDeducted || "0",
                          }
                          const currentEntries = formData.propertyRentEntries || []
                          handleInputChange("propertyRentEntries", [...currentEntries, newRentEntry])
                          // Clear form
                          handleInputChange("newRentPropertyAddress", "")
                          handleInputChange("newRentAnnualRent", "")
                          handleInputChange("newRentExpenses", "")
                          handleInputChange("newRentTaxDeducted", "")
                        }
                      }}
                      disabled={!formData.newRentPropertyAddress || !formData.newRentAnnualRent}
                      className="w-full md:w-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Rental Property
                    </Button>
                  </div>
                </div>

                {/* Display Added Rent Entries */}
                {formData.propertyRentEntries && formData.propertyRentEntries.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-medium">Added Rental Properties</h5>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {formData.propertyRentEntries.map((entry: any) => (
                        <div
                          key={entry.id}
                          className="border rounded-lg p-3 bg-white relative group hover:shadow-md transition-shadow"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              const updatedEntries = formData.propertyRentEntries.filter(
                                (item: any) => item.id !== entry.id,
                              )
                              handleInputChange("propertyRentEntries", updatedEntries)
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                          <div className="space-y-2 pr-6">
                            <div className="font-medium text-sm line-clamp-1">{entry.address}</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Annual Rent:</span>
                                <div className="font-medium">PKR {Number(entry.annualRent).toLocaleString()}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Expenses:</span>
                                <div className="font-medium">PKR {Number(entry.expenses).toLocaleString()}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Tax Deducted:</span>
                                <div className="font-medium">PKR {Number(entry.taxDeducted).toLocaleString()}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Net Income:</span>
                                <div className="font-medium text-green-600">
                                  PKR {(Number(entry.annualRent) - Number(entry.expenses)).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Property Sale Section */}
            {formData.propertyTypes?.includes("sale") && (
              <div className="border rounded-lg p-4 bg-green-50/50">
                <h4 className="font-medium mb-4 text-green-900">Gain on Sale of Property</h4>

                {/* Add New Sale Entry Form */}
                <div className="border rounded-lg p-4 bg-white mb-4">
                  <h5 className="font-medium mb-3">Add New Property Sale</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="newSalePropertyAddress">Property Address</Label>
                      <Input
                        id="newSalePropertyAddress"
                        value={formData.newSalePropertyAddress || ""}
                        onChange={(e) => handleInputChange("newSalePropertyAddress", e.target.value)}
                        placeholder="Enter property address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newSalePropertyType">Property Type</Label>
                      <Select
                        onValueChange={(value) => handleInputChange("newSalePropertyType", value)}
                        value={formData.newSalePropertyType || ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open-plot">Open Plot</SelectItem>
                          <SelectItem value="constructed-plot">Constructed Plot</SelectItem>
                          <SelectItem value="flat">Flat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newSalePurchasePrice">Purchase Price (PKR)</Label>
                      <Input
                        id="newSalePurchasePrice"
                        value={formatCurrency(formData.newSalePurchasePrice || "")}
                        onChange={(e) => handleCurrencyInput("newSalePurchasePrice", e.target.value)}
                        placeholder="Enter purchase price"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newSaleSalePrice">Sale Price (PKR)</Label>
                      <Input
                        id="newSaleSalePrice"
                        value={formatCurrency(formData.newSaleSalePrice || "")}
                        onChange={(e) => handleCurrencyInput("newSaleSalePrice", e.target.value)}
                        placeholder="Enter sale price"
                      />
                    </div>
                  </div>

                  {/* Holding Period Selection */}
                  {formData.newSalePropertyType && (
                    <div className="space-y-3 mb-4">
                      <Label className="text-base font-medium">Holding Period (July 1, 2023 to June 30, 2024)</Label>
                      <div className="space-y-2">
                        {formData.newSalePropertyType === "open-plot" && (
                          <>
                            {[
                              {
                                value: "purchased-sold-within-year",
                                label: "Purchased and sold within July 1, 2023 to June 30, 2024",
                              },
                              {
                                value: "1-2-years",
                                label: "Holding period is more than one year but less than two years",
                              },
                              {
                                value: "2-3-years",
                                label: "Holding period is more than two years but less than three years",
                              },
                              {
                                value: "3-4-years",
                                label: "Holding period is more than three years but less than four years",
                              },
                              {
                                value: "4-5-years",
                                label: "Holding period is more than four years but less than five years",
                              },
                              {
                                value: "5-6-years",
                                label: "Holding period is more than five years but less than six years",
                              },
                              { value: "more-than-6-years", label: "Holding period is more than six years" },
                            ].map((option) => (
                              <div key={option.value} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id={`holding-${option.value}`}
                                  name="newSaleHoldingPeriod"
                                  value={option.value}
                                  checked={formData.newSaleHoldingPeriod === option.value}
                                  onChange={(e) => handleInputChange("newSaleHoldingPeriod", e.target.value)}
                                  className="rounded border-gray-300"
                                />
                                <Label htmlFor={`holding-${option.value}`} className="cursor-pointer text-sm">
                                  {option.label}
                                </Label>
                              </div>
                            ))}
                          </>
                        )}
                        {formData.newSalePropertyType === "constructed-plot" && (
                          <>
                            {[
                              { value: "not-exceed-1-year", label: "Holding period does not exceed one year" },
                              {
                                value: "1-2-years",
                                label: "Holding period is more than one year but less than two years",
                              },
                              {
                                value: "2-3-years",
                                label: "Holding period is more than two years but less than three years",
                              },
                              {
                                value: "3-4-years",
                                label: "Holding period is more than three years but less than four years",
                              },
                              { value: "more-than-4-years", label: "Holding period is more than four years" },
                            ].map((option) => (
                              <div key={option.value} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id={`holding-${option.value}`}
                                  name="newSaleHoldingPeriod"
                                  value={option.value}
                                  checked={formData.newSaleHoldingPeriod === option.value}
                                  onChange={(e) => handleInputChange("newSaleHoldingPeriod", e.target.value)}
                                  className="rounded border-gray-300"
                                />
                                <Label htmlFor={`holding-${option.value}`} className="cursor-pointer text-sm">
                                  {option.label}
                                </Label>
                              </div>
                            ))}
                          </>
                        )}
                        {formData.newSalePropertyType === "flat" && (
                          <>
                            {[
                              { value: "not-exceed-1-year", label: "Holding period does not exceed one year" },
                              {
                                value: "1-2-years",
                                label: "Holding period is more than one year but less than two years",
                              },
                              { value: "more-than-2-years", label: "Holding period is more than two years" },
                            ].map((option) => (
                              <div key={option.value} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id={`holding-${option.value}`}
                                  name="newSaleHoldingPeriod"
                                  value={option.value}
                                  checked={formData.newSaleHoldingPeriod === option.value}
                                  onChange={(e) => handleInputChange("newSaleHoldingPeriod", e.target.value)}
                                  className="rounded border-gray-300"
                                />
                                <Label htmlFor={`holding-${option.value}`} className="cursor-pointer text-sm">
                                  {option.label}
                                </Label>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        if (
                          formData.newSalePropertyAddress &&
                          formData.newSalePropertyType &&
                          formData.newSalePurchasePrice &&
                          formData.newSaleSalePrice &&
                          formData.newSaleHoldingPeriod
                        ) {
                          const newSaleEntry = {
                            id: Date.now().toString(),
                            address: formData.newSalePropertyAddress,
                            propertyType: formData.newSalePropertyType,
                            purchasePrice: formData.newSalePurchasePrice,
                            salePrice: formData.newSaleSalePrice,
                            holdingPeriod: formData.newSaleHoldingPeriod,
                            gain: Number(formData.newSaleSalePrice) - Number(formData.newSalePurchasePrice),
                          }
                          const currentEntries = formData.propertySaleEntries || []
                          handleInputChange("propertySaleEntries", [...currentEntries, newSaleEntry])
                          // Clear form
                          handleInputChange("newSalePropertyAddress", "")
                          handleInputChange("newSalePropertyType", "")
                          handleInputChange("newSalePurchasePrice", "")
                          handleInputChange("newSaleSalePrice", "")
                          handleInputChange("newSaleHoldingPeriod", "")
                        }
                      }}
                      disabled={
                        !formData.newSalePropertyAddress ||
                        !formData.newSalePropertyType ||
                        !formData.newSalePurchasePrice ||
                        !formData.newSaleSalePrice ||
                        !formData.newSaleHoldingPeriod
                      }
                      className="w-full md:w-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Property Sale
                    </Button>
                  </div>
                </div>

                {/* Display Added Sale Entries */}
                {formData.propertySaleEntries && formData.propertySaleEntries.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-medium">Added Property Sales</h5>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {formData.propertySaleEntries.map((entry: any) => (
                        <div
                          key={entry.id}
                          className="border rounded-lg p-3 bg-white relative group hover:shadow-md transition-shadow"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              const updatedEntries = formData.propertySaleEntries.filter(
                                (item: any) => item.id !== entry.id,
                              )
                              handleInputChange("propertySaleEntries", updatedEntries)
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                          <div className="space-y-2 pr-6">
                            <div className="font-medium text-sm line-clamp-1">{entry.address}</div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {entry.propertyType === "open-plot" && "Open Plot"}
                                {entry.propertyType === "constructed-plot" && "Constructed Plot"}
                                {entry.propertyType === "flat" && "Flat"}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Purchase Price:</span>
                                <div className="font-medium">PKR {Number(entry.purchasePrice).toLocaleString()}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Sale Price:</span>
                                <div className="font-medium">PKR {Number(entry.salePrice).toLocaleString()}</div>
                              </div>
                              <div className="col-span-2">
                                <span className="text-muted-foreground">Capital Gain:</span>
                                <div className={`font-medium ${entry.gain >= 0 ? "text-green-600" : "text-red-600"}`}>
                                  PKR {entry.gain.toLocaleString()}
                                </div>
                              </div>
                              <div className="col-span-2">
                                <span className="text-muted-foreground">Holding Period:</span>
                                <div className="text-xs mt-1 p-1 bg-muted rounded">
                                  {entry.holdingPeriod === "purchased-sold-within-year" &&
                                    "Purchased and sold within July 1, 2023 to June 30, 2024"}
                                  {entry.holdingPeriod === "1-2-years" && "More than 1 year but less than 2 years"}
                                  {entry.holdingPeriod === "2-3-years" && "More than 2 years but less than 3 years"}
                                  {entry.holdingPeriod === "3-4-years" && "More than 3 years but less than 4 years"}
                                  {entry.holdingPeriod === "4-5-years" && "More than 4 years but less than 5 years"}
                                  {entry.holdingPeriod === "5-6-years" && "More than 5 years but less than 6 years"}
                                  {entry.holdingPeriod === "more-than-6-years" && "More than 6 years"}
                                  {entry.holdingPeriod === "not-exceed-1-year" && "Does not exceed 1 year"}
                                  {entry.holdingPeriod === "more-than-4-years" && "More than 4 years"}
                                  {entry.holdingPeriod === "more-than-2-years" && "More than 2 years"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Summary Section */}
            {(formData.propertyRentEntries?.length > 0 || formData.propertySaleEntries?.length > 0) && (
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-3">Property Income Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {formData.propertyRentEntries?.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Total Rental Income:</span>
                      <div className="font-semibold text-blue-600">
                        PKR{" "}
                        {formData.propertyRentEntries
                          .reduce(
                            (total: number, entry: any) => total + (Number(entry.annualRent) - Number(entry.expenses)),
                            0,
                          )
                          .toLocaleString()}
                      </div>
                    </div>
                  )}
                  {formData.propertySaleEntries?.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Total Capital Gains:</span>
                      <div className="font-semibold text-green-600">
                        PKR{" "}
                        {formData.propertySaleEntries
                          .reduce((total: number, entry: any) => total + entry.gain, 0)
                          .toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )

      case "savings":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="savingsIncome">Annual Profit on Savings (PKR)</Label>
                <Input
                  id="savingsIncome"
                  value={formatCurrency(formData.savingsIncome || "")}
                  onChange={(e) => handleCurrencyInput("savingsIncome", e.target.value)}
                  placeholder="Enter profit on savings"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="savingsTaxDeducted">Tax Deducted (PKR)</Label>
                <Input
                  id="savingsTaxDeducted"
                  value={formatCurrency(formData.savingsTaxDeducted || "")}
                  onChange={(e) => handleCurrencyInput("savingsTaxDeducted", e.target.value)}
                  placeholder="Enter tax deducted"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="savingsSource">Source of Savings</Label>
              <Select
                onValueChange={(value) => handleInputChange("savingsSource", value)}
                value={formData.savingsSource || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select savings source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank-deposit">Bank Deposit</SelectItem>
                  <SelectItem value="savings-account">Savings Account</SelectItem>
                  <SelectItem value="fixed-deposit">Fixed Deposit</SelectItem>
                  <SelectItem value="investment-fund">Investment Fund</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "dividend":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dividendIncome">Annual Dividend Income (PKR)</Label>
                <Input
                  id="dividendIncome"
                  value={formatCurrency(formData.dividendIncome || "")}
                  onChange={(e) => handleCurrencyInput("dividendIncome", e.target.value)}
                  placeholder="Enter dividend income"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capitalGain">Capital Gains (PKR)</Label>
                <Input
                  id="capitalGain"
                  value={formatCurrency(formData.capitalGain || "")}
                  onChange={(e) => handleCurrencyInput("capitalGain", e.target.value)}
                  placeholder="Enter capital gains"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dividendTaxDeducted">Tax Deducted on Dividend (PKR)</Label>
                <Input
                  id="dividendTaxDeducted"
                  value={formatCurrency(formData.dividendTaxDeducted || "")}
                  onChange={(e) => handleCurrencyInput("dividendTaxDeducted", e.target.value)}
                  placeholder="Enter tax deducted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="investmentType">Type of Investment</Label>
                <Select
                  onValueChange={(value) => handleInputChange("investmentType", value)}
                  value={formData.investmentType || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select investment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stocks">Stocks/Shares</SelectItem>
                    <SelectItem value="mutual-funds">Mutual Funds</SelectItem>
                    <SelectItem value="bonds">Bonds</SelectItem>
                    <SelectItem value="real-estate">Real Estate</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case "other":
        return (
          <div className="space-y-4">
            {/* Add New Inflow Form */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-medium mb-3">Add New Inflow</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newInflowType">Inflow Type</Label>
                  <Select
                    onValueChange={(value) => handleInputChange("newInflowType", value)}
                    value={formData.newInflowType || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select inflow type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gift">Gift</SelectItem>
                      <SelectItem value="remittance">Remittance</SelectItem>
                      <SelectItem value="inheritance">Inheritance</SelectItem>
                      <SelectItem value="gain-on-sales">Gain on Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newInflowAmount">Amount (PKR)</Label>
                  <Input
                    id="newInflowAmount"
                    value={formatCurrency(formData.newInflowAmount || "")}
                    onChange={(e) => handleCurrencyInput("newInflowAmount", e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newInflowDescription">Description</Label>
                  <Input
                    id="newInflowDescription"
                    value={formData.newInflowDescription || ""}
                    onChange={(e) => handleInputChange("newInflowDescription", e.target.value)}
                    placeholder="Enter description"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button
                  type="button"
                  onClick={() => {
                    if (formData.newInflowType && formData.newInflowAmount) {
                      const newInflow = {
                        id: Date.now().toString(),
                        type: formData.newInflowType,
                        amount: formData.newInflowAmount,
                        description: formData.newInflowDescription || "",
                      }
                      const currentInflows = formData.otherIncomeInflows || []
                      handleInputChange("otherIncomeInflows", [...currentInflows, newInflow])
                      // Clear form
                      handleInputChange("newInflowType", "")
                      handleInputChange("newInflowAmount", "")
                      handleInputChange("newInflowDescription", "")
                    }
                  }}
                  disabled={!formData.newInflowType || !formData.newInflowAmount}
                  className="w-full md:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Inflow
                </Button>
              </div>
            </div>

            {/* Display Added Inflows */}
            {formData.otherIncomeInflows && formData.otherIncomeInflows.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Added Inflows</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {formData.otherIncomeInflows.map((inflow: any) => (
                    <div
                      key={inflow.id}
                      className="border rounded-lg p-3 bg-background relative group hover:shadow-md transition-shadow"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          const updatedInflows = formData.otherIncomeInflows.filter(
                            (item: any) => item.id !== inflow.id,
                          )
                          handleInputChange("otherIncomeInflows", updatedInflows)
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {inflow.type === "gift" && "Gift"}
                            {inflow.type === "remittance" && "Remittance"}
                            {inflow.type === "inheritance" && "Inheritance"}
                            {inflow.type === "gain-on-sales" && "Gain on Sales"}
                          </Badge>
                        </div>
                        <div className="text-sm font-medium">PKR {Number(inflow.amount).toLocaleString()}</div>
                        {inflow.description && (
                          <div className="text-xs text-muted-foreground line-clamp-2">{inflow.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Total Other Income:</span>
                    <span className="font-semibold">
                      PKR{" "}
                      {formData.otherIncomeInflows
                        .reduce((total: number, inflow: any) => total + Number(inflow.amount || 0), 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {(!formData.otherIncomeInflows || formData.otherIncomeInflows.length === 0) && (
              <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                <div className="space-y-2">
                  <div className="text-sm">No inflows added yet</div>
                  <div className="text-xs">Add your first inflow using the form above</div>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  if (selectedIncomeSources.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No income sources selected. Please go back to Step 3 to select your income sources.</p>
      </div>
    )
  }

  return (
    <div className="flex gap-6">
      {/* Left Sidebar - Income Sources Navigation */}
      <div className="w-80 flex-shrink-0">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="text-lg">Income Sources Progress</CardTitle>
            <p className="text-sm text-muted-foreground">
              {selectedIncomeSources.length} source{selectedIncomeSources.length > 1 ? "s" : ""} selected
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedIncomeSources.map((sourceId: string, index: number) => {
              const isCompleted = isIncomeSourceCompleted(sourceId)
              const isCurrent = index === currentIncomeIndex
              const sourceTitle = incomeSourcesMap[sourceId as keyof typeof incomeSourcesMap]

              return (
                <div
                  key={sourceId}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    isCurrent
                      ? "border-[#af0e0e] bg-[#af0e0e]/5"
                      : isCompleted
                        ? "border-green-500 bg-green-50 hover:bg-green-100"
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() => handleIncomeNavigation(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          isCurrent
                            ? "bg-[#af0e0e] text-white"
                            : isCompleted
                              ? "bg-green-500 text-white"
                              : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        {isCompleted && !isCurrent ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                      </div>
                      <div>
                        <div className={`font-medium text-sm ${isCurrent ? "text-[#af0e0e]" : ""}`}>{sourceTitle}</div>
                        <div className="text-xs text-muted-foreground">{isCompleted ? "Completed" : "Pending"}</div>
                      </div>
                    </div>
                    {isCurrent && <Badge variant="outline">Current</Badge>}
                  </div>
                </div>
              )
            })}

            {/* Progress Summary */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress:</span>
                <span className="font-medium">
                  {selectedIncomeSources.filter((sourceId) => isIncomeSourceCompleted(sourceId)).length} of{" "}
                  {selectedIncomeSources.length} completed
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#af0e0e] h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (selectedIncomeSources.filter((sourceId) => isIncomeSourceCompleted(sourceId)).length /
                        selectedIncomeSources.length) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Content - Current Income Source Form */}
      <div className="flex-1">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{currentSourceTitle}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Step {currentIncomeIndex + 1} of {selectedIncomeSources.length}
                </p>
              </div>
              <Badge variant="outline">{isIncomeSourceCompleted(currentSourceId) ? "Completed" : "In Progress"}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {renderIncomeSection(currentSourceId, currentSourceTitle)}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousIncome}
                disabled={currentIncomeIndex === 0}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Income
              </Button>
              <Button
                onClick={handleNextIncome}
                disabled={currentIncomeIndex === selectedIncomeSources.length - 1}
                className="flex items-center"
              >
                Next Income
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
