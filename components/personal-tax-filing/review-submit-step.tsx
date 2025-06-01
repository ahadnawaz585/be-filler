"use client"

import { useEffect, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { TaxFilingService, ITaxFiling } from "@/services/taxFiling.service"

interface ReviewSubmitStepProps {
  taxFilingId?: string
  formData?: any
  handleInputChange?: (field: string, value: any) => void
}

export default function ReviewSubmitStep({ taxFilingId, formData, handleInputChange }: ReviewSubmitStepProps) {
  const [taxFilingData, setTaxFilingData] = useState<ITaxFiling | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use either API data or passed formData
  const displayData = taxFilingData || formData || {}

  useEffect(() => {
    const fetchTaxFilingData = async () => {
      if (!taxFilingId) return

      setLoading(true)
      setError(null)

      try {
        const taxFilingService = new TaxFilingService()
        const data = await taxFilingService.getById(taxFilingId)
        setTaxFilingData(data)
      } catch (err: any) {
        console.error('Error fetching tax filing:', err)
        setError('Failed to load tax filing data')
      } finally {
        setLoading(false)
      }
    }

    fetchTaxFilingData()
  }, [taxFilingId])

  // Calculate total tax credits from schema structure
  const calculateTotalTaxCredits = (data: any) => {
    const taxCredits = data.taxCredits || {}

    const donations = (taxCredits.donations?.enabled && taxCredits.donations.taxCreditAmount && !isNaN(Number(taxCredits.donations.taxCreditAmount)))
      ? Number(taxCredits.donations.taxCreditAmount) : 0

    const pensionFund = (taxCredits.pensionFund?.enabled && taxCredits.pensionFund.taxCreditAmount && !isNaN(Number(taxCredits.pensionFund.taxCreditAmount)))
      ? Number(taxCredits.pensionFund.taxCreditAmount) : 0

    const tuitionFees = (taxCredits.tuitionFees?.enabled && taxCredits.tuitionFees.taxCreditAmount && !isNaN(Number(taxCredits.tuitionFees.taxCreditAmount)))
      ? Number(taxCredits.tuitionFees.taxCreditAmount) : 0

    return donations + pensionFund + tuitionFees
  }

  const totalTaxCredits = calculateTotalTaxCredits(displayData)

  // Helper to safely join array fields
  const safeJoin = (arr: any[] | undefined, separator: string) =>
    (Array.isArray(arr) && arr.length > 0 ? arr.join(separator) : "None")

  // Helper to format currency
  const formatCurrency = (amount: any) => {
    const num = Number(amount)
    return isNaN(num) ? "0" : num.toLocaleString()
  }

  // Helper to get personal info safely
  const getPersonalInfo = (field: string) => {
    return displayData.personalInfo?.[field] || displayData[field] || "N/A"
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-t-blue-600 border-r-transparent border-l-transparent border-b-transparent rounded-full animate-spin"></div>
          <span className="ml-2">Loading tax filing data...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-red-600">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Review & Submit</CardTitle>
        <p className="text-sm text-muted-foreground">
          {taxFilingId ? "Review your tax filing information before submission" : "Review your information before submission"}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 border-b pb-2">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <p><strong>Tax Filing ID:</strong> {displayData.id || "N/A"}</p>
            <p><strong>Tax Year:</strong> {displayData.taxYear || "N/A"}</p>
            <p><strong>Status:</strong>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${displayData.status === 'completed' ? 'bg-green-100 text-green-800' :
                displayData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  displayData.status === 'active' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                {displayData.status || "Draft"}
              </span>
            </p>
            <p><strong>Submission Date:</strong> {
              displayData.submissionDate
                ? format(new Date(displayData.submissionDate), "PPP")
                : "Not submitted"
            }</p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 border-b pb-2">Personal Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <p><strong>Full Name:</strong> {getPersonalInfo('fullName')}</p>
            <p><strong>Email:</strong> {getPersonalInfo('email')}</p>
            <p><strong>CNIC:</strong> {getPersonalInfo('cnic')}</p>
            <p><strong>Date of Birth:</strong> {
              getPersonalInfo('dateOfBirth') !== "N/A"
                ? format(new Date(getPersonalInfo('dateOfBirth')), "PPP")
                : "N/A"
            }</p>
            <p><strong>Nationality:</strong> {getPersonalInfo('nationality')}</p>
            <p><strong>Residential Status:</strong> {getPersonalInfo('residentialStatus')}</p>

            {getPersonalInfo('nationality') === "Other" && (
              <>
                <p><strong>Stay more than 3 Years:</strong> {getPersonalInfo('stayMoreThan3Years') ? "Yes" : "No"}</p>
                <p><strong>Employment-Based Stay:</strong> {getPersonalInfo('employmentBasedStay') ? "Yes" : "No"}</p>
              </>
            )}
          </div>
        </div>

        {/* Income Information */}
        <div className="space-y-3 bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 border-b pb-2">Income Information</h3>

          <p><strong>Income Sources:</strong> {safeJoin(displayData.incomeSources, ", ")}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {displayData.incomeSources?.includes("salary") && (
              <p><strong>Salary Income:</strong> PKR {formatCurrency(displayData.salaryIncome)}</p>
            )}
            {displayData.incomeSources?.includes("business") && (
              <p><strong>Business Income:</strong> PKR {formatCurrency(displayData.businessIncome)}</p>
            )}
            {displayData.incomeSources?.includes("property") && (
              <p><strong>Rental Income:</strong> PKR {formatCurrency(displayData.rentalIncome)}</p>
            )}
            {displayData.incomeSources?.includes("other") && (
              <p><strong>Other Income:</strong> PKR {formatCurrency(displayData.otherIncome)}</p>
            )}
          </div>
        </div>

        {/* Deductions and Assets */}
        <div className="space-y-3 bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 border-b pb-2">Deductions & Assets</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <p><strong>Deductions:</strong> {safeJoin(displayData.deductions, ", ")}</p>
            <p><strong>Assets:</strong> {safeJoin(displayData.assets, ", ")}</p>
          </div>
        </div>

        {/* Tax Credits */}
        <div className="space-y-3 bg-orange-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 border-b pb-2">Tax Credits</h3>

          <p><strong>Total Tax Credits:</strong> PKR {formatCurrency(totalTaxCredits)}</p>

          {displayData.taxCredits && totalTaxCredits > 0 && (
            <ul className="ml-4 list-disc space-y-1">
              {displayData.taxCredits.donations?.enabled && (
                <li>Donations: PKR {formatCurrency(displayData.taxCredits.donations.taxCreditAmount)}</li>
              )}
              {displayData.taxCredits.pensionFund?.enabled && (
                <li>Pension Fund: PKR {formatCurrency(displayData.taxCredits.pensionFund.taxCreditAmount)}</li>
              )}
              {displayData.taxCredits.tuitionFees?.enabled && (
                <li>Tuition Fees: PKR {formatCurrency(displayData.taxCredits.tuitionFees.taxCreditAmount)}</li>
              )}
            </ul>
          )}
        </div>

        {/* Additional Information */}
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 border-b pb-2">Additional Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <p><strong>Bank Details:</strong> {displayData.bankDetails || "N/A"}</p>
            <p><strong>Documents Uploaded:</strong> {displayData.documentsUploaded ? "Yes" : "No"}</p>
            <p><strong>Created:</strong> {
              displayData.createdAt
                ? format(new Date(displayData.createdAt), "PPP")
                : "N/A"
            }</p>
            <p><strong>Last Updated:</strong> {
              displayData.updatedAt
                ? format(new Date(displayData.updatedAt), "PPP")
                : "N/A"
            }</p>
          </div>
        </div>

        {/* Consent Checkbox (if handleInputChange is provided) */}
        {handleInputChange && (
          <div className="flex items-center space-x-2 pt-4 border-t">
            <Checkbox
              id="consentGiven"
              checked={displayData.consentGiven || false}
              onCheckedChange={(checked) => handleInputChange("consentGiven", checked)}
            />
            <Label htmlFor="consentGiven" className="text-sm">
              I confirm that all information provided is accurate and complete
            </Label>
          </div>
        )}

        {/* Display raw data for debugging (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-500">Debug: Raw Data</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(displayData, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  )
}