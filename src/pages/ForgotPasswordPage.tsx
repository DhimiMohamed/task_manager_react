// src/pages/ForgotPasswordPage.tsx
import type React from "react"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { validateEmail, getPasswordStrength, type PasswordStrength } from "@/lib/validation"
import { ArrowLeft, CheckCircle, Mail, Shield, Key, PartyPopper } from "lucide-react"
import { AccountsApi } from "@/api/apis/accounts-api"
import type { AccountsPasswordResetRequestCreateRequest } from "@/api/models/accounts-password-reset-request-create-request"
import type { AccountsPasswordResetVerifyOtpCreateRequest } from "@/api/models/accounts-password-reset-verify-otp-create-request"
import type { AccountsPasswordResetResetPasswordCreateRequest } from "@/api/models/accounts-password-reset-reset-password-create-request"

type Step = "email" | "verification" | "code" | "password" | "success"

// Initialize API instance - adjust this based on your API configuration setup
const accountsApi = new AccountsApi()

export default function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
  })


  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Clear any previous errors
    setErrors({})

    if (!email) {
      setErrors({ email: "Email is required" })
      setIsLoading(false)
      return
    }

    if (!validateEmail(email)) {
      setErrors({ email: "Please enter a valid email address" })
      setIsLoading(false)
      return
    }

    try {
      // Create the request data
      const requestData: AccountsPasswordResetRequestCreateRequest = {
        email: email
      }

      // Call the API
      await accountsApi.accountsPasswordResetRequestCreate(requestData)


      
      // Clear errors and proceed to next step
      setErrors({})
      setCurrentStep("verification")
    } catch (error: any) {
      // Handle API errors
      if (error.response?.status === 400) {
        setErrors({ email: "Please enter a valid email address" })
      } else if (error.response?.status === 404) {
        setErrors({ email: "No account found with this email address" })
      } else if (error.response?.status === 429) {
        setErrors({ email: "Too many requests. Please try again later." })
      } else {
        setErrors({ email: "An error occurred. Please try again." })
      }
      console.error("Password reset request failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Clear any previous errors
    setErrors({})

    if (!verificationCode) {
      setErrors({ code: "Verification code is required" })
      setIsLoading(false)
      return
    }

    if (verificationCode.length !== 6) {
      setErrors({ code: "Please enter a 6-digit verification code" })
      setIsLoading(false)
      return
    }

    try {
      // Create the request data
      const requestData: AccountsPasswordResetVerifyOtpCreateRequest = {
        email: email,
        otp: verificationCode
      }

      // Call the API to verify OTP
      await accountsApi.accountsPasswordResetVerifyOtpCreate(requestData)

      // Clear errors and proceed to next step
      setErrors({})
      setCurrentStep("password")
    } catch (error: any) {
      // Handle API errors
      if (error.response?.status === 400) {
        setErrors({ code: "Invalid verification code. Please check and try again." })
      } else if (error.response?.status === 404) {
        setErrors({ code: "Verification code not found or expired. Please request a new code." })
      } else if (error.response?.status === 410) {
        setErrors({ code: "Verification code has expired. Please request a new code." })
      } else if (error.response?.status === 429) {
        setErrors({ code: "Too many attempts. Please try again later." })
      } else {
        setErrors({ code: "An error occurred. Please try again." })
      }
      console.error("OTP verification failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const newErrors: Record<string, string> = {}

    // Validate new password
    if (!newPassword) {
      newErrors.password = "New password is required"
    } else if (passwordStrength.score < 3) {
      newErrors.password = "Password is too weak. Please choose a stronger password."
    }

    // Validate password confirmation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password"
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      try {
        // Create the request data
        const requestData: AccountsPasswordResetResetPasswordCreateRequest = {
          email: email,
          otp: verificationCode,
          new_password: newPassword
        }

        // Call the API to reset password
        await accountsApi.accountsPasswordResetResetPasswordCreate(requestData)

        // Clear errors and proceed to success step
        setErrors({})
        setCurrentStep("success")
      } catch (error: any) {
        // Handle API errors
        if (error.response?.status === 400) {
          const errorMessage = error.response?.data?.message || "Invalid request. Please check your information and try again."
          setErrors({ password: errorMessage })
        } else if (error.response?.status === 404) {
          setErrors({ password: "Verification code not found or expired. Please start the process again." })
        } else if (error.response?.status === 410) {
          setErrors({ password: "Verification code has expired. Please request a new code." })
        } else if (error.response?.status === 422) {
          // Handle validation errors from server
          const errorMessage = error.response?.data?.message || "Password does not meet requirements."
          setErrors({ password: errorMessage })
        } else if (error.response?.status === 429) {
          setErrors({ password: "Too many attempts. Please try again later." })
        } else {
          setErrors({ password: "An error occurred while resetting your password. Please try again." })
        }
        console.error("Password reset failed:", error)
      }
    }
    
    setIsLoading(false)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewPassword(value)
    setPasswordStrength(getPasswordStrength(value))

    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: "" }))
    }
  }

  const getStepIcon = (step: Step) => {
    switch (step) {
      case "email":
      case "verification":
        return <Mail className="h-6 w-6" />
      case "code":
        return <Shield className="h-6 w-6" />
      case "password":
        return <Key className="h-6 w-6" />
      case "success":
        return <PartyPopper className="h-6 w-6" />
    }
  }

  const getStepTitle = (step: Step) => {
    switch (step) {
      case "email":
        return "Reset your password"
      case "verification":
        return "Check your email"
      case "code":
        return "Enter verification code"
      case "password":
        return "Create new password"
      case "success":
        return "Password reset successful"
    }
  }

  const getStepDescription = (step: Step) => {
    switch (step) {
      case "email":
        return "Enter your email address and we'll send you a verification code"
      case "verification":
        return "We've sent a verification code to your email address"
      case "code":
        return "Enter the 6-digit code we sent to your email"
      case "password":
        return "Choose a strong new password for your account"
      case "success":
        return "Your password has been successfully reset"
    }
  }

  // Handle resend functionality
  const handleResendCode = async () => {
    await handleEmailSubmit(new Event('submit') as any)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">{getStepIcon(currentStep)}</div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">{getStepTitle(currentStep)}</CardTitle>
          <CardDescription className="text-center">{getStepDescription(currentStep)}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors({})
                  }}
                  placeholder="Enter your email address"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.email}</AlertDescription>
                  </Alert>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send verification code"}
              </Button>
            </form>
          )}

          {currentStep === "verification" && (
            <div className="space-y-4">
              <div className="text-center space-y-4">
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    We've sent a 6-digit verification code to <strong>{email}</strong>

                  </AlertDescription>
                </Alert>
              </div>

              <Button onClick={() => setCurrentStep("code")} className="w-full">
                I received the code
              </Button>

              <Button
                variant="outline"
                onClick={handleResendCode}
                className="w-full bg-transparent"
                disabled={isLoading}
              >
                {isLoading ? "Resending..." : "Resend code"}
              </Button>
            </div>
          )}

          {currentStep === "code" && (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification code</Label>
                <Input
                  id="code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    if (errors.code) setErrors({})
                  }}
                  placeholder="Enter 6-digit code"
                  className={`text-center text-lg tracking-widest ${errors.code ? "border-red-500" : ""}`}
                  maxLength={6}
                />
                {errors.code && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.code}</AlertDescription>
                  </Alert>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify code"}
              </Button>
            </form>
          )}

          {currentStep === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your new password"
                  className={errors.password ? "border-red-500" : ""}
                />

                {newPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Password strength:</span>
                      <span
                        className={`font-medium ${
                          passwordStrength.score < 2
                            ? "text-red-500"
                            : passwordStrength.score < 3
                              ? "text-yellow-500"
                              : passwordStrength.score < 4
                                ? "text-blue-500"
                                : "text-green-500"
                        }`}
                      >
                        {passwordStrength.score < 2
                          ? "Weak"
                          : passwordStrength.score < 3
                            ? "Fair"
                            : passwordStrength.score < 4
                              ? "Good"
                              : "Strong"}
                      </span>
                    </div>
                    <Progress value={(passwordStrength.score / 4) * 100} className="h-2" />
                  </div>
                )}

                {errors.password && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.password}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (errors.confirmPassword) {
                      setErrors((prev) => ({ ...prev, confirmPassword: "" }))
                    }
                  }}
                  placeholder="Confirm your new password"
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {confirmPassword && newPassword === confirmPassword && (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Passwords match
                  </div>
                )}
                {errors.confirmPassword && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.confirmPassword}</AlertDescription>
                  </Alert>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Updating password..." : "Update password"}
              </Button>
            </form>
          )}

          {currentStep === "success" && (
            <div className="space-y-4 text-center">
              <div className="p-6 bg-green-50 rounded-lg">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">Password Reset Complete!</h3>
                <p className="text-green-700">
                  Your password has been successfully updated. You can now sign in with your new password.
                </p>
              </div>

              <Button asChild className="w-full">
                <Link to="/login">Sign in to your account</Link>
              </Button>
            </div>
          )}

          {currentStep !== "success" && currentStep !== "email" && (
            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => {
                  if (currentStep === "verification") setCurrentStep("email")
                  if (currentStep === "code") setCurrentStep("verification")
                  if (currentStep === "password") setCurrentStep("code")
                }}
                className="text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go back
              </Button>
            </div>
          )}

          {currentStep === "email" && (
            <div className="mt-6 text-center">
              <Link to="/signin" className="text-sm text-blue-600 hover:text-blue-500">
                <ArrowLeft className="h-4 w-4 inline mr-1" />
                Back to sign in
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}