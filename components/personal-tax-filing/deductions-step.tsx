import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface DeductionsStepProps {
  formData: any
  handleInputChange: (field: string, value: any) => void
}

export function DeductionsStep({ formData, handleInputChange }: DeductionsStepProps) {
  const deductions = [
    { id: "medical", label: "Medical Expenses" },
    { id: "education", label: "Education Expenses" },
    { id: "charity", label: "Charitable Donations" },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Deductions</h2>
      <p className="text-sm text-muted-foreground">Select applicable deductions</p>
      <div className="space-y-2">
        {deductions.map((deduction) => (
          <div key={deduction.id} className="flex items-center space-x-2">
            <Checkbox
              id={deduction.id}
              checked={formData.deductions.includes(deduction.id)}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleInputChange("deductions", [...formData.deductions, deduction.id])
                } else {
                  handleInputChange(
                    "deductions",
                    formData.deductions.filter((id: string) => id !== deduction.id),
                  )
                }
              }}
            />
            <Label htmlFor={deduction.id}>{deduction.label}</Label>
          </div>
        ))}
      </div>
    </div>
  )
}
