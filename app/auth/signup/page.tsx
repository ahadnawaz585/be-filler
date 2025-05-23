"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { OTPForm } from "@/components/auth/otp-form"
import { UserForm } from "@/components/auth/user-form"
import { FileDigit, Lock, Mail, Phone, User } from "lucide-react"
import axios from "axios"

const signupSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    phoneNumber: z
      .string()
      .trim()
      .transform((val) => val.replace(/[\s-]/g, "")) // Remove spaces and dashes
      .superRefine((val, ctx) => {
        if (!/^(\+92[0-9]{10}|0[0-9]{10})$/.test(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Enter a valid Pakistani phone number (e.g., +923001234567 or 03001234567)",
          });
        }
      }),
    cnic: z.string().regex(/^\d{13}$/, "CNIC must be 13 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    terms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms and conditions" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type SignupFormValues = z.infer<typeof signupSchema>

async function sendOTP(data: {
  email: string
  fullName: string
  phoneNumber: string
  cnic: string
  password: string
}): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await axios.post("http://localhost:3001/api/v1/auth/register", {
      email: data.email,
      fullName: data.fullName as string,
      phoneNumber: data.phoneNumber as string,
      cnic: data.cnic,
      password: data.password,
    })
    console.log("sendOTP response:", response.data)
    return { success: true, message: response.data.message }
  } catch (error: any) {
    console.error("Error sending OTP:", error.message, error.response?.data)
    return {
      success: false,
      message: error.response?.data?.message || "Failed to send OTP",
    }
  }
}

export default function SignupPage() {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [formData, setFormData] = useState<{
    fullName: string
    phoneNumber: string
    cnic: string
    password: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    trigger,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      fullName: "",
      phoneNumber: "",
      cnic: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  })

  // Debug: Watch terms and phoneNumber
  const termsValue = watch("terms")
  const phoneNumberValue = watch("phoneNumber")
  console.log("Terms value:", termsValue)
  console.log("Phone number value:", phoneNumberValue)

  const onSubmit = async (data: SignupFormValues): Promise<void> => {
    try {
      const result = await sendOTP({
        email: data.email as string,
        fullName: data.fullName as string,
        phoneNumber: data.phoneNumber as string,
        cnic: data.cnic as string,
        password: data.password as string,
      })
      console.log("onSubmit result:", result)
      if (result.success) {
        setEmail(data.email as string)
        setFormData({
          fullName: data.fullName as string,
          phoneNumber: data.phoneNumber as string,
          cnic: data.cnic as string,
          password: data.password as string,
        })
        setStep(2)
        toast({
          title: "OTP Sent",
          description: "Please check your email for the verification code",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to send OTP. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("onSubmit error:", error)
      toast({
        title: "Error",
        description: "Failed to proceed. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleOTPVerified = () => {
    // setStep(3)
    toast({
      title: "Account Created",
      description: "Your account has been created successfully. Please complete your profile.",
      variant: "default",
    })
    setTimeout(() => {
      window.location.href = "/auth/login"
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-24">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <Image
              src="/placeholder.svg?height=50&width=160"
              alt="Befiler Logo"
              width={160}
              height={50}
              priority
              className="mx-auto h-12 w-auto"
            />
          </Link>

          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold">Create an account</h1>
              <p className="text-sm text-muted-foreground">Sign up to get started with Befiler</p>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold">Verify your email</h1>
              <p className="text-sm text-muted-foreground">We've sent a code to {email}</p>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="text-2xl font-bold">Complete your profile</h1>
              <p className="text-sm text-muted-foreground">Just a few more details to get started</p>
            </>
          )}
        </div>

        <div className="bg-card rounded-lg shadow-md p-6 border">
          {step === 1 && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    placeholder="you@example.com"
                    type="email"
                    {...register("email")}
                    className="pl-10"
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    type="text"
                    {...register("fullName")}
                    className="pl-10"
                  />
                </div>
                {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    placeholder="+923001234567 or 03001234567"
                    type="tel"
                    {...register("phoneNumber")}
                    className="pl-10"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnic">CNIC</Label>
                <div className="relative">
                  <FileDigit className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cnic"
                    placeholder="3520112345678"
                    type="text"
                    {...register("cnic")}
                    className="pl-10"
                  />
                </div>
                {errors.cnic && <p className="text-sm text-destructive">{errors.cnic.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    placeholder="Enter your password"
                    type="password"
                    {...register("password")}
                    className="pl-10"
                  />
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    type="password"
                    {...register("confirmPassword")}
                    className="pl-10"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  {...register("terms", {
                    onChange: () => trigger("terms"),
                  })}
                  className="mt-1"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{" "}
                    <Link href="/terms-of-service" className="text-[#af0e0e] hover:underline">
                      terms of service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy-policy" className="text-[#af0e0e] hover:underline">
                      privacy policy
                    </Link>
                  </Label>
                  {errors.terms && <p className="text-sm text-destructive">{errors.terms.message}</p>}
                </div>
              </div>

              <Button type="submit" className="w-full bg-[#af0e0e] hover:bg-[#8a0b0b]" disabled={isSubmitting}>
                {isSubmitting ? "Sending verification code..." : "Continue with Email"}
              </Button>
            </form>
          )}

          {step === 2 && <OTPForm email={email} formData={formData} onOTPVerified={handleOTPVerified} />}

          {step === 3 && <UserForm email={email} />}
        </div>

        {step === 1 && (
          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#af0e0e] hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}