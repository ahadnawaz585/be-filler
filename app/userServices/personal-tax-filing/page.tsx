"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"
import { TaxYearStep } from "@/components/personal-tax-filing/tax-year-step"
import { PersonalInfoStep } from "@/components/personal-tax-filing/personal-info-step"
import { IncomeSourcesStep } from "@/components/personal-tax-filing/income-sources-step"
import { IncomeDetailsStep } from "@/components/personal-tax-filing/income-details-step"
import { DeductionsStep } from "@/components/personal-tax-filing/deductions-step"
import { AssetsStep } from "@/components/personal-tax-filing/assets-step"
import { BankDetailsStep } from "@/components/personal-tax-filing/bank-details-step"
import { TaxCreditsStep } from "@/components/personal-tax-filing/tax-credits-step"
import { DocumentUploadStep } from "@/components/personal-tax-filing/document-upload-step"
import { ReviewSubmitStep } from "@/components/personal-tax-filing/review-submit-step"

export default function PersonalTaxFiling() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    taxYear: "",
    fullName: "",
    email: "",
    cnic: "",
    dateOfBirth: null as Date | null,
    nationality: "",
    residentialStatus: "",
    stayMoreThan3Years: false,
    employmentBasedStay: false,
    incomeSources: [] as string[],
    salaryIncome: "",
    businessIncome: "",
    rentalIncome: "",
    otherIncome: "",
    deductions: [] as string[],
    assets: [] as string[],
    bankDetails: "",
    taxCredits: "",
    documentsUploaded: false,
    consentGiven: false,
  })

  const steps = [
    { id: 1, title: "Tax Year", shortTitle: "Year" },
    { id: 2, title: "Personal Info", shortTitle: "Info" },
    { id: 3, title: "Income Sources", shortTitle: "Sources" },
    { id: 4, title: "Income Details", shortTitle: "Details" },
    { id: 5, title: "Deductions", shortTitle: "Deductions" },
    { id: 6, title: "Assets", shortTitle: "Assets" },
    { id: 7, title: "Bank Details", shortTitle: "Bank" },
    { id: 8, title: "Tax Credits", shortTitle: "Credits" },
    { id: 9, title: "Document Upload", shortTitle: "Docs" },
    { id: 10, title: "Review & Submit", shortTitle: "Review" },
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return !!formData.taxYear
      case 2:
        const cnicRegex = /^\d{5}-\d{7}-\d{1}$/
        return (
          !!formData.fullName &&
          !!formData.email &&
          !!formData.cnic &&
          cnicRegex.test(formData.cnic) &&
          !!formData.dateOfBirth &&
          !!formData.nationality &&
          !!formData.residentialStatus
        )
      case 3:
        return formData.incomeSources.length > 0
      case 4:
        return formData.incomeSources.every((source) =>
          source === "salary"
            ? !!formData.salaryIncome
            : source === "business"
              ? !!formData.businessIncome
              : source === "property"
                ? !!formData.rentalIncome
                : source === "other"
                  ? !!formData.otherIncome
                  : true,
        )
      case 5:
        return true // Deductions are optional
      case 6:
        return true // Assets are optional
      case 7:
        return !!formData.bankDetails
      case 8:
        return true // Tax credits are optional
      case 9:
        return formData.documentsUploaded
      case 10:
        return formData.consentGiven
      default:
        return true
    }
  }

  const handleStepChange = (step: number) => {
    if (step >= 1 && step <= steps.length) {
      if (step <= currentStep) {
        setCurrentStep(step)
      } else {
        for (let i = 1; i < step; i++) {
          if (!validateStep(i)) {
            alert(`Please complete Step ${i} before proceeding to Step ${step}`)
            return
          }
        }
        setCurrentStep(step)
      }
    }
  }

  const handleNextStep = () => {
    if (!validateStep(currentStep)) {
      alert(`Please complete all required fields in Step ${currentStep}`)
      return
    }
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      console.log("Form submitted:", formData)
      router.push("/dashboard")
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <TaxYearStep formData={formData} handleInputChange={handleInputChange} />
      case 2:
        return <PersonalInfoStep formData={formData} handleInputChange={handleInputChange} />
      case 3:
        return <IncomeSourcesStep formData={formData} handleInputChange={handleInputChange} />
      case 4:
        return <IncomeDetailsStep formData={formData} handleInputChange={handleInputChange} />
      case 5:
        return <DeductionsStep formData={formData} handleInputChange={handleInputChange} />
      case 6:
        return <AssetsStep formData={formData} handleInputChange={handleInputChange} />
      case 7:
        return <BankDetailsStep formData={formData} handleInputChange={handleInputChange} />
      case 8:
        return <TaxCreditsStep formData={formData} handleInputChange={handleInputChange} />
      case 9:
        return <DocumentUploadStep formData={formData} handleInputChange={handleInputChange} />
      case 10:
        return <ReviewSubmitStep formData={formData} handleInputChange={handleInputChange} />
      default:
        return null
    }
  }

  return (
    <div className="container px-4 mx-auto py-8 mt-16">
      {/* Responsive Stepper Header */}
      <div className="mb-8">
        {/* Desktop Stepper */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between relative">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1 flex flex-col items-center relative">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 z-10 ${
                    step.id === currentStep
                      ? "bg-[#af0e0e] text-white border-2 border-[#af0e0e]"
                      : validateStep(step.id)
                        ? "bg-green-500 text-white border-2 border-green-500 hover:bg-green-600"
                        : "bg-gray-200 text-gray-500 border-2 border-gray-200 hover:bg-gray-300"
                  }`}
                  onClick={() => handleStepChange(step.id)}
                >
                  {validateStep(step.id) && step.id !== currentStep ? <CheckCircle2 className="h-5 w-5" /> : step.id}
                </div>
                <span
                  className={`mt-2 text-sm font-medium text-center ${
                    step.id === currentStep
                      ? "text-[#af0e0e]"
                      : validateStep(step.id)
                        ? "text-green-800"
                        : "text-gray-500"
                  }`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-5 h-0.5 ${validateStep(step.id) ? "bg-green-500" : "bg-gray-200"}`}
                    style={{
                      left: "50%",
                      right: `calc(-100% + 50%)`,
                      width: `calc(100vw / ${steps.length} - 40px)`,
                      marginLeft: "20px",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tablet Stepper */}
        <div className="hidden md:block lg:hidden">
          <div className="flex items-center justify-between relative">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1 flex flex-col items-center relative">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 text-xs z-10 ${
                    step.id === currentStep
                      ? "bg-[#af0e0e] text-white border-2 border-[#af0e0e]"
                      : validateStep(step.id)
                        ? "bg-green-500 text-white border-2 border-green-500 hover:bg-green-600"
                        : "bg-gray-200 text-gray-500 border-2 border-gray-200 hover:bg-gray-300"
                  }`}
                  onClick={() => handleStepChange(step.id)}
                >
                  {validateStep(step.id) && step.id !== currentStep ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                </div>
                <span
                  className={`mt-1 text-xs font-medium text-center ${
                    step.id === currentStep
                      ? "text-[#af0e0e]"
                      : validateStep(step.id)
                        ? "text-green-800"
                        : "text-gray-500"
                  }`}
                >
                  {step.shortTitle}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-4 h-0.5 ${validateStep(step.id) ? "bg-green-500" : "bg-gray-200"}`}
                    style={{
                      left: "50%",
                      right: `calc(-100% + 50%)`,
                      width: `calc(100vw / ${steps.length} - 32px)`,
                      marginLeft: "16px",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Stepper - Horizontal Scroll */}
        <div className="block md:hidden">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 text-xs ${
                      step.id === currentStep
                        ? "bg-[#af0e0e] text-white border-2 border-[#af0e0e]"
                        : validateStep(step.id)
                          ? "bg-green-500 text-white border-2 border-green-500"
                          : "bg-gray-200 text-gray-500 border-2 border-gray-200"
                    }`}
                    onClick={() => handleStepChange(step.id)}
                  >
                    {validateStep(step.id) && step.id !== currentStep ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                  </div>
                  <span
                    className={`mt-1 text-xs font-medium text-center whitespace-nowrap ${
                      step.id === currentStep
                        ? "text-[#af0e0e]"
                        : validateStep(step.id)
                          ? "text-green-800"
                          : "text-gray-500"
                    }`}
                  >
                    {step.shortTitle}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-1 mt-[-16px] ${validateStep(step.id) ? "bg-green-500" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>
            Personal Tax Filing - Step {currentStep}: {steps[currentStep - 1].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={currentStep === 1}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={handleNextStep}
              className="flex items-center"
              disabled={currentStep < steps.length && !validateStep(currentStep)}
            >
              {currentStep === steps.length ? "Submit" : "Next"}
              {currentStep < steps.length && <ChevronRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
