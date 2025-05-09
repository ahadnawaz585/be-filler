"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { verifyOTP, generateOTP, sendOTP } from "@/lib/auth"

const otpSchema = z.object({
  digit1: z.string().length(1).regex(/^\d$/),
  digit2: z.string().length(1).regex(/^\d$/),
  digit3: z.string().length(1).regex(/^\d$/),
  digit4: z.string().length(1).regex(/^\d$/),
  digit5: z.string().length(1).regex(/^\d$/),
  digit6: z.string().length(1).regex(/^\d$/),
})

type OTPFormValues = z.infer<typeof otpSchema>

interface OTPFormProps {
  email: string
  onOTPVerified: () => void
}

export function OTPForm({ email, onOTPVerified }: OTPFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isResending, setIsResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [storedOTP, setStoredOTP] = useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setFocus,
  } = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      digit1: "",
      digit2: "",
      digit3: "",
      digit4: "",
      digit5: "",
      digit6: "",
    },
  })

  // Send OTP on initial load
  useEffect(() => {
    const sendInitialOTP = async () => {
      const otp = generateOTP()
      setStoredOTP(otp)
      await sendOTP(email, otp)
    }

    sendInitialOTP()
  }, [email])

  // Handle countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)

    return () => clearTimeout(timerId)
  }, [timeLeft])

  // Handle input navigation for OTP fields
  const handleDigitInput = (e: React.ChangeEvent<HTMLInputElement>, nextFieldId?: string) => {
    if (e.target.value && nextFieldId) {
      document.getElementById(nextFieldId)?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, prevFieldId?: string) => {
    if (e.key === "Backspace" && !e.currentTarget.value && prevFieldId) {
      document.getElementById(prevFieldId)?.focus()
    }
  }

  // Handler for OTP submission
  const onSubmit = async (data: OTPFormValues) => {
    try {
      const enteredOTP = Object.values(data).join("")

      if (verifyOTP(email, enteredOTP, storedOTP)) {
        toast({
          title: "Success",
          description: "OTP verification successful.",
          variant: "default",
        })
        onOTPVerified()
      } else {
        toast({
          title: "Verification Failed",
          description: "The OTP you entered is invalid. Please try again.",
          variant: "destructive",
        })
        reset()
        setFocus("digit1")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handler for resending OTP
  const handleResendOTP = async () => {
    try {
      setIsResending(true)
      const otp = generateOTP()
      setStoredOTP(otp)
      await sendOTP(email, otp)

      toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your email.",
        variant: "default",
      })

      setTimeLeft(60)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Verify Email</h1>
        <p className="text-muted-foreground">
          Enter the 6-digit code sent to <span className="font-medium">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-center gap-2">
            {Array.from({ length: 6 }).map((_, index) => {
              const fieldName = `digit${index + 1}` as keyof OTPFormValues
              const nextField = index < 5 ? `digit${index + 2}` : undefined
              const prevField = index > 0 ? `digit${index}` : undefined

              return (
                <div key={index} className="w-12">
                  <Input
                    id={fieldName}
                    {...register(fieldName)}
                    maxLength={1}
                    className="text-center text-lg h-12"
                    onChange={(e) => handleDigitInput(e, nextField)}
                    onKeyDown={(e) => handleKeyDown(e, prevField)}
                    autoComplete="off"
                    inputMode="numeric"
                  />
                </div>
              )
            })}
          </div>

          {Object.keys(errors).length > 0 && (
            <p className="text-sm text-destructive text-center">Please enter all digits correctly</p>
          )}
        </div>

        <div className="space-y-4">
          <Button type="submit" className="w-full bg-[#af0e0e] hover:bg-[#8a0b0b]" disabled={isSubmitting}>
            {isSubmitting ? "Verifying..." : "Verify OTP"}
          </Button>

          <div className="text-center space-y-2">
            <div className="flex items-center gap-2 justify-center">
              <span className="text-sm text-muted-foreground">Time remaining: {timeLeft}s</span>
            </div>

            <Button
              type="button"
              variant="link"
              className="text-[#af0e0e]"
              onClick={handleResendOTP}
              disabled={isResending || timeLeft > 0}
            >
              {isResending ? "Resending..." : "Resend OTP"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
