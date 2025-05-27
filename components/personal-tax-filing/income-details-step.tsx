"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface IncomeDetailsStepProps {
  formData: any
  handleInputChange: (field: string, value: any) => void
}

export function IncomeDetailsStep({ formData, handleInputChange }: IncomeDetailsStepProps) {
  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "")
    return numericValue ? Number.parseInt(numericValue).toLocaleString() : ""
  }

  const handleCurrencyInput = (field: string, value: string) => {
    const numericValue = value.replace(/[^\d]/g, "")
    handleInputChange(field, numericValue)
  }

  const renderIncomeSection = (sourceId: string, title: string) => {
    if (!formData.incomeSources.includes(sourceId)) return null

    switch (sourceId) {
      case "salary":
        return (
          <Card key={sourceId} className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        )

      case "business":
        return (
          <Card key={sourceId} className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        )

      case "freelancer":
        return (
          <Card key={sourceId} className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        )

      case "professional":
        return (
          <Card key={sourceId} className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        )

      case "pension":
        return (
          <Card key={sourceId} className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pensionIncome">Annual Pension Income (PKR)</Label>
                  <Input
                    id="pensionIncome"
                    value={formatCurrency(formData.pensionIncome || "")}
                    onChange={(e) => handleCurrencyInput("pensionIncome", e.target.value)}
                    placeholder="Enter pension income"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pensionTaxDeducted">Tax Deducted (PKR)</Label>
                  <Input
                    id="pensionTaxDeducted"
                    value={formatCurrency(formData.pensionTaxDeducted || "")}
                    onChange={(e) => handleCurrencyInput("pensionTaxDeducted", e.target.value)}
                    placeholder="Enter tax deducted"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pensionSource">Pension Source</Label>
                <Input
                  id="pensionSource"
                  value={formData.pensionSource || ""}
                  onChange={(e) => handleInputChange("pensionSource", e.target.value)}
                  placeholder="Enter pension source (e.g., Government, Private Company)"
                />
              </div>
            </CardContent>
          </Card>
        )

      case "agriculture":
        return (
          <Card key={sourceId} className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agricultureIncome">Annual Agriculture Income (PKR)</Label>
                  <Input
                    id="agricultureIncome"
                    value={formatCurrency(formData.agricultureIncome || "")}
                    onChange={(e) => handleCurrencyInput("agricultureIncome", e.target.value)}
                    placeholder="Enter agriculture income"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agricultureExpenses">Agriculture Expenses (PKR)</Label>
                  <Input
                    id="agricultureExpenses"
                    value={formatCurrency(formData.agricultureExpenses || "")}
                    onChange={(e) => handleCurrencyInput("agricultureExpenses", e.target.value)}
                    placeholder="Enter expenses"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cropType">Type of Crops/Agriculture</Label>
                <Textarea
                  id="cropType"
                  value={formData.cropType || ""}
                  onChange={(e) => handleInputChange("cropType", e.target.value)}
                  placeholder="Describe your agricultural activities"
                />
              </div>
            </CardContent>
          </Card>
        )

      case "commission":
        return (
          <Card key={sourceId} className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commissionIncome">Annual Commission Income (PKR)</Label>
                  <Input
                    id="commissionIncome"
                    value={formatCurrency(formData.commissionIncome || "")}
                    onChange={(e) => handleCurrencyInput("commissionIncome", e.target.value)}
                    placeholder="Enter commission income"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commissionExpenses">Related Expenses (PKR)</Label>
                  <Input
                    id="commissionExpenses"
                    value={formatCurrency(formData.commissionExpenses || "")}
                    onChange={(e) => handleCurrencyInput("commissionExpenses", e.target.value)}
                    placeholder="Enter expenses"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="commissionType">Type of Commission/Service</Label>
                <Select
                  onValueChange={(value) => handleInputChange("commissionType", value)}
                  value={formData.commissionType || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select commission type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales Commission</SelectItem>
                    <SelectItem value="insurance">Insurance Agent</SelectItem>
                    <SelectItem value="real-estate">Real Estate Agent</SelectItem>
                    <SelectItem value="brokerage">Brokerage</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )

      case "partnership":
        return (
          <Card key={sourceId} className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        )

      case "property":
        return (
          <Card key={sourceId} className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyIncome">Annual Rental Income (PKR)</Label>
                  <Input
                    id="propertyIncome"
                    value={formatCurrency(formData.propertyIncome || "")}
                    onChange={(e) => handleCurrencyInput("propertyIncome", e.target.value)}
                    placeholder="Enter rental income"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertySaleIncome">Property Sale Income (PKR)</Label>
                  <Input
                    id="propertySaleIncome"
                    value={formatCurrency(formData.propertySaleIncome || "")}
                    onChange={(e) => handleCurrencyInput("propertySaleIncome", e.target.value)}
                    placeholder="Enter sale income"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyExpenses">Property Expenses (PKR)</Label>
                  <Input
                    id="propertyExpenses"
                    value={formatCurrency(formData.propertyExpenses || "")}
                    onChange={(e) => handleCurrencyInput("propertyExpenses", e.target.value)}
                    placeholder="Enter property expenses"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyTaxDeducted">Tax Deducted (PKR)</Label>
                  <Input
                    id="propertyTaxDeducted"
                    value={formatCurrency(formData.propertyTaxDeducted || "")}
                    onChange={(e) => handleCurrencyInput("propertyTaxDeducted", e.target.value)}
                    placeholder="Enter tax deducted"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "savings":
        return (
          <Card key={sourceId} className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        )

      case "dividend":
        return (
          <Card key={sourceId} className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        )

      case "other":
        return (
          <Card key={sourceId} className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        )

      default:
        return null
    }
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

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Income Details</h2>
      <p className="text-sm text-muted-foreground">Provide detailed information for each selected income source</p>

      {formData.incomeSources.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No income sources selected. Please go back to Step 3 to select your income sources.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {formData.incomeSources.map((sourceId: string) =>
            renderIncomeSection(sourceId, incomeSourcesMap[sourceId as keyof typeof incomeSourcesMap]),
          )}
        </div>
      )}
    </div>
  )
}
