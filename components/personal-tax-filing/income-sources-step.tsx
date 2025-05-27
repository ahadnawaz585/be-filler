import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface IncomeSourcesStepProps {
  formData: any
  handleInputChange: (field: string, value: any) => void
}

export function IncomeSourcesStep({ formData, handleInputChange }: IncomeSourcesStepProps) {
  const incomeSources = [
    { id: "salary", label: "Salary Income", description: "Income from employment" },
    { id: "business", label: "Business/Self Employed", description: "Income from business activities" },
    { id: "freelancer", label: "Freelancer", description: "Income from freelance work" },
    { id: "professional", label: "Professional Services", description: "Income from professional practice" },
    { id: "pension", label: "Pension", description: "Retirement pension income" },
    { id: "agriculture", label: "Agriculture", description: "Income from agricultural activities" },
    { id: "commission", label: "Commission/Service", description: "Commission or service-based income" },
    { id: "partnership", label: "Partnership/AOP", description: "Income from partnership or association of persons" },
    { id: "property", label: "Rent/Property Sale", description: "Income from rental or property transactions" },
    { id: "savings", label: "Profit on Savings", description: "Interest or profit from savings/investments" },
    { id: "dividend", label: "Dividend/Capital Gain", description: "Dividends and capital gains" },
    { id: "other", label: "Other Income", description: "Any other source of income" },
  ]

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
                checked={formData.incomeSources.includes(source.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleInputChange("incomeSources", [...formData.incomeSources, source.id])
                  } else {
                    handleInputChange(
                      "incomeSources",
                      formData.incomeSources.filter((id: string) => id !== source.id),
                    )
                    // Clear related income data when unchecking
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

      {formData.incomeSources.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Selected sources:</strong> {formData.incomeSources.length} income source(s) selected. You'll provide
            detailed information for each source in the next step.
          </p>
        </div>
      )}
    </div>
  )
}
