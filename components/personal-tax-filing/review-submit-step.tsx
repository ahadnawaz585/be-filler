"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { format } from "date-fns"

interface ReviewSubmitStepProps {
  formData: any
  handleInputChange: (field: string, value: any) => void
}

export default function ReviewSubmitStep({ formData, handleInputChange }: ReviewSubmitStepProps) {
  // Calculate total tax credits from schema structure
  const totalTaxCredits =
    ((formData.taxCredits?.donations?.enabled && formData.taxCredits.donations.taxCreditAmount && !isNaN(Number(formData.taxCredits.donations.taxCreditAmount))
      ? Number(formData.taxCredits.donations.taxCreditAmount)
      : 0) +
      (formData.taxCredits?.pensionFund?.enabled && formData.taxCredits.pensionFund.taxCreditAmount && !isNaN(Number(formData.taxCredits.pensionFund.taxCreditAmount))
        ? Number(formData.taxCredits.pensionFund.taxCreditAmount)
        : 0) +
      (formData.taxCredits?.tuitionFees?.enabled && formData.taxCredits.tuitionFees.taxCreditAmount && !isNaN(Number(formData.taxCredits.tuitionFees.taxCreditAmount))
        ? Number(formData.taxCredits.tuitionFees.taxCreditAmount)
        : 0))

  // Helper to safely join array fields
  const safeJoin = (arr: any[] | undefined, separator: string) => (Array.isArray(arr) && arr.length > 0 ? arr.join(separator) : "None")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Review & Submit</CardTitle>
        <p className="text-sm text-muted-foreground">Review your information before submission</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
          <p>
            <strong>Tax Year:</strong> {formData.taxYear || "N/A"}
          </p>
          <p>
            <strong>Full Name:</strong> {formData.personalInfo?.fullName || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {formData.personalInfo?.email || "N/A"}
          </p>
          <p>
            <strong>CNIC:</strong> {formData.personalInfo?.cnic || ""}
          </p>
          <p>
            <strong>Date of Birth:</strong>{" "}
            {formData.personalInfo?.dateOfBirth ? format(new Date(formData.personalInfo.dateOfBirth), "PPP") : "N/A"}
          </p>
          <p>
            <strong>Nationality:</strong> {formData.personalInfo?.nationality || "N/A"}
          </p>
          <p>
            <strong>Residential Status:</strong> {formData.personalInfo?.residentialStatus || "N/A"}
          </p>
          {formData.personalInfo?.nationality === "Other" && (
            <>
              <p>
                <strong>Stay more than 3 Years:</strong> {formData.personalInfo?.stayMoreThan3Years ? "Yes" : "No"}
              </p>
              <p>
                <strong>Employment-Based Stay:</strong> {formData.personalInfo?.employmentBasedStay ? "Yes" : "No"}
              </p>
            </>
          )}
          <p>
            <strong>Income Sources:</strong> {safeJoin(formData.incomeSources, ", ")}
          </p>
          {formData.incomeSources?.includes("salary") && (
            <p>
              <strong>Salary Income:</strong> PKR {formData.salaryIncome || "0"}
            </p>
          )}
          {formData.incomeSources?.includes("business") && (
            <p>
              <strong>Business Income:</strong> PKR {formData.businessIncome || "0"}
            </p>
          )}
          {formData.incomeSources?.includes("property") && (
            <p>
              <strong>Rental Income:</strong> PKR {formData.rentalIncome || "0"}
            </p>
          )}
          {formData.incomeSources?.includes("other") && (
            <p>
              <strong>Other Income:</strong> PKR {formData.otherIncome || "0"}
            </p>
          )}
          <p>
            <strong>Deductions:</strong> {safeJoin(formData.deductions, ", ")}
          </p>
          <p>
            <strong>Assets:</strong> {safeJoin(formData.assets, ", ")}
          </p>
          <p>
            <strong>Bank Details:</strong> {formData.bankDetails || "N/A"}
          </p>
          <p>
            <strong>Tax Credits:</strong> PKR {totalTaxCredits.toLocaleString()}
          </p>
          {formData.taxCredits && (
            <ul className="ml-4 list-disc">
              {formData.taxCredits.donations?.enabled && (
                <li>
                  Donations: PKR {formData.taxCredits.donations.taxCreditAmount?.toLocaleString() || "0"}
                </li>
              )}
              {formData.taxCredits.pensionFund?.enabled && (
                <li>
                  Pension Fund: PKR {formData.taxCredits.pensionFund.taxCreditAmount?.toLocaleString() || "0"}
                </li>
              )}
              {formData.taxCredits.tuitionFees?.enabled && (
                <li>
                  Tuition Fees: PKR {formData.taxCredits.tuitionFees.taxCreditAmount?.toLocaleString() || "0"}
                </li>
              )}
            </ul>
          )}
          <p>
            <strong>Documents Uploaded:</strong> {formData.documentsUploaded ? "Yes" : "No"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* <Checkbox
            id="consentGiven"
            checked={formData.consentGiven || false}
            onChange={(checked) => handleInputChange("consentGiven", checked)}
          />
          <Label htmlFor="consentGiven">I confirm the information provided is accurate</Label> */}
        </div>
      </CardContent>
    </Card>
  )
}