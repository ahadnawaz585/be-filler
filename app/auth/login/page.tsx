"use client"
import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Lock, Mail } from "lucide-react"
import AuthService from "@/auth/auth.service"
import { LocalStorage } from "@/services/localStorage/localStorage"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { toast } = useToast()
  const router = useRouter()
  const authService = new AuthService()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  // Check if user is already logged in
  useEffect(() => {
    // If user is already logged in, redirect to appropriate dashboard
    // if (authService.isLoggedIn()) {
    //   const userData: any = authService.getUserData()
    // redirectToDashboard(userData?.role)
    //   return
    // }

    // Check for saved email if "remember me" was enabled
    if (authService.isRememberMeEnabled()) {
      const savedEmail = LocalStorage.getItem<string>("saved_email", false)
      if (savedEmail) {
        setValue("email", savedEmail)
        setValue("rememberMe", true)
      }
    }
  }, [])

  const onSubmit = async (data: LoginFormValues) => {
    try {
      // Save email for "remember me" functionality
      if (data.rememberMe) {
        LocalStorage.setItem("saved_email", data.email)
      } else {
        LocalStorage.removeItem("saved_email")
      }

      const result = await authService.login(data)

      if (result.success && result.token) {
        toast({
          title: "Login Successful",
          description: "Welcome back! Redirecting to dashboard...",
          variant: "default",
        })

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          redirectToDashboard(result.user?.role)
        }, 1500)
      } else {
        toast({
          title: "Login Failed",
          description: result.message || "Invalid email or password",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Function to handle redirects based on user role
  const redirectToDashboard = (role?: string) => {
    if (role === "admin") {
      window.location.href = "/dashboard/admin"
    } else if (role === "accountant") {
      router.push("/dashboard/accountant")
    } else {
      router.push("/dashboard")
    }
  }

  // Mock login function for demonstration
  const handleDemoLogin = (role: string) => {
    let email = ""

    switch (role) {
      case "user":
        email = "user@example.com"
        break
      case "admin":
        email = "admin@example.com"
        break
      case "accountant":
        email = "accountant@example.com"
        break
    }

    // Call onSubmit with demo credentials
    onSubmit({
      email,
      password: "password123",
      rememberMe: false,
    })
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
          <h1 className="text-2xl font-bold">Sign in to your account</h1>
          <p className="text-sm text-muted-foreground">Enter your email and password to access your account</p>
        </div>

        <div className="bg-card rounded-lg shadow-md p-6 border">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" placeholder="you@example.com" type="email" {...register("email")} className="pl-10" />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/auth/forgot-password" className="text-xs text-[#af0e0e] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="pl-10"
                />
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="rememberMe" {...register("rememberMe")} />
              <Label htmlFor="rememberMe" className="text-sm">
                Remember me for 30 days
              </Label>
            </div>

            <Button type="submit" className="w-full bg-[#af0e0e] hover:bg-[#8a0b0b]" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <Button variant="outline" type="button" onClick={() => handleDemoLogin("user")}>
                Demo Login as User
              </Button>
              <Button variant="outline" type="button" onClick={() => handleDemoLogin("admin")}>
                Demo Login as Admin
              </Button>
              <Button variant="outline" type="button" onClick={() => handleDemoLogin("accountant")}>
                Demo Login as Accountant
              </Button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-[#af0e0e] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
