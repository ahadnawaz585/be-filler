import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface DocumentUploadStepProps {
  formData: any
  handleInputChange: (field: string, value: any) => void
}

export function DocumentUploadStep({ formData, handleInputChange }: DocumentUploadStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Document Upload</h2>
      <p className="text-sm text-muted-foreground">Confirm document upload</p>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="documentsUploaded"
          checked={formData.documentsUploaded}
          onCheckedChange={(checked) => handleInputChange("documentsUploaded", checked)}
        />
        <Label htmlFor="documentsUploaded">I have uploaded all required documents</Label>
      </div>
    </div>
  )
}
