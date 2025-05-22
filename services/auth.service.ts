import { axiosInstance } from "@/lib/ApiClient";
import { BaseService } from "./base.service";

// Define interface for the login response
interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role?: string;
  };
}

export class AuthService extends BaseService {
  constructor() {
    super(axiosInstance, `/api/v1/auth`);
  }

  // Handle user login
  async login(email: string, password: string): Promise<LoginResponse> {
    console.log(this.client.defaults.baseURL)
    console.log("Logging in with email:", email);
    return this.post<LoginResponse>("/login", { email, password });
  }
}