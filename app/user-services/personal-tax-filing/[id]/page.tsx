"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"
import { TaxYearStep } from "@/components/personal-tax-filing/tax-year-step"
import { PersonalInfoStep } from "@/components/personal-tax-filing/personal-info-step"
import { IncomeSourcesStep } from "@/components/personal-tax-filing/income-sources-step"
import { IncomeDetailsStep } from "@/components/personal-tax-filing/income-details-step"
import DeductionsStep from "@/components/personal-tax-filing/deductions-step"
import DeductionDetailsStep from "@/components/personal-tax-filing/deduction-details-step"
import { OpeningWealthStep } from "@/components/personal-tax-filing/wealth-statement-step"
import AssetsStep from "@/components/personal-tax-filing/assets-selection-step"
import AssetDetailsStep from "@/components/personal-tax-filing/assets-details-step"
import LiabilitiesStep from "@/components/personal-tax-filing/liabilities-step"
import { TaxCreditsStep } from "@/components/personal-tax-filing/tax-credits-step"
import { DocumentUploadStep } from "@/components/personal-tax-filing/document-upload-step"
import ReviewSubmitStep from "@/components/personal-tax-filing/review-submit-step"
import { TaxFilingService } from "@/services/taxFiling.service"
import { toast } from "@/components/ui/use-toast"
import { BankDetailsStep } from "@/components/personal-tax-filing/bank-details-step"

// Define interfaces matching engine schema
interface BankTransaction {
  transactionType: string;
  bankName: string;
  accountNo: string;
  taxDeducted: number;
}

interface Utility {
  utilityType: string;
  provider: string;
  consumerNo: string;
  taxDeducted: number;
}

interface Vehicle {
  activityType: string;
  vehicleType: string;
  registrationNo: string;
  taxDeducted: number;
}

interface OtherDeduction {
  propertyPurchaseTax: number;
  propertySaleTax: number;
  functionsGatheringTax: number;
  pensionWithdrawalTax: number;
}

interface TaxDeducted {
  bankTransactions?: BankTransaction[];
  utilities?: Utility[];
  vehicles?: Vehicle[];
  other?: OtherDeduction;
}

interface WealthStatement {
  openingWealth: number;
  assets: {
    properties?: {
      propertyType: string;
      size: number;
      unitType: string;
      address: string;
      fbrValue: number;
      cost: number;
    }[];
    vehicles?: {
      vehicleType: string;
      cost: number;
      registrationNo: string;
    }[];
    bankAccounts?: {
      bankName: string;
      accountNo: string;
      cost: number;
    }[];
    insurances?: {
      companyName: string;
      description: string;
      premiumPaid: number;
    }[];
    possessions?: {
      possessionType: string;
      description: string;
      cost: number;
    }[];
    foreignAssets?: {
      description: string;
      cost: number;
    }[];
    cash?: {
      balance: number;
    };
    otherAssets?: {
      transactionType: string;
      description: string;
      amount: number;
    }[];
  };
  liabilities: {
    bankLoans?: {
      bankName: string;
      outstandingLoan: number;
    }[];
    otherLiabilities?: {
      liabilityType: string;
      amount: number;
      description: string;
    }[];
  };
}
interface iexpense {
  householdExpenses: number;
}

interface ITaxCredit {
  donations?: { enabled: boolean; taxCreditAmount?: number };
  pensionFund?: { enabled: boolean; taxCreditAmount?: number };
  tuitionFees?: { enabled: boolean; taxCreditAmount?: number };
}

