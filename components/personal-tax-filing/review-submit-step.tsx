import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"

interface ReviewSubmitStepProps {
  formData: any
  handleInputChange: (field: string, value: any) => void
}

export function ReviewSubmitStep({ formData, handleInputChange }: ReviewSubmitStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Review & Submit</h2>
      <p className="text-sm text-muted-foreground">Review your information before submission</p>
      <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
        <p>
          <strong>Tax Year:</strong> {formData.taxYear}
        </p>
        <p>
          <strong>Full Name:</strong> {formData.fullName}
        </p>
        <p>
          <strong>Email:</strong> {formData.email}
        </p>
        <p>
          <strong>CNIC:</strong> {formData.cnic}
        </p>
        <p>
          <strong>Date of Birth:</strong> {formData.dateOfBirth ? format(formData.dateOfBirth, "PPP") : "N/A"}
        </p>
        <p>
          <strong>Nationality:</strong> {formData.nationality}
        </p>
        <p>
          <strong>Residential Status:</strong> {formData.residentialStatus}
        </p>
        {formData.nationality === "Other" && (
          <>
            <p>
              <strong>Stay more than 3 Years:</strong> {formData.stayMoreThan3Years ? "Yes" : "No"}
            </p>
            <p>
              <strong>Employment-Based Stay:</strong> {formData.employmentBasedStay ? "Yes" : "No"}
            </p>
          </>
        )}
        <p>
          <strong>Income Sources:</strong> {formData.incomeSources.join(", ") || "None"}
        </p>
        {formData.incomeSources.includes("salary") && (
          <p>
            <strong>Salary Income:</strong> PKR {formData.salaryIncome}
          </p>
        )}
        {formData.incomeSources.includes("business") && (
          <p>
            <strong>Business Income:</strong> PKR {formData.businessIncome}
          </p>
        )}
        {formData.incomeSources.includes("property") && (
          <p>
            <strong>Rental Income:</strong> PKR {formData.rentalIncome}
          </p>
        )}
        {formData.incomeSources.includes("other") && (
          <p>
            <strong>Other Income:</strong> PKR {formData.otherIncome}
          </p>
        )}
        <p>
          <strong>Deductions:</strong> {formData.deductions.join(", ") || "None"}
        </p>
        <p>
          <strong>Assets:</strong> {formData.assets.join(", ") || "None"}
        </p>
        <p>
          <strong>Bank Details:</strong> {formData.bankDetails}
        </p>
        <p>
          <strong>Tax Credits:</strong> PKR {formData.taxCredits || "0"}
        </p>
        <p>
          <strong>Documents Uploaded:</strong> {formData.documentsUploaded ? "Yes" : "No"}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="consentGiven"
          checked={formData.consentGiven}
          onCheckedChange={(checked) => handleInputChange("consentGiven", checked)}
        />
        <Label htmlFor="consentGiven">I confirm the information provided is accurate</Label>
      </div>
    </div>
  )
}
