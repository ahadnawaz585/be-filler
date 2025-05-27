import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface AssetsStepProps {
  formData: any
  handleInputChange: (field: string, value: any) => void
}

export function AssetsStep({ formData, handleInputChange }: AssetsStepProps) {
  const assets = [
    { id: "property", label: "Real Estate" },
    { id: "vehicles", label: "Vehicles" },
    { id: "investments", label: "Investments" },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Assets</h2>
      <p className="text-sm text-muted-foreground">Select applicable assets</p>
      <div className="space-y-2">
        {assets.map((asset) => (
          <div key={asset.id} className="flex items-center space-x-2">
            <Checkbox
              id={asset.id}
              checked={formData.assets.includes(asset.id)}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleInputChange("assets", [...formData.assets, asset.id])
                } else {
                  handleInputChange(
                    "assets",
                    formData.assets.filter((id: string) => id !== asset.id),
                  )
                }
              }}
            />
            <Label htmlFor={asset.id}>{asset.label}</Label>
          </div>
        ))}
      </div>
    </div>
  )
}
