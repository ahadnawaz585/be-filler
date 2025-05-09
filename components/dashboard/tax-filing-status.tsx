"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileCheck, ArrowRight, CalendarClock, Check, AlertCircle } from "lucide-react"
import { taxYears } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function TaxFilingStatus() {
  const [selectedYear, setSelectedYear] = useState(taxYears[0].value)

  // Time remaining calculation
  const currentDate = new Date()
  const deadlineDate = new Date(Number.parseInt(selectedYear.split("-")[1]), 8, 30) // September 30th
  const timeRemaining = deadlineDate.getTime() - currentDate.getTime()
  const daysRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)))

  // Mock filing progress data
  const filingProgress = 75 // percentage

  // Filing steps
  const filingSteps = [
    { id: 1, name: "Registration", completed: true },
    { id: 2, name: "Personal Information", completed: true },
    { id: 3, name: "Income Details", completed: true },
    { id: 4, name: "Deductions & Credits", completed: false },
    { id: 5, name: "Assets & Liabilities", completed: false },
    { id: 6, name: "Review & Submit", completed: false },
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-semibold">Tax Filing Progress</CardTitle>
            <CardDescription>Complete your tax return for the selected tax year</CardDescription>
          </div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select Tax Year" />
            </SelectTrigger>
            <SelectContent>
              {taxYears.map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Status Overview */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted p-4 rounded-lg">
            <div className="flex items-center">
              <FileCheck className="h-10 w-10 text-[#af0e0e] mr-4" />
              <div>
                <h3 className="font-medium">Current Status</h3>
                <p className="text-sm text-muted-foreground">Return in progress</p>
              </div>
            </div>
            <div className="flex items-center">
              <CalendarClock className="h-5 w-5 text-muted-foreground mr-2" />
              <div>
                <h3 className="font-medium">{daysRemaining} days remaining</h3>
                <p className="text-sm text-muted-foreground">Until deadline</p>
              </div>
            </div>
          </div>

          {/* Progress Bar (Replaced with Custom CSS) */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-medium">{filingProgress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#af0e0e] transition-all" style={{ width: `${filingProgress}%` }} />
            </div>
          </div>

          {/* Filing Steps */}
          <div className="space-y-4">
            <h3 className="font-medium">Filing Steps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filingSteps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center p-3 rounded-lg border ${
                    step.completed ? "bg-[#af0e0e]/5 border-[#af0e0e]/20" : "bg-muted border-border"
                  }`}
                >
                  {step.completed ? (
                    <Check className="h-5 w-5 text-[#af0e0e] mr-3" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground mr-3 flex-shrink-0"></div>
                  )}
                  <span className={step.completed ? "font-medium" : "text-muted-foreground"}>{step.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alert */}
          {daysRemaining < 30 && (
            <div className="flex items-start p-4 rounded-lg bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Deadline approaching</p>
                <p className="text-sm">
                  The deadline for filing your tax return is approaching. Complete your return soon to avoid penalties.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <Link href={`/dashboard/file-taxes?year=${selectedYear}`} className="flex-1">
            <Button className="w-full bg-[#af0e0e] hover:bg-[#8a0b0b]">
              Continue Filing <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard/tax-calculator" className="flex-1">
            <Button variant="outline" className="w-full">
              Tax Calculator
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