export default function PersonalTaxFiling() {
  const router = useRouter()
  const params = useParams()
  const taxFilingId = params.id as string
  if (!taxFilingId) {
    router.push('/user-services/personal-tax-filing')
  }
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
    incomes: [] as string[],
    salaryIncome: "",
    businessIncome: "",
    rentalIncome: "",
    otherIncome: "",
    deductions: [] as string[],
    deductionDetails: {} as TaxDeducted,
    selectedAssets: [] as string[],
    wealthStatement: {
      openingWealth: 0,
      assets: {},
      liabilities: {}
    } as WealthStatement,
    expense: {
      householdExpenses: 0
    } as iexpense,
    taxCredits: {

    } as ITaxCredit,
    documentsUploaded: false,
    consentGiven: false,
  })

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const ts = new TaxFilingService()
        const response = await ts.getById(taxFilingId)
        if (response) {
          if (response.status === 'under_review') {
            router.push('/user-services/personal-tax-filing')
          }
          setFormData((prev) => ({
            ...prev,
            taxYear: response.taxYear?.toString() || "",
            fullName: response.personalInfo?.fullName || "",
            email: response.personalInfo?.email || "",
            cnic: response.personalInfo?.cnic || "",
            dateOfBirth: response.personalInfo?.dateOfBirth ? new Date(response.personalInfo.dateOfBirth) : null,
            nationality: response.personalInfo?.nationality || "",
            residentialStatus: response.personalInfo?.residentialStatus || "",
            incomes: response.incomes?.map((income: any) => income.type) || [],
            salaryIncome: response.incomes?.find((i: any) => i.type === "salary")?.details || "",
            businessIncome: response.incomes?.find((i: any) => i.type === "business")?.details || "",
            rentalIncome: response.incomes?.find((i: any) => i.type === "rent")?.details || "",
            otherIncome: response.incomes?.find((i: any) => i.type === "other")?.details || "",
            deductions: response.taxDeducted
              ? Object.keys(response.taxDeducted).map((key) =>
                key === "bankTransactions"
                  ? "bank_transactions"
                  : key === "other"
                    ? "other"
                    : key
              ).filter((key) =>
                key === "other"
                  ? response.taxDeducted.other && Object.values(response.taxDeducted.other).some((v) => v > 0)
                  : Array.isArray(response.taxDeducted[key]) && response.taxDeducted[key].length > 0
              )
              : [],
            deductionDetails: response.taxDeducted || {},
            selectedAssets: response.wealthStatement?.assets
              ? Object.keys(response.wealthStatement.assets).filter(
                (key) =>
                  (Array.isArray(response.wealthStatement.assets[key]) &&
                    response.wealthStatement.assets[key].length > 0) ||
                  (key === "cash" && response.wealthStatement.assets[key]?.balance > 0)
              )
              : [],
            wealthStatement: response.wealthStatement || {
              openingWealth: 0,
              assets: {},
              liabilities: {}
            },
            expense: response.expense || { householdExpenses: 0 },
            taxCredits: response.taxCredits
              ? Object.entries(response.taxCredits)
                .filter(([_, value]) => value)
                .map(([key]) => key)
                .join(",") || ""
              : "",
            documentsUploaded: response.documents?.length > 0 || false,
            consentGiven: response.consentGiven || false,
          }))
        }
      } catch (error) {
        console.error("Error fetching initial data:", error)
        toast({
          title: "Error",
          description: "Failed to load tax filing data. Please try again.",
          variant: "destructive",
        })
      }
    }

    if (taxFilingId) {
      fetchInitialData()
    }
  }, [taxFilingId])

  const steps = [
    { id: 1, title: "Tax Year", shortTitle: "Year" },
    { id: 2, title: "Personal Info", shortTitle: "Info" },
    { id: 3, title: "Income Sources", shortTitle: "Sources" },
    { id: 4, title: "Income Details", shortTitle: "Details" },
    { id: 5, title: "Deductions", shortTitle: "Deductions" },
    { id: 6, title: "Deduction Details", shortTitle: "Deduction Details" },
    { id: 7, title: "Opening Wealth", shortTitle: "Wealth" },
    { id: 8, title: "Asset Selection", shortTitle: "Assets" },
    { id: 9, title: "Asset Details", shortTitle: "Asset Details" },
    { id: 10, title: "Liabilities", shortTitle: "Liabilities" },
    { id: 11, title: "Expense Details", shortTitle: "Expense" },
    { id: 12, title: "Tax Credits", shortTitle: "Credits" },
    { id: 13, title: "Document Upload", shortTitle: "Docs" },
    { id: 14, title: "Review & Submit", shortTitle: "Review" },
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
        return formData.incomes.length > 0
      case 4:
        return formData.incomes.every((source) =>
          source === "salary"
            ? !!formData.salaryIncome
            : source === "business"
              ? !!formData.businessIncome
              : source === "rent"
                ? !!formData.rentalIncome
                : source === "other"
                  ? !!formData.otherIncome
                  : true
        )
      case 5:
        return true // Deductions selection is optional
      case 6:
        return formData.deductions.length === 0 || formData.deductions.every((deduction) => {
          if (deduction === "bank_transactions") {
            return formData.deductionDetails.bankTransactions?.length > 0
          }
          if (deduction === "utilities") {
            return formData.deductionDetails.utilities?.length > 0
          }
          if (deduction === "vehicles") {
            return formData.deductionDetails.vehicles?.length > 0
          }
          if (deduction === "other") {
            return (
              formData.deductionDetails.other &&
              Object.values(formData.deductionDetails.other).some((v) => v > 0)
            )
          }
          return false
        })
      case 7:
        return formData.wealthStatement.openingWealth >= 0 // Non-negative opening wealth
      case 8:
        return formData.selectedAssets.length > 0 // Require at least one asset selected
      case 9:
        // Validate that all selected assets have at least one entry
        return formData.selectedAssets.every((asset) => {
          const assets = formData.wealthStatement.assets
          switch (asset) {
            case "properties":
              return assets.properties && assets.properties.length > 0
            case "vehicles":
              return assets.vehicles && assets.vehicles.length > 0
            case "bankAccounts":
              return assets.bankAccounts && assets.bankAccounts.length > 0
            case "insurances":
              return assets.insurances && assets.insurances.length > 0
            case "possessions":
              return assets.possessions && assets.possessions.length > 0
            case "foreignAssets":
              return assets.foreignAssets && assets.foreignAssets.length > 0
            case "cash":
              return assets.cash && assets.cash.balance > 0
            case "otherAssets":
              return assets.otherAssets && assets.otherAssets.length > 0
            default:
              return false
          }
        })
      case 10:
        // Liabilities are optional, but require valid entries if provided
        return (
          !formData.wealthStatement.liabilities ||
          Object.values(formData.wealthStatement.liabilities).every((liabilityArray) =>
            !liabilityArray || liabilityArray.length > 0
          )
        )
      case 11:
        return !!formData.expense
      case 12:
        return true // Tax credits are optional
      case 13:
        return formData.documentsUploaded
      case 14:
        return formData.consentGiven
      default:
        return true
    }
  }

  const handleStepChange = (step: number) => {
    if (step >= 1 && step <= steps.length) {
      if (step <= currentStep) {
        console.log(`Navigating back to Step ${step}`)
        setCurrentStep(step)
      } else {
        for (let i = 1; i < step; i++) {
          if (!validateStep(i)) {
            alert(`Please complete Step ${i} before proceeding to Step ${step}`)
            return
          }
        }
        console.log("Form data:", formData, "Navigating to step:", step)
        setCurrentStep(step)
      }
    }
  }

  const handleNextStep = async () => {
    // if (!validateStep(currentStep)) {
    //   alert(`Please complete all required fields in Step ${currentStep}`)
    //   return
    // }
    try {
      const ts = new TaxFilingService()
      if (currentStep === 1) {
        // await ts.createAcc("userId", { taxYear: formData.taxYear })
      }
      if (currentStep === 2) {
        await ts.step1(taxFilingId, {
          taxYear: Number(formData.taxYear),
          personalInfo: {
            fullName: formData.fullName,
            email: formData.email,
            cnic: formData.cnic,
            dateOfBirth: formData.dateOfBirth,
            nationality: formData.nationality,
            residentialStatus: formData.residentialStatus,
          },
          filingType: "individual",
        })
      }
      if (currentStep === 3) {
        await ts.step2(taxFilingId, { incomes: formData.incomes })
      }
      if (currentStep === 4) {
        await ts.step2(taxFilingId, {
          incomes: formData.incomes
        })
      }
      if (currentStep === 5) {
        await ts.step4(taxFilingId, {
          taxDeducted: formData.deductionDetails,
        })
      }
      if (currentStep === 6) {
        const taxDeducted: TaxDeducted = {}
        if (formData.deductions.includes("bank_transactions")) {
          taxDeducted.bankTransactions = formData.deductionDetails.bankTransactions || []
        }
        if (formData.deductions.includes("utilities")) {
          taxDeducted.utilities = formData.deductionDetails.utilities || []
        }
        if (formData.deductions.includes("vehicles")) {
          taxDeducted.vehicles = formData.deductionDetails.vehicles || []
        }
        if (formData.deductions.includes("other")) {
          taxDeducted.other = formData.deductionDetails.other || {
            propertyPurchaseTax: 0,
            propertySaleTax: 0,
            functionsGatheringTax: 0,
            pensionWithdrawalTax: 0,
          }
        }
        await ts.step4(taxFilingId, { taxDeducted })
      }
      if (currentStep === 7) {
        // Save opening wealth
        await ts.step5(taxFilingId, {
          wealthStatement: {
            openingWealth: formData.wealthStatement.openingWealth,
            assets: {},
            liabilities: formData.wealthStatement.liabilities
          }
        })
      }
      if (currentStep === 8) {
        // Save selected assets (no detailed asset data yet)
        await ts.step5(taxFilingId, {
          wealthStatement: {
            openingWealth: formData.wealthStatement.openingWealth,
            assets: {},
            liabilities: formData.wealthStatement.liabilities
          }
        })
      }
      if (currentStep === 9) {
        // Save asset details
        await ts.step5(taxFilingId, {
          wealthStatement: {
            openingWealth: formData.wealthStatement.openingWealth,
            assets: formData.wealthStatement.assets,
            liabilities: formData.wealthStatement.liabilities
          }
        })
      }
      if (currentStep === 10) {
        // Save liabilities
        await ts.step5(taxFilingId, {
          wealthStatement: {
            openingWealth: formData.wealthStatement.openingWealth,
            assets: formData.wealthStatement.assets,
            liabilities: formData.wealthStatement.liabilities
          }
        })
      }
      if (currentStep === 11) {
        await ts.step6(taxFilingId, {
          expenses: {
            householdExpenses: formData.expense.householdExpenses
          }
        })
      }
      if (currentStep === 12) {
        console.log(formData.taxCredits)
        await ts.step7(taxFilingId, {
          taxCredits: formData.taxCredits
        })
      }
      if (currentStep === 13) {
        // await ts.step8(taxFilingId, { documents: formData.documentsUploaded ? [/* document IDs */] : [] })
      }
      if (currentStep === 14) {
        await ts.submitFiling(taxFilingId)
        toast({
          title: "Success",
          description: "Tax filing submitted successfully.",
        })
        router.push("/user-services/personal-tax-filing")
        return
      }

      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1)
      }
    } catch (error) {
      console.error(`Error saving step ${currentStep}:`, error)
      toast({
        title: "Error",
        description: `Failed to save Step ${currentStep}. Please try again.`,
        variant: "destructive",
      })
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
        return <DeductionDetailsStep formData={formData} handleInputChange={handleInputChange} />
      case 7:
        return <OpeningWealthStep formData={formData} handleInputChange={handleInputChange} />
      case 8:
        return <AssetsStep formData={formData} handleInputChange={handleInputChange} />
      case 9:
        return <AssetDetailsStep formData={formData} handleInputChange={handleInputChange} />
      case 10:
        return <LiabilitiesStep formData={formData} handleInputChange={handleInputChange} />
      case 11:
        return <BankDetailsStep formData={formData} handleInputChange={handleInputChange} />
      case 12:
        return <TaxCreditsStep formData={formData} handleInputChange={handleInputChange} />
      case 13:
        return <DocumentUploadStep formData={formData} handleInputChange={handleInputChange} />
      case 14:
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
                  className={`w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 z-10 ${step.id === currentStep
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
                  className={`mt-2 text-sm font-medium text-center ${step.id === currentStep
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
                  className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 text-xs z-10 ${step.id === currentStep
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
                  className={`mt-1 text-xs font-medium text-center ${step.id === currentStep
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
                    className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 text-xs ${step.id === currentStep
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
                    className={`mt-1 text-xs font-medium text-center whitespace-nowrap ${step.id === currentStep
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

      <Card className="p-2 mx-auto">
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