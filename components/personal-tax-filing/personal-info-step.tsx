"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

interface PersonalInfoStepProps {
  formData: any
  handleInputChange: (field: string, value: any) => void
}

export function PersonalInfoStep({ formData, handleInputChange }: PersonalInfoStepProps) {
  const [cnicError, setCnicError] = useState("")

  const formatCnic = (value: string) => {
    const numericValue = value.replace(/\D/g, "")
    let formatted = ""
    if (numericValue.length > 0) {
      formatted = numericValue.slice(0, 5)
    }
    if (numericValue.length > 5) {
      formatted += "-" + numericValue.slice(5, 12)
    }
    if (numericValue.length > 12) {
      formatted += "-" + numericValue.slice(12, 13)
    }
    return formatted
  }

  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    const formattedValue = formatCnic(rawValue)
    handleInputChange("cnic", formattedValue)

    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/
    if (formattedValue && !cnicRegex.test(formattedValue)) {
      setCnicError("CNIC must be in the format xxxxx-xxxxxxx-x (13 digits)")
    } else {
      setCnicError("")
    }
  }

  return (
    <div className="space-y-4">
      <style jsx>{`
        .calendar-day-names {
          display: grid !important;
          grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
          text-align: center !important;
        }
        .calendar-day-names > * {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
        }
        .calendar-days {
          display: grid !important;
          grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
        }
        .calendar-days > * {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
        }
      `}</style>
      <h2 className="text-lg font-semibold">Personal Information</h2>
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => handleInputChange("fullName", e.target.value)}
          placeholder="Enter your full name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          placeholder="Enter your email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cnic">CNIC Number</Label>
        <Input
          id="cnic"
          value={formData.cnic}
          onChange={handleCnicChange}
          placeholder="xxxxx-xxxxxxx-x"
          maxLength={15}
        />
        {cnicError && <p className="text-sm text-red-500">{cnicError}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.dateOfBirth ? format(formData.dateOfBirth, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.dateOfBirth || undefined}
              onSelect={(date) => handleInputChange("dateOfBirth", date)}
              initialFocus
              className="calendar-custom"
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <Label htmlFor="nationality">Nationality</Label>
        <Select onValueChange={(value) => handleInputChange("nationality", value)} value={formData.nationality}>
          <SelectTrigger>
            <SelectValue placeholder="Select nationality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pakistan">Pakistan</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="residentialStatus">Residential Status</Label>
        <Select
          onValueChange={(value) => handleInputChange("residentialStatus", value)}
          value={formData.residentialStatus}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select residential status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Resident">Resident</SelectItem>
            <SelectItem value="Non-Resident">Non-Resident</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {formData.nationality === "Other" && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="stayMoreThan3Years"
              checked={formData.stayMoreThan3Years}
              onCheckedChange={(checked) => handleInputChange("stayMoreThan3Years", checked)}
            />
            <Label htmlFor="stayMoreThan3Years">Stay in Pakistan more than 3 years</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="employmentBasedStay"
              checked={formData.employmentBasedStay}
              onCheckedChange={(checked) => handleInputChange("employmentBasedStay", checked)}
            />
            <Label htmlFor="employmentBasedStay">Stay in Pakistan based on employment</Label>
          </div>
        </div>
      )}
    </div>
  )
}
