import { axiosInstance } from "@/lib/ApiClient"; // Adjust path to ApiClient.ts
import { BaseService } from "./base.service";// Adjust path to BaseService.ts

interface Order {
  id: number;
  userId: number;
  total: number;
  status: string;
}

export class OrderService extends BaseService {
  constructor() {
    // Pass the axiosInstance and a baseURL for orders
    super(axiosInstance, "/api/v1/orders");
  }

  // Get an order by ID
  async getOrderById(id: number): Promise<Order> {
    return this.get<Order>(`/${id}`);
  }

  // Create a new order
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    return this.post<Order>("/", orderData);
  }

  // Update an order
  async updateOrder(id: number, orderData: Partial<Order>): Promise<Order> {
    return this.patch<Order>(`/${id}`, orderData);
  }

  // Cancel (delete) an order
  async cancelOrder(id: number): Promise<void> {
    return this.delete<void>(`/${id}`);
  }
}