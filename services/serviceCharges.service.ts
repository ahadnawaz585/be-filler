import { axiosInstance } from "@/lib/ApiClient"; // Adjust path to ApiClient.ts
import { BaseService } from "./base.service";// Adjust path to BaseService.ts
import { environment } from "@/environment/environment";
import { ServiceCharge } from "@/types/serviceCharges";


export default class ServiceChargesService extends BaseService {
    constructor() {
        super(axiosInstance, environment.apiUrl + "/secure/serviceCharges");
    }

    async getServiceChargeById(id: string): Promise<ServiceCharge> {
        return this.get<ServiceCharge>(`/${id}`)
    }

    // Get all service charges
    async getAllServiceCharges(): Promise<ServiceCharge[]> {
        return this.get<ServiceCharge[]>("/");
    }

    // Create a new service charge
    async createServiceCharges(data: Partial<ServiceCharge>): Promise<ServiceCharge> {
        return this.post<ServiceCharge>("/", data);
    }

    // Update a service charge
    async updateServiceCharge(id: string, data: Partial<ServiceCharge>): Promise<ServiceCharge> {
        return this.put<ServiceCharge>(`/${id}`, data);
    }

    // Delete a service charge
    async deleteServiceCharge(id: string): Promise<void> {
        return this.delete<void>(`/${id}`);
    }
}