import { LocalStorage } from "@/services/localStorage/localStorage"

// Define types for authentication
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthResponse {
  token?: string
  user?: {
    id: string
    email: string
    name: string
    role: string
  }
  message?: string
  success: boolean
}

// Constants for storage keys
const AUTH_TOKEN_KEY = "auth_token"
const USER_DATA_KEY = "user_data"
const REMEMBER_ME_KEY = "remember_me"

class AuthService {
  /**
   * Login user and store authentication data
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // This would be your actual API call
      // For now, we'll simulate a successful response
      const response = await this.mockLoginApi(credentials.email, credentials.password)

      if (response.success && response.token) {
        // Store authentication data based on rememberMe preference
        this.storeAuthData(response, !!credentials.rememberMe)
      }

      return response
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        message: "An error occurred during login",
      }
    }
  }

  /**
   * Store authentication data in localStorage
   */
  private storeAuthData(authData: AuthResponse, rememberMe: boolean): void {
    // Store token and user data
    LocalStorage.setItem(AUTH_TOKEN_KEY, authData.token)
    LocalStorage.setItem(USER_DATA_KEY, authData.user)

    // Store remember me preference
    LocalStorage.setItem(REMEMBER_ME_KEY, rememberMe)
  }

  /**
   * Get the stored authentication token
   */
  getToken(): string | null {
    return LocalStorage.getItem<string>(AUTH_TOKEN_KEY, false)
  }

  /**
   * Get the stored user data
   */
  getUserData() {
    return LocalStorage.getItem(USER_DATA_KEY, true)
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return !!this.getToken()
  }

  /**
   * Check if "remember me" is enabled
   */
  isRememberMeEnabled(): boolean {
    return LocalStorage.getItem<boolean>(REMEMBER_ME_KEY, true) === true
  }

  /**
   * Logout user and clear authentication data
   */
  logout(): void {
    LocalStorage.removeItem(AUTH_TOKEN_KEY)
    LocalStorage.removeItem(USER_DATA_KEY)

    // Optionally keep the remember me preference
    // LocalStorage.removeItem(REMEMBER_ME_KEY);
  }

  /**
   * Mock API call for demonstration purposes
   * In a real application, this would be an actual API call
   */
  private async mockLoginApi(email: string, password: string): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Demo users for testing
    const users = {
      "user@example.com": { role: "user", name: "Demo User" },
      "admin@example.com": { role: "admin", name: "Admin User" },
      "accountant@example.com": { role: "accountant", name: "Accountant User" },
    }

    // Check if email exists and password is correct
    if (users[email as keyof typeof users] && password) {
      const userData = users[email as keyof typeof users]
      return {
        success: true,
        token: `mock-jwt-token-${Date.now()}`,
        user: {
          id: `user-${Date.now()}`,
          email,
          name: userData.name,
          role: userData.role,
        },
      }
    }

    return {
      success: false,
      message: "Invalid email or password",
    }
  }
}

export default AuthService
