"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { OTPForm } from "@/components/auth/otp-form"
import { UserForm } from "@/components/auth/user-form"
import { Mail } from "lucide-react"

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
})

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      terms: false,
    },
  })

  const onSubmit = async (data: SignupFormValues) => {
    try {
      setEmail(data.email)
      setStep(2)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to proceed. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleOTPVerified = () => {
    setStep(3)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-24">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <Image
              src="https://www.befiler.com/dashboard/assets/images/logo.png"
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

              <div className="flex items-start space-x-2">
                <Checkbox id="terms" {...register("terms")} />
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
                {isSubmitting ? "Creating account..." : "Continue with Email"}
              </Button>
            </form>
          )}

          {step === 2 && <OTPForm email={email} onOTPVerified={handleOTPVerified} />}

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
