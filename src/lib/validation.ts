export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export interface PasswordStrength {
  score: number // 0-4
  feedback: string[]
}

export function getPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push("Use at least 8 characters")
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push("Add uppercase letters")
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push("Add lowercase letters")
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push("Add numbers")
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1
  } else {
    feedback.push("Add special characters (!@#$%^&*)")
  }

  // Bonus for length
  if (password.length >= 12) {
    score = Math.min(score + 1, 4)
  }

  return { score: Math.min(score, 4), feedback }
}
