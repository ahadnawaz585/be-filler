"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Plus, X, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { TaxFilingService } from "@/services/taxFiling.service"

interface IncomeDetailsStepProps {
  formData: any
  handleInputChange: (field: string, value: any) => void
}

export function IncomeDetailsStep({ formData, handleInputChange }: IncomeDetailsStepProps) {
  const [currentIncomeIndex, setCurrentIncomeIndex] = useState(0)
  const params = useParams()
  const filingId = params.id as string
  const [loading, setIsLoading] = useState(true)
  const [stepDataFromAPI, setStepDataFromAPI] = useState<any>([])

  const formatCurrency = (value: string | number) => {
    if (!value) return ""
    const stringValue = typeof value === 'number' ? value.toString() : value
    const numericValue = stringValue.replace(/[^\d]/g, "")
    return numericValue ? Number.parseInt(numericValue).toLocaleString() : ""
  }

  const handleCurrencyInput = (field: string, value: string) => {
    const numericValue = value.replace(/[^\d]/g, "")
    return numericValue
  }

  const stepData = async () => {
    try {
      const ts = new TaxFilingService();
      const res = await ts.getStep(filingId, '2');
      console.log('Raw API response:', JSON.stringify(res, null, 2));

      const processedIncomes = (res.incomes || []).map((income: any) => {
        if (income.type === 'business') {
          return {
            ...income,
            businessEntries: income.businessEntries || []
          }
        }
        if (income.type === 'other') {
          return {
            ...income,
            otherIncomeInflows: income.otherIncomeInflows || []
          }
        }
        return income
      })

      console.log('Processed incomes:', processedIncomes)
      setStepDataFromAPI(processedIncomes)

      if (processedIncomes && processedIncomes.length > 0) {
        const incomeSourceTypes = processedIncomes.map((income: any) => income.type);
        console.log("Extracted income source types:", incomeSourceTypes);

        handleInputChange("incomeSources", incomeSourceTypes);
        handleInputChange("incomes", processedIncomes);
      }

      Object.keys(res).forEach(key => {
        if (key !== 'incomes' && res[key]) {
          handleInputChange(key, res[key]);
        }
      });

    } catch (error) {
      console.error("Error fetching step data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    console.log('formData:', JSON.stringify(formData, null, 2));
    console.log('stepDataFromAPI:', JSON.stringify(stepDataFromAPI, null, 2));
    if (filingId) {
      stepData();
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Loading Income Sources...</h2>
        <p className="text-sm text-muted-foreground">Please wait while we fetch your income sources.</p>
      </div>
    );
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

  const getIncomeDetails = (type: string) => {
    console.log('=== DEBUG getIncomeDetails ===')
    console.log('Type:', type)

    let details = {};
    let businessEntries = [];
    let otherIncomeInflows = [];

    const apiIncome = stepDataFromAPI.find((inc: any) => inc.type === type)
    console.log('API Income found:', !!apiIncome)
    console.log('Raw apiIncome:', JSON.stringify(apiIncome, null, 2))

    if (apiIncome) {
      details = { ...apiIncome.details } || {};
      businessEntries = apiIncome.businessEntries || [];
      otherIncomeInflows = apiIncome.otherIncomeInflows || [];
      console.log('Using API details:', details, 'businessEntries:', businessEntries, 'otherIncomeInflows:', otherIncomeInflows)
    } else {
      const formIncome = (formData.incomes || []).find((inc: any) => inc.type === type)
      details = formIncome ? { ...formIncome.details } : {};
      businessEntries = formIncome ? formIncome.businessEntries || [] : [];
      otherIncomeInflows = formIncome ? formIncome.otherIncomeInflows || [] : [];
      console.log('Using form details:', details, 'businessEntries:', businessEntries, 'otherIncomeInflows:', otherIncomeInflows)
    }

    if (type === 'business') {
      console.log('Business details before processing:', details)
      details = {
        newBusinessIncome: details.newBusinessIncome || '',
        newBusinessExpenses: details.newBusinessExpenses || '',
        newBusinessType: details.newBusinessType || '',
        newBusinessName: details.newBusinessName || '',
        ...details
      }
      console.log('Business details after processing:', details)
    } else if (type === 'other') {
      console.log('Other income details before processing:', details)
      details = {
        newInflowType: details.newInflowType || '',
        newInflowAmount: details.newInflowAmount || '',
        newInflowDescription: details.newInflowDescription || '',
        ...details
      }
      console.log('Other income details after processing:', details)
    }

    console.log('Final details returned:', { details, businessEntries, otherIncomeInflows })
    console.log('=== END DEBUG ===')

    return { details, businessEntries, otherIncomeInflows }
  }

  const updateIncomeDetails = (type: string, field: string | Record<string, any>, value?: any) => {
    console.log('=== updateIncomeDetails ENHANCED DEBUG ===')
    console.log('Type:', type, 'Field:', field, 'Value:', value)

    const incomes = formData.incomes || []
    console.log('Current formData.incomes BEFORE update:', JSON.stringify(incomes, null, 2))

    const incomeIndex = incomes.findIndex((inc: any) => inc.type === type)
    let updatedIncomes = [...incomes]

    if (typeof field === 'object') {
      // Handle batch updates (e.g., for adding business entry or inflows and resetting form)
      const newDetails = { ...field.details || {} }
      const newBusinessEntries = field.businessEntries || (incomeIndex !== -1 ? incomes[incomeIndex].businessEntries : [])
      const newOtherIncomeInflows = field.otherIncomeInflows || (incomeIndex !== -1 ? incomes[incomeIndex].otherIncomeInflows : [])
      if (incomeIndex === -1) {
        updatedIncomes.push({
          type,
          details: newDetails,
          businessEntries: newBusinessEntries,
          otherIncomeInflows: newOtherIncomeInflows
        })
      } else {
        updatedIncomes[incomeIndex] = {
          ...incomes[incomeIndex],
          details: { ...incomes[incomeIndex].details, ...newDetails },
          businessEntries: newBusinessEntries,
          otherIncomeInflows: newOtherIncomeInflows
        }
      }
    } else if (field === 'businessEntries' || field === 'otherIncomeInflows') {
      // Handle direct array updates (e.g., for deletion)
      if (incomeIndex === -1) {
        updatedIncomes.push({
          type,
          details: {},
          businessEntries: field === 'businessEntries' ? value : [],
          otherIncomeInflows: field === 'otherIncomeInflows' ? value : []
        })
      } else {
        updatedIncomes[incomeIndex] = {
          ...incomes[incomeIndex],
          businessEntries: field === 'businessEntries' ? value : incomes[incomeIndex].businessEntries || [],
          otherIncomeInflows: field === 'otherIncomeInflows' ? value : incomes[incomeIndex].otherIncomeInflows || []
        }
      }
    } else {
      // Single field update
      if (incomeIndex === -1) {
        updatedIncomes.push({
          type,
          details: { [field]: value },
          businessEntries: [],
          otherIncomeInflows: []
        })
      } else {
        updatedIncomes[incomeIndex] = {
          ...incomes[incomeIndex],
          details: { ...incomes[incomeIndex].details, [field]: value },
          businessEntries: incomes[incomeIndex].businessEntries || [],
          otherIncomeInflows: incomes[incomeIndex].otherIncomeInflows || []
        }
      }
    }

    console.log('Updated incomes:', JSON.stringify(updatedIncomes, null, 2))
    handleInputChange("incomes", updatedIncomes)

    const apiIncomes = [...(stepDataFromAPI || [])]
    const apiIncomeIndex = apiIncomes.findIndex((inc: any) => inc.type === type)

    if (typeof field === 'object') {
      const newDetails = { ...field.details || {} }
      const newBusinessEntries = field.businessEntries || (apiIncomeIndex !== -1 ? apiIncomes[apiIncomeIndex].businessEntries : [])
      const newOtherIncomeInflows = field.otherIncomeInflows || (apiIncomeIndex !== -1 ? apiIncomes[apiIncomeIndex].otherIncomeInflows : [])
      if (apiIncomeIndex === -1) {
        apiIncomes.push({
          type,
          details: newDetails,
          businessEntries: newBusinessEntries,
          otherIncomeInflows: newOtherIncomeInflows
        })
      } else {
        apiIncomes[apiIncomeIndex] = {
          ...apiIncomes[apiIncomeIndex],
          details: { ...apiIncomes[apiIncomeIndex].details, ...newDetails },
          businessEntries: newBusinessEntries,
          otherIncomeInflows: newOtherIncomeInflows
        }
      }
    } else if (field === 'businessEntries' || field === 'otherIncomeInflows') {
      if (apiIncomeIndex === -1) {
        apiIncomes.push({
          type,
          details: {},
          businessEntries: field === 'businessEntries' ? value : [],
          otherIncomeInflows: field === 'otherIncomeInflows' ? value : []
        })
      } else {
        apiIncomes[apiIncomeIndex] = {
          ...apiIncomes[apiIncomeIndex],
          businessEntries: field === 'businessEntries' ? value : apiIncomes[apiIncomeIndex].businessEntries || [],
          otherIncomeInflows: field === 'otherIncomeInflows' ? value : apiIncomes[apiIncomeIndex].otherIncomeInflows || []
        }
      }
    } else {
      if (apiIncomeIndex === -1) {
        apiIncomes.push({
          type,
          details: { [field]: value },
          businessEntries: [],
          otherIncomeInflows: []
        })
      } else {
        apiIncomes[apiIncomeIndex] = {
          ...apiIncomes[apiIncomeIndex],
          details: { ...apiIncomes[apiIncomeIndex].details, [field]: value },
          businessEntries: apiIncomes[apiIncomeIndex].businessEntries || [],
          otherIncomeInflows: apiIncomes[apiIncomeIndex].otherIncomeInflows || []
        }
      }
    }

    console.log('Updated stepDataFromAPI:', JSON.stringify(apiIncomes, null, 2))
    setStepDataFromAPI(apiIncomes)
    console.log('=== END updateIncomeDetails ENHANCED DEBUG ===')
  }

  const isIncomeSourceCompleted = (sourceId: string) => {
    const { details, businessEntries, otherIncomeInflows } = getIncomeDetails(sourceId)
    switch (sourceId) {
      case "salary":
        return !!(details?.annualSalary && details?.taxDeducted)
      case "business":
        return !!(businessEntries && businessEntries.length > 0)
      case "freelancer":
        return !!details?.freelancerIncome
      case "professional":
        return !!(details?.professionalIncome && details?.profession)
      case "pension":
        return !!details?.pensionIncome
      case "agriculture":
        return !!details?.agricultureIncome
      case "commission":
        return !!(
          details?.lifeInsuranceAmount ||
          details?.generalInsuranceAmount ||
          details?.realEstateTravelAmount ||
          details?.servicesConsultancyAmount ||
          details?.otherCommissionsAmount
        )
      case "partnership":
        return !!(details?.partnershipIncome && details?.partnershipName)
      case "property":
        return !!(
          (details.propertyRentEntries && details.propertyRentEntries.length > 0) ||
          (details.propertySaleEntries && details.propertySaleEntries.length > 0)
        )
      case "savings":
        return !!details?.savingsIncome
      case "dividend":
        return !!(details?.dividendIncome || details?.capitalGain)
      case "other":
        return !!(otherIncomeInflows && otherIncomeInflows.length > 0)
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
    const { details, businessEntries, otherIncomeInflows } = getIncomeDetails(sourceId)

    switch (sourceId) {
      case "salary":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryIncome">Annual Salary (PKR)</Label>
                <Input
                  id="salaryIncome"
                  value={formatCurrency(details.annualSalary || "")}
                  onChange={(e) => updateIncomeDetails(sourceId, "annualSalary", handleCurrencyInput("annualSalary", e.target.value))}
                  placeholder="Enter annual salary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxDeducted">Tax Deducted by Employer (PKR)</Label>
                <Input
                  id="taxDeducted"
                  value={formatCurrency(details.taxDeducted || "")}
                  onChange={(e) => updateIncomeDetails(sourceId, "taxDeducted", handleCurrencyInput("taxDeducted", e.target.value))}
                  placeholder="Enter tax deducted"
                />
              </div>
            </div>
          </div>
        )

      case "business":
        return (
          <div className="space-y-6">
            <div className="border rounded-lg p-4 bg-blue-50/50">
              <h4 className="font-medium mb-4 text-blue-900">Add New Business</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newBusinessIncome">Annual Business Income (PKR)</Label>
                  <Input
                    id="newBusinessIncome"
                    value={formatCurrency(details.newBusinessIncome || "")}
                    onChange={(e) => updateIncomeDetails(sourceId, "newBusinessIncome", handleCurrencyInput("newBusinessIncome", e.target.value))}
                    placeholder="Enter business income"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newBusinessExpenses">Business Expenses (PKR)</Label>
                  <Input
                    id="newBusinessExpenses"
                    value={formatCurrency(details.newBusinessExpenses || "")}
                    onChange={(e) => updateIncomeDetails(sourceId, "newBusinessExpenses", handleCurrencyInput("newBusinessExpenses", e.target.value))}
                    placeholder="Enter business expenses"
                  />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="newBusinessType">Type of Business</Label>
                <Select
                  onValueChange={(value) => updateIncomeDetails(sourceId, "newBusinessType", value)}
                  value={details.newBusinessType || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trader">Trader</SelectItem>
                    <SelectItem value="manufacturer">Manufacturer</SelectItem>
                    <SelectItem value="dealer">Dealer</SelectItem>
                    <SelectItem value="wholesaler">Wholesaler</SelectItem>
                    <SelectItem value="importer">Importer</SelectItem>
                    <SelectItem value="exporter">Exporter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="newBusinessName">Business Name</Label>
                <Input
                  id="newBusinessName"
                  value={details.newBusinessName || ""}
                  onChange={(e) => updateIncomeDetails(sourceId, "newBusinessName", e.target.value)}
                  placeholder="Enter business name"
                />
              </div>
              <div className="mt-4">
                <Button
                  type="button"
                  onClick={() => {
                    if (details.newBusinessIncome && details.newBusinessType && details.newBusinessName) {
                      const newBusinessEntry = {
                        id: Date.now().toString(),
                        businessIncome: details.newBusinessIncome,
                        businessExpenses: details.newBusinessExpenses || "0",
                        businessType: details.newBusinessType,
                        businessName: details.newBusinessName
                      }
                      const updatedDetails = {
                        details: {
                          newBusinessIncome: "",
                          newBusinessExpenses: "",
                          newBusinessType: "",
                          newBusinessName: ""
                        },
                        businessEntries: [...businessEntries, newBusinessEntry]
                      }
                      updateIncomeDetails(sourceId, updatedDetails)
                      console.log('Added new business entry:', newBusinessEntry)
                      console.log('Updated businessEntries:', updatedDetails.businessEntries)
                    }
                  }}
                  disabled={!details.newBusinessIncome || !details.newBusinessType || !details.newBusinessName}
                  className="w-full md:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Business
                </Button>
              </div>
            </div>
            {businessEntries && businessEntries.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium">Added Businesses</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {businessEntries.map((entry: any) => (
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
                          const updatedEntries = businessEntries.filter(
                            (item: any) => item.id !== entry.id
                          )
                          updateIncomeDetails(sourceId, "businessEntries", updatedEntries)
                          console.log('Removed business entry:', entry.id)
                          console.log('Updated businessEntries:', updatedEntries)
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <div className="space-y-2 pr-6">
                        <div className="font-medium text-sm line-clamp-1">{entry.businessName}</div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {entry.businessType}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Annual Income:</span>
                            <div className="font-medium">PKR {Number(entry.businessIncome).toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Expenses:</span>
                            <div className="font-medium">PKR {Number(entry.businessExpenses).toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Net Income:</span>
                            <div className="font-medium text-green-600">
                              PKR {(Number(entry.businessIncome) - Number(entry.businessExpenses)).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Total Business Income:</span>
                    <span className="font-semibold">
                      PKR{" "}
                      {businessEntries
                        .reduce((total: number, entry: any) => total + (Number(entry.businessIncome) - Number(entry.businessExpenses)), 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                <div className="space-y-2">
                  <div className="text-sm">No businesses added yet</div>
                  <div className="text-xs">Add your first business using the form above</div>
                </div>
              </div>
            )}
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
                  value={formatCurrency(details.freelancerIncome || "")}
                  onChange={(e) => updateIncomeDetails(sourceId, "freelancerIncome", handleCurrencyInput("freelancerIncome", e.target.value))}
                  placeholder="Enter freelance income"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="freelancerExpenses">Business Expenses (PKR)</Label>
                <Input
                  id="freelancerExpenses"
                  value={formatCurrency(details.freelancerExpenses || "")}
                  onChange={(e) => updateIncomeDetails(sourceId, "freelancerExpenses", handleCurrencyInput("freelancerExpenses", e.target.value))}
                  placeholder="Enter expenses"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="freelanceServices">Type of Services</Label>
              <Textarea
                id="freelanceServices"
                value={details.freelanceServices || ""}
                onChange={(e) => updateIncomeDetails(sourceId, "freelanceServices", e.target.value)}
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
                  value={formatCurrency(details.professionalIncome || "")}
                  onChange={(e) => updateIncomeDetails(sourceId, "professionalIncome", handleCurrencyInput("professionalIncome", e.target.value))}
                  placeholder="Enter professional income"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="professionalExpenses">Professional Expenses (PKR)</Label>
                <Input
                  id="professionalExpenses"
                  value={formatCurrency(details.professionalExpenses || "")}
                  onChange={(e) => updateIncomeDetails(sourceId, "professionalExpenses", handleCurrencyInput("professionalExpenses", e.target.value))}
                  placeholder="Enter expenses"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profession">Profession</Label>
              <Select
                onValueChange={(value) => updateIncomeDetails(sourceId, "profession", value)}
                value={details.profession || ""}
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
                value={formatCurrency(details.pensionIncome || "")}
                onChange={(e) => updateIncomeDetails(sourceId, "pensionIncome", handleCurrencyInput("pensionIncome", e.target.value))}
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
                value={formatCurrency(details.agricultureIncome || "")}
                onChange={(e) => updateIncomeDetails(sourceId, "agricultureIncome", handleCurrencyInput("agricultureIncome", e.target.value))}
                placeholder="Enter annual agriculture income"
              />
            </div>
          </div>
        )

      case "commission":
        return (
          <div className="space-y-6">
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
                    value={formatCurrency(details.lifeInsuranceAmount || "")}
                    onChange={(e) => updateIncomeDetails(sourceId, "lifeInsuranceAmount", handleCurrencyInput("lifeInsuranceAmount", e.target.value))}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lifeInsuranceTaxDeducted">Tax Deducted (PKR)</Label>
                  <Input
                    id="lifeInsuranceTaxDeducted"
                    value={formatCurrency(details.lifeInsuranceTaxDeducted || "")}
                    onChange={(e) => updateIncomeDetails(sourceId, "lifeInsuranceTaxDeducted", handleCurrencyInput("lifeInsuranceTaxDeducted", e.target.value))}
                    placeholder="Enter tax deducted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lifeInsuranceExpense">Expense (PKR)</Label>
                  <Input
                    id="lifeInsuranceExpense"
                    value={formatCurrency(details.lifeInsuranceExpense || "")}
                    onChange={(e) => updateIncomeDetails(sourceId, "lifeInsuranceExpense", handleCurrencyInput("lifeInsuranceExpense", e.target.value))}
                    placeholder="Enter expense"
                  />
                </div>
              </div>
            </div>
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
                    value={formatCurrency(details.generalInsuranceAmount || "")}
                    onChange={(e) => updateIncomeDetails(sourceId, "generalInsuranceAmount", handleCurrencyInput("generalInsuranceAmount", e.target.value))}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="generalInsuranceTaxDeducted">Tax Deducted (PKR)</Label>
                  <Input
                    id="generalInsuranceTaxDeducted"
                    value={formatCurrency(details.generalInsuranceTaxDeducted || "")}
                    onChange={(e) => updateIncomeDetails(sourceId, "generalInsuranceTaxDeducted", handleCurrencyInput("generalInsuranceTaxDeducted", e.target.value))}
                    placeholder="Enter tax deducted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="generalInsuranceExpense">Expense (PKR)</Label>
                  <Input
                    id="generalInsuranceExpense"
                    value={formatCurrency(details.generalInsuranceExpense || "")}
                    onChange={(e) => updateIncomeDetails(sourceId, "generalInsuranceExpense", handleCurrencyInput("generalInsuranceExpense", e.target.value))}
                    placeholder="Enter expense"
                  />
                </div>
              </div>
            </div>
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
                    value={formatCurrency(details.realEstateTravelAmount || "")}
                    onChange={(e) => updateIncomeDetails(sourceId, "realEstateTravelAmount", handleCurrencyInput("realEstateTravelAmount", e.target.value))}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="realEstateTravelTaxDeducted">Tax Deducted (PKR)</Label>
                  <Input
                    id="realEstateTravelTaxDeducted"
                    value={formatCurrency(details.realEstateTravelTaxDeducted || "")}
                    onChange={(e) => updateIncomeDetails(sourceId, "realEstateTravelTaxDeducted", handleCurrencyInput("realEstateTravelTaxDeducted", e.target.value))}
                    placeholder="Enter tax deducted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="realEstateTravelExpense">Expense (PKR)</Label>
                  <Input
                    id="realEstateTravelExpense"
                    value={formatCurrency(details.realEstateTravelExpense || "")}
                    onChange={(e) => updateIncomeDetails(sourceId, "realEstateTravelExpense", handleCurrencyInput("realEstateTravelExpense", e.target.value))}
                    placeholder="Enter expense"
                  />
                </div>
              </div>
            </div>
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
                    value={formatCurrency(details.servicesConsultancyAmount || "")}
                    onChange={(e) => updateIncomeDetails(sourceId, "servicesConsultancyAmount", handleCurrencyInput("servicesConsultancyAmount", e.target.value))}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servicesConsultancyTaxDeducted">Tax Deducted (PKR)</Label>
                  <Input
                    id="servicesConsultancyTaxDeducted"
                    value={formatCurrency(details.servicesConsultancyTaxDeducted || "")}
                    onChange={(e) => updateIncomeDetails(sourceId, "servicesConsultancyTaxDeducted", handleCurrencyInput("servicesConsultancyTaxDeducted", e.target.value))}
                    placeholder="Enter tax deducted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servicesConsultancyExpense">Expense (PKR)</Label>
                  <Input
                    id="servicesConsultancyExpense"
                    value={formatCurrency(details.servicesConsultancyExpense || "")}
                    onChange={(e) => updateIncomeDetails(sourceId, "servicesConsultancyExpense", handleCurrencyInput("servicesConsultancyExpense", e.target.value))}
                    placeholder="Enter expense"
                  />
                </div>
              </div>
            </div>
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
                    value={formatCurrency(details.otherCommissionsAmount || "")}
                    onChange={(e) => updateIncomeDetails(sourceId, "otherCommissionsAmount", handleCurrencyInput("otherCommissionsAmount", e.target.value))}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otherCommissionsTaxDeducted">Tax Deducted (PKR)</Label>
                  <Input
                    id="otherCommissionsTaxDeducted"
                    value={formatCurrency(details.otherCommissionsTaxDeducted || "")}
                    onChange={(e) => updateIncomeDetails(sourceId, "otherCommissionsTaxDeducted", handleCurrencyInput("otherCommissionsTaxDeducted", e.target.value))}
                    placeholder="Enter tax deducted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otherCommissionsExpense">Expense (PKR)</Label>
                  <Input
                    id="otherCommissionsExpense"
                    value={formatCurrency(details.otherCommissionsExpense || "")}
                    onChange={(e) => updateIncomeDetails(sourceId, "otherCommissionsExpense", handleCurrencyInput("otherCommissionsExpense", e.target.value))}
                    placeholder="Enter expense"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-3">Commission Income Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                {[
                  {
                    label: "Life Insurance",
                    amount: details.lifeInsuranceAmount,
                    expense: details.lifeInsuranceExpense,
                    tax: details.lifeInsuranceTaxDeducted,
                  },
                  {
                    label: "General Insurance",
                    amount: details.generalInsuranceAmount,
                    expense: details.generalInsuranceExpense,
                    tax: details.generalInsuranceTaxDeducted,
                  },
                  {
                    label: "Real Estate/Travel",
                    amount: details.realEstateTravelAmount,
                    expense: details.realEstateTravelExpense,
                    tax: details.realEstateTravelTaxDeducted,
                  },
                  {
                    label: "Services/Consultancy",
                    amount: details.servicesConsultancyAmount,
                    expense: details.servicesConsultancyExpense,
                    tax: details.servicesConsultancyTaxDeducted,
                  },
                  {
                    label: "Other Commissions",
                    amount: details.otherCommissionsAmount,
                    expense: details.otherCommissionsExpense,
                    tax: details.otherCommissionsTaxDeducted,
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
                      Number(details.lifeInsuranceAmount || 0) - Number(details.lifeInsuranceExpense || 0),
                      Number(details.generalInsuranceAmount || 0) - Number(details.generalInsuranceExpense || 0),
                      Number(details.realEstateTravelAmount || 0) - Number(details.realEstateTravelExpense || 0),
                      Number(details.servicesConsultancyAmount || 0) - Number(details.servicesConsultancyExpense || 0),
                      Number(details.otherCommissionsAmount || 0) - Number(details.otherCommissionsExpense || 0),
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
                <Label htmlFor="partnershipIncome">Ann. Partnership Income(PKR)</Label>
                <Input
                  id="partnershipIncome"
                  value={formatCurrency(details.partnershipIncome || "")}
                  onChange={(e) => updateIncomeDetails(sourceId, "partnershipIncome", handleCurrencyInput("partnershipIncome", e.target.value))}
                  placeholder="Enter partnership income"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partnershipShare">Your Share (%)</Label>
                <Input
                  id="partnershipShare"
                  type="number"
                  max="100"
                  value={details.partnershipShare || ""}
                  onChange={(e) => updateIncomeDetails(sourceId, "partnershipShare", e.target.value)}
                  placeholder="Enter your share percentage"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="partnershipName">Partnership/AOP Name</Label>
              <Input
                id="partnershipName"
                value={details.partnershipName || ""}
                onChange={(e) => updateIncomeDetails(sourceId, "partnershipName", e.target.value)}
                placeholder="Enter partnership name"
              />
            </div>
          </div>
        )

      case "property":
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">Select Property Income Types</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="propertyRent"
                    checked={details.propertyTypes?.includes("rent") || false}
                    onChange={(e) => {
                      const currentTypes = details.propertyTypes || []
                      if (e.target.checked) {
                        updateIncomeDetails(sourceId, "propertyTypes", [...currentTypes, "rent"])
                      } else {
                        updateIncomeDetails(sourceId, "propertyTypes", currentTypes.filter((type: string) => type !== "rent"))
                        updateIncomeDetails(sourceId, "propertyRentEntries", [])
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
                    checked={details.propertyTypes?.includes("sale") || false}
                    onChange={(e) => {
                      const currentTypes = details.propertyTypes || []
                      if (e.target.checked) {
                        updateIncomeDetails(sourceId, "propertyTypes", [...currentTypes, "sale"])
                      } else {
                        updateIncomeDetails(sourceId, "propertyTypes", currentTypes.filter((type: string) => type !== "sale"))
                        updateIncomeDetails(sourceId, "propertySaleEntries", [])
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
            {details.propertyTypes?.includes("rent") && (
              <div className="border rounded-lg p-4 bg-blue-50/50">
                <h4 className="font-medium mb-4 text-blue-900">Property Rent Income</h4>
                <div className="border rounded-lg p-4 bg-white mb-4">
                  <h5 className="font-medium mb-3">Add New Rental Property</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newRentPropertyAddress">Property Address</Label>
                      <Input
                        id="newRentPropertyAddress"
                        value={details.newRentPropertyAddress || ""}
                        onChange={(e) => updateIncomeDetails(sourceId, "newRentPropertyAddress", e.target.value)}
                        placeholder="Enter property address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newRentAnnualRent">Annual Rent Received (PKR)</Label>
                      <Input
                        id="newRentAnnualRent"
                        value={formatCurrency(details.newRentAnnualRent || "")}
                        onChange={(e) => updateIncomeDetails(sourceId, "newRentAnnualRent", handleCurrencyInput("newRentAnnualRent", e.target.value))}
                        placeholder="Enter annual rent"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newRentExpenses">Rent Expenses During Year (PKR)</Label>
                      <Input
                        id="newRentExpenses"
                        value={formatCurrency(details.newRentExpenses || "")}
                        onChange={(e) => updateIncomeDetails(sourceId, "newRentExpenses", handleCurrencyInput("newRentExpenses", e.target.value))}
                        placeholder="Enter expenses"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newRentTaxDeducted">Tax Deducted by Tenant (PKR)</Label>
                      <Input
                        id="newRentTaxDeducted"
                        value={formatCurrency(details.newRentTaxDeducted || "")}
                        onChange={(e) => updateIncomeDetails(sourceId, "newRentTaxDeducted", handleCurrencyInput("newRentTaxDeducted", e.target.value))}
                        placeholder="Enter tax deducted (if any)"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        if (details.newRentPropertyAddress && details.newRentAnnualRent) {
                          const newRentEntry = {
                            id: Date.now().toString(),
                            address: details.newRentPropertyAddress,
                            annualRent: details.newRentAnnualRent,
                            expenses: details.newRentExpenses || "0",
                            taxDeducted: details.newRentTaxDeducted || "0",
                          }
                          const currentEntries = details.propertyRentEntries || []
                          updateIncomeDetails(sourceId, "propertyRentEntries", [...currentEntries, newRentEntry])
                          updateIncomeDetails(sourceId, "newRentPropertyAddress", "")
                          updateIncomeDetails(sourceId, "newRentAnnualRent", "")
                          updateIncomeDetails(sourceId, "newRentExpenses", "")
                          updateIncomeDetails(sourceId, "newRentTaxDeducted", "")
                        }
                      }}
                      disabled={!details.newRentPropertyAddress || !details.newRentAnnualRent}
                      className="w-full md:w-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Rental Property
                    </Button>
                  </div>
                </div>
                {details.propertyRentEntries && details.propertyRentEntries.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-medium">Added Rental Properties</h5>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {details.propertyRentEntries.map((entry: any) => (
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
                              const updatedEntries = details.propertyRentEntries.filter(
                                (item: any) => item.id !== entry.id,
                              )
                              updateIncomeDetails(sourceId, "propertyRentEntries", updatedEntries)
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
            {details.propertyTypes?.includes("sale") && (
              <div className="border rounded-lg p-4 bg-green-50/50">
                <h4 className="font-medium mb-4 text-green-900">Gain on Sale of Property</h4>
                <div className="border rounded-lg p-4 bg-white mb-4">
                  <h5 className="font-medium mb-3">Add New Property Sale</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="newSalePropertyAddress">Property Address</Label>
                      <Input
                        id="newSalePropertyAddress"
                        value={details.newSalePropertyAddress || ""}
                        onChange={(e) => updateIncomeDetails(sourceId, "newSalePropertyAddress", e.target.value)}
                        placeholder="Enter property address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newSalePropertyType">Property Type</Label>
                      <Select
                        onValueChange={(value) => updateIncomeDetails(sourceId, "newSalePropertyType", value)}
                        value={details.newSalePropertyType || ""}
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
                        value={formatCurrency(details.newSalePurchasePrice || "")}
                        onChange={(e) => updateIncomeDetails(sourceId, "newSalePurchasePrice", handleCurrencyInput("newSalePurchasePrice", e.target.value))}
                        placeholder="Enter purchase price"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newSaleSalePrice">Sale Price (PKR)</Label>
                      <Input
                        id="newSaleSalePrice"
                        value={formatCurrency(details.newSaleSalePrice || "")}
                        onChange={(e) => updateIncomeDetails(sourceId, "newSaleSalePrice", handleCurrencyInput("newSaleSalePrice", e.target.value))}
                        placeholder="Enter sale price"
                      />
                    </div>
                  </div>
                  {details.newSalePropertyType && (
                    <div className="space-y-3 mb-4">
                      <Label className="text-base font-medium">Holding Period (July 1, 2023 to June 30, 2024)</Label>
                      <div className="space-y-2">
                        {details.newSalePropertyType === "open-plot" && (
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
                                  checked={details.newSaleHoldingPeriod === option.value}
                                  onChange={(e) => updateIncomeDetails(sourceId, "newSaleHoldingPeriod", e.target.value)}
                                  className="rounded border-gray-300"
                                />
                                <Label htmlFor={`holding-${option.value}`} className="cursor-pointer text-sm">
                                  {option.label}
                                </Label>
                              </div>
                            ))}
                          </>
                        )}
                        {details.newSalePropertyType === "constructed-plot" && (
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
                                  checked={details.newSaleHoldingPeriod === option.value}
                                  onChange={(e) => updateIncomeDetails(sourceId, "newSaleHoldingPeriod", e.target.value)}
                                  className="rounded border-gray-300"
                                />
                                <Label htmlFor={`holding-${option.value}`} className="cursor-pointer text-sm">
                                  {option.label}
                                </Label>
                              </div>
                            ))}
                          </>
                        )}
                        {details.newSalePropertyType === "flat" && (
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
                                  checked={details.newSaleHoldingPeriod === option.value}
                                  onChange={(e) => updateIncomeDetails(sourceId, "newSaleHoldingPeriod", e.target.value)}
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
                          details.newSalePropertyAddress &&
                          details.newSalePropertyType &&
                          details.newSalePurchasePrice &&
                          details.newSaleSalePrice &&
                          details.newSaleHoldingPeriod
                        ) {
                          const newSaleEntry = {
                            id: Date.now().toString(),
                            address: details.newSalePropertyAddress,
                            propertyType: details.newSalePropertyType,
                            purchasePrice: details.newSalePurchasePrice,
                            salePrice: details.newSaleSalePrice,
                            holdingPeriod: details.newSaleHoldingPeriod,
                            gain: Number(details.newSaleSalePrice) - Number(details.newSalePurchasePrice),
                          }
                          const currentEntries = details.propertySaleEntries || []
                          updateIncomeDetails(sourceId, "propertySaleEntries", [...currentEntries, newSaleEntry])
                          updateIncomeDetails(sourceId, "newSalePropertyAddress", "")
                          updateIncomeDetails(sourceId, "newSalePropertyType", "")
                          updateIncomeDetails(sourceId, "newSalePurchasePrice", "")
                          updateIncomeDetails(sourceId, "newSaleSalePrice", "")
                          updateIncomeDetails(sourceId, "newSaleHoldingPeriod", "")
                        }
                      }}
                      disabled={
                        !details.newSalePropertyAddress ||
                        !details.newSalePropertyType ||
                        !details.newSalePurchasePrice ||
                        !details.newSaleSalePrice ||
                        !details.newSaleHoldingPeriod
                      }
                      className="w-full md:w-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Property Sale
                    </Button>
                  </div>
                </div>
                {details.propertySaleEntries && details.propertySaleEntries.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-medium">Added Property Sales</h5>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {details.propertySaleEntries.map((entry: any) => (
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
                              const updatedEntries = details.propertySaleEntries.filter(
                                (item: any) => item.id !== entry.id,
                              )
                              updateIncomeDetails(sourceId, "propertySaleEntries", updatedEntries)
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
            {(details.propertyRentEntries?.length > 0 || details.propertySaleEntries?.length > 0) && (
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-3">Property Income Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {details.propertyRentEntries?.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Total Rental Income:</span>
                      <div className="font-semibold text-blue-600">
                        PKR{" "}
                        {details.propertyRentEntries
                          .reduce(
                            (total: number, entry: any) => total + (Number(entry.annualRent) - Number(entry.expenses)),
                            0,
                          )
                          .toLocaleString()}
                      </div>
                    </div>
                  )}
                  {details.propertySaleEntries?.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Total Capital Gains:</span>
                      <div className="font-semibold text-green-600">
                        PKR{" "}
                        {details.propertySaleEntries
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
                  value={formatCurrency(details.savingsIncome || "")}
                  onChange={(e) => updateIncomeDetails(sourceId, "savingsIncome", handleCurrencyInput("savingsIncome", e.target.value))}
                  placeholder="Enter profit on savings"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="savingsTaxDeducted">Tax Deducted (PKR)</Label>
                <Input
                  id="savingsTaxDeducted"
                  value={formatCurrency(details.savingsTaxDeducted || "")}
                  onChange={(e) => updateIncomeDetails(sourceId, "savingsTaxDeducted", handleCurrencyInput("savingsTaxDeducted", e.target.value))}
                  placeholder="Enter tax deducted"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="savingsSource">Source of Savings</Label>
              <Select
                onValueChange={(value) => updateIncomeDetails(sourceId, "savingsSource", value)}
                value={details.savingsSource || ""}
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
                  value={formatCurrency(details.dividendIncome || "")}
                  onChange={(e) => updateIncomeDetails(sourceId, "dividendIncome", handleCurrencyInput("dividendIncome", e.target.value))}
                  placeholder="Enter dividend income"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capitalGain">Capital Gains (PKR)</Label>
                <Input
                  id="capitalGain"
                  value={formatCurrency(details.capitalGain || "")}
                  onChange={(e) => updateIncomeDetails(sourceId, "capitalGain", handleCurrencyInput("capitalGain", e.target.value))}
                  placeholder="Enter capital gains"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dividendTaxDeducted">Tax Deducted on Dividend (PKR)</Label>
                <Input
                  id="dividendTaxDeducted"
                  value={formatCurrency(details.dividendTaxDeducted || "")}
                  onChange={(e) => updateIncomeDetails(sourceId, "dividendTaxDeducted", handleCurrencyInput("dividendTaxDeducted", e.target.value))}
                  placeholder="Enter tax deducted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="investmentType">Type of Investment</Label>
                <Select
                  onValueChange={(value) => updateIncomeDetails(sourceId, "investmentType", value)}
                  value={details.investmentType || ""}
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
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-medium mb-3">Add New Inflow</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newInflowType">Inflow Type</Label>
                  <Select
                    onValueChange={(value) => updateIncomeDetails(sourceId, "newInflowType", value)}
                    value={details.newInflowType || ""}
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
                    value={formatCurrency(details.newInflowAmount || "")}
                    onChange={(e) => updateIncomeDetails(sourceId, "newInflowAmount", handleCurrencyInput("newInflowAmount", e.target.value))}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newInflowDescription">Description</Label>
                  <Input
                    id="newInflowDescription"
                    value={details.newInflowDescription || ""}
                    onChange={(e) => updateIncomeDetails(sourceId, "newInflowDescription", e.target.value)}
                    placeholder="Enter description"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button
                  type="button"
                  onClick={() => {
                    if (details.newInflowType && details.newInflowAmount) {
                      const newInflow = {
                        id: Date.now().toString(),
                        type: details.newInflowType,
                        amount: details.newInflowAmount,
                        description: details.newInflowDescription || "",
                      }
                      const currentInflows = details.otherIncomeInflows || []
                      updateIncomeDetails(sourceId, "otherIncomeInflows", [...currentInflows, newInflow])
                      updateIncomeDetails(sourceId, "newInflowType", "")
                      updateIncomeDetails(sourceId, "newInflowAmount", "")
                      updateIncomeDetails(sourceId, "newInflowDescription", "")
                    }
                  }}
                  disabled={!details.newInflowType || !details.newInflowAmount}
                  className="w-full md:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Inflow
                </Button>
              </div>
            </div>
            {details.otherIncomeInflows && details.otherIncomeInflows.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Added Inflows</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {details.otherIncomeInflows.map((inflow: any) => (
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
                          const updatedInflows = details.otherIncomeInflows.filter(
                            (item: any) => item.id !== inflow.id,
                          )
                          updateIncomeDetails(sourceId, "otherIncomeInflows", updatedInflows)
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
                      {details.otherIncomeInflows
                        .reduce((total: number, inflow: any) => total + Number(inflow.amount || 0), 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {(!details.otherIncomeInflows || details.otherIncomeInflows.length === 0) && (
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
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isCurrent
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
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${isCurrent
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
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress:</span>
                <span className="font-medium">
                  {selectedIncomeSources.filter((sourceId: string) => isIncomeSourceCompleted(sourceId)).length} of{" "}
                  {selectedIncomeSources.length} completed
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#af0e0e] h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(selectedIncomeSources.filter((sourceId: string) => isIncomeSourceCompleted(sourceId)).length /
                      selectedIncomeSources.length) * 100
                      }%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
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
            <div className="mt-8 flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousIncome}
                disabled={currentIncomeIndex === 0}
                className="flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous Income
              </Button>
              <Button
                variant="outline"
                onClick={handleNextIncome}
                disabled={currentIncomeIndex === selectedIncomeSources.length - 1}
                className="flex items-center"
              >
                Next Income
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}