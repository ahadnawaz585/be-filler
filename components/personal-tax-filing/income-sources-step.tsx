"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { TaxFilingService } from "@/services/taxFiling.service"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

interface IncomeSourcesStepProps {
  formData: any
  handleInputChange: (field: string, value: any) => void
}

// Define the correct income structure type
interface IncomeItem {
  type: string
  details: object
}

export function IncomeSourcesStep({ formData, handleInputChange }: IncomeSourcesStepProps) {
  const params = useParams()
  const filingId = params.id as string
  const [loading, setIsLoading] = useState(true)
  const [stepDataFromAPI, setStepDataFromAPI] = useState<any>({ incomes: [] })

  const incomeSources = [
    { id: "salary", label: "Salary Income", description: "Income from employment" },
    { id: "business", label: "Business/Self Employed", description: "Income from business activities" },
    { id: "freelancer", label: "Freelancer", description: "Income from freelance work" },
    { id: "professional", label: "Professional Services", description: "Income from professional practice" },
    { id: "pension", label: "Pension", description: "Retirement pension income" },
    { id: "agriculture", label: "Agriculture", description: "Income from agricultural activities" },
    { id: "commission", label: "Commission/Service", description: "Commission or service-based income" },
    { id: "partnership", label: "Partnership/AOP", description: "Income from partnership or association of persons" },
    { id: "rent", label: "Rent", description: "Income from rental properties" },
    { id: "propertySale", label: "Property Sale", description: "Income from property transactions" },
    { id: "savings", label: "Profit on Savings", description: "Interest or profit from savings/investments" },
    { id: "dividendGain", label: "Dividend/Capital Gain", description: "Dividends and capital gains" },
    { id: "other", label: "Other Income", description: "Any other source of income" },
  ]

  // Robust function to handle all malformed API data
  const normalizeIncomeItem = (income: any): IncomeItem => {
    let type = ''
    let details = {}

    // Handle string input
    if (typeof income === 'string') {
      return { type: income, details: {} }
    }

    // Handle object input
    if (typeof income === 'object' && income !== null) {
      // Case 1: { type: { type: 'salary', details: {} }, details: '' }
      if (income.type && typeof income.type === 'object' && income.type.type) {
        type = income.type.type
        // Use nested details if it's a proper object, otherwise use empty object
        if (income.type.details && typeof income.type.details === 'object' && !Array.isArray(income.type.details)) {
          details = income.type.details
        }
      }
      // Case 2: { type: 'salary', details: {} } - normal structure
      else if (typeof income.type === 'string') {
        type = income.type
        // Use details if it's a proper object, otherwise use empty object
        if (income.details && typeof income.details === 'object' && !Array.isArray(income.details)) {
          details = income.details
        }
      }
      // Case 3: { type: 'salary', _id: ObjectId(...) } - missing details
      else if (typeof income.type === 'string' && !income.details) {
        type = income.type
        details = {}
      }
      // Case 4: Direct type field without nested structure
      else if (income.type) {
        // Try to extract string from whatever format type is in
        if (typeof income.type === 'string') {
          type = income.type
        }
      }

      // Fallback: check if the object itself represents a type
      if (!type) {
        // Look for any string property that might be the type
        const stringKeys = Object.keys(income).filter(key => typeof income[key] === 'string')
        if (stringKeys.length > 0) {
          // Use the first string value as type if it looks like a valid income type
          const possibleTypes = ['salary', 'business', 'freelancer', 'professional', 'pension', 'agriculture', 'commission', 'partnership', 'rent', 'propertySale', 'savings', 'dividendGain', 'other']
          for (const key of stringKeys) {
            if (possibleTypes.includes(income[key])) {
              type = income[key]
              break
            }
          }
        }
      }
    }

    // Always return the correct structure, even if type is empty
    return { type: type || '', details: details || {} }
  }

  // Function to normalize the entire incomes array
  const normalizeIncomesArray = (incomes: any[]): IncomeItem[] => {
    if (!Array.isArray(incomes)) {
      return []
    }

    return incomes
      .map(normalizeIncomeItem)
      .filter(income => income.type !== '') // Remove empty types
  }

  const stepData = async () => {
    try {
      const ts = new TaxFilingService()
      const res = await ts.getStep(filingId, '2')
      console.log("Step 2 API response:", JSON.stringify(res, null, 2))

      // Normalize incomes from API - handle all malformed cases
      let rawIncomes = res.incomes || []
      console.log("Raw incomes from API:", JSON.stringify(rawIncomes, null, 2))

      // Validate final structure


      setStepDataFromAPI({ incomes: rawIncomes })


      if (!formData.incomes || formData.incomes.length === 0) {
        handleInputChange("incomes", rawIncomes)
      }

      // Handle other fields
      Object.keys(res).forEach(key => {
        if (key !== 'incomes' && res[key] && !formData[key]) {
          handleInputChange(key, res[key])
        }
      })

    } catch (error) {
      console.error("Error fetching step data:", error)
      handleInputChange("incomes", [])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (filingId) {
      stepData()
    }
  }, [filingId])

  // Normalize incomes whenever formData changes
  useEffect(() => {
    const currentIncomes = formData.incomes || []
    const normalizedIncomes = normalizeIncomesArray(currentIncomes)

    // Check if normalization changed anything
    const needsUpdate = JSON.stringify(currentIncomes) !== JSON.stringify(normalizedIncomes)

    if (needsUpdate) {
      console.log('Normalizing incomes structure...')
      console.log('Before:', JSON.stringify(currentIncomes, null, 2))
      console.log('After:', JSON.stringify(normalizedIncomes, null, 2))
      handleInputChange("incomes", normalizedIncomes)
    }
  }, [formData.incomes])

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Loading Income Sources...</h2>
        <p className="text-sm text-muted-foreground">Please wait while we fetch your income sources.</p>
      </div>
    )
  }

  const currentIncomeSources = formData.incomeSources || []
  const currentIncomes = normalizeIncomesArray(formData.incomes || [])

  const isSourceSelected = (sourceId: string) => {
    return currentIncomeSources.includes(sourceId)
  }

  const getSelectedSources = () => {
    return currentIncomeSources
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Income Sources</h2>
      <p className="text-sm text-muted-foreground">Select all applicable income sources for the tax year</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {incomeSources.map((source) => (
          <div key={source.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-3">
              <Checkbox
                id={source.id}
                checked={isSourceSelected(source.id)}
                onCheckedChange={(checked) => {
                  console.log(`${source.id} checked: `, checked)
                  console.log('Current incomes before update:', JSON.stringify(currentIncomes, null, 2))
                  console.log('Current income sources before update:', JSON.stringify(currentIncomeSources, null, 2))

                  if (checked) {
                    // Update incomeSources array
                    const newIncomeSources = [...currentIncomeSources, source.id]
                    handleInputChange("incomeSources", newIncomeSources)

                    // Add to incomes array if not already present
                    if (!currentIncomes.some((income: IncomeItem) => income.type === source.id)) {
                      const newIncome: IncomeItem = { type: source.id, details: {} }
                      const newIncomes = [...currentIncomes, newIncome]
                      const cleaned = newIncomes
                      console.log(cleaned)
                      handleInputChange("incomes", cleaned)
                    }
                  } else {
                    // Remove from incomeSources array
                    const newIncomeSources = currentIncomeSources.filter((id: string) => id !== source.id)
                    handleInputChange("incomeSources", newIncomeSources)

                    // Remove from incomes array
                    const updatedIncomes = currentIncomes.filter((income: IncomeItem) => income.type !== source.id)
                    console.log('Updated incomes after removal:', JSON.stringify(updatedIncomes, null, 2))
                    handleInputChange("incomes", updatedIncomes)

                    // Clear related fields
                    handleInputChange(`${source.id}Income`, "")
                    if (source.id === "salary") {
                      handleInputChange("taxDeductedBySalaryEmployer", "")
                    }
                  }
                }}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor={source.id} className="font-medium cursor-pointer">
                  {source.label}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{source.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {currentIncomeSources.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Selected sources:</strong> {currentIncomeSources.length} income source(s) selected. You'll provide
            detailed information for each source in the next step.
          </p>
          <div className="mt-2 text-xs text-blue-600">
            Selected: {getSelectedSources().join(", ")}
          </div>
        </div>
      )}
    </div>
  )
}