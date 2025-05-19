import { environment } from "@/environment/environment";
import { TaxFiling } from "@/types/taxFiling";
import { BaseService } from "./base.service";
import { axiosInstance } from "@/lib/ApiClient";

class TaxFilingService extends BaseService {
    constructor() {
        super(axiosInstance, environment.apiUrl + "/secure/taxFiling");
    }
    async getMyTaxFilings(userId: string): Promise<TaxFiling[]> {
        return this.get<TaxFiling[]>('/my');
    }
    async createTaxFiling(data: Partial<TaxFiling>): Promise<TaxFiling> {
        return this.post<TaxFiling>('/', data);
    }
    async getAllFilings(): Promise<TaxFiling[]> {
        return this.get<TaxFiling[]>('/');
    }
    async getTaxFilingById(id: string): Promise<TaxFiling> {
        return this.get<TaxFiling>(`/${id}`);
    }
    async updateTaxFiling(id: string, data: Partial<TaxFiling>): Promise<TaxFiling> {
        return this.put<TaxFiling>(`/${id}/status`, data);
    }
    async getFilingHistory(id: string): Promise<TaxFiling[]> {
        return this.get<TaxFiling[]>(`/${id}/history`);
    }
}