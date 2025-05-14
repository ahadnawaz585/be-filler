import { axiosInstance } from "@/lib/ApiClient"; // Adjust path to ApiClient.ts
import { BaseService } from "./base.service";// Adjust path to BaseService.ts
import { environment } from "@/environment/environment";
import { User } from "@/types/users"; // Adjust path to your User type


export class UserService extends BaseService {
  constructor() {
    // Pass the axiosInstance and a baseURL for orders
    super(axiosInstance, environment.apiUrl + "/secure/users");
  }

  // Get an user by ID
  async getUserById(id: number): Promise<User> {
    return this.get<User>(`/${id}`);
  }

  async getAllUsers(): Promise<User[]> {
    return this.get<User[]>("/");
  }

  // Create a new order
  async registerUser(userData: Partial<User>): Promise<User> {
    return this.post<User>("/", userData);
  }

  // Update an order
  async updateOrder(id: number, userData: Partial<User>): Promise<User> {
    return this.put<User>(`/${id}`, userData);
  }

  // // Cancel (delete) an order
  async deleteUser(id: number): Promise<void> {
    return this.delete<void>(`/${id}`);
  }
}