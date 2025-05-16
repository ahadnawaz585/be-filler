import { axiosInstance } from "@/lib/ApiClient";
import { BaseService } from "./base.service";
import { CreateServiceChargeDto, UpdateServiceChargeDto } from "../../Server/src/modules/serviceCharges/dto/serviceCharges.dto";

// Define interface for the service charge data structure
interface ServiceCharge {
  id: string;
  name: string;
  amount: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class ServiceChargesService extends BaseService {
  constructor() {
    super(axiosInstance, "/api/v1/service-charges");
  }

  // Get all service charges
  async getAllServiceCharges(): Promise<ServiceCharge[]> {
    return this.get<ServiceCharge[]>("/");
  }

  // Get service charge by ID
  async getServiceChargeById(id: string): Promise<ServiceCharge> {
    return this.get<ServiceCharge>(`/${id}`);
  }

  // Create a new service charge
  async createServiceCharge(data: CreateServiceChargeDto): Promise<ServiceCharge> {
    return this.post<ServiceCharge>("/", data);
  }

  // Update an existing service charge
  async updateServiceCharge(id: string, data: UpdateServiceChargeDto): Promise<ServiceCharge> {
    return this.put<ServiceCharge>(`/${id}`, data);
  }

  // Delete a service charge by ID
  async deleteServiceCharge(id: string): Promise<void> {
    return this.delete<void>(`/${id}`);
  }
}