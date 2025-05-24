import { axiosInstance } from "@/lib/ApiClient";
import { BaseService } from "./base.service";

export interface CreateTaxFilingDto {
  taxYear: number;
  filingType: 'individual' | 'business';
  grossIncome: number;
  taxPaid: number;
  documents: string[];
}

export interface UpdateFilingStatusDto {
  status: 'under_review' | 'completed' | 'rejected';
  remarks?: string;
  assignedTo?: string;
}

// Define interface for the tax filing data structure
export interface ITaxFiling {
  id: string;
  user: string;
  taxYear: number;
  filingType: 'individual' | 'business';
  grossIncome: number;
  taxPaid: number;
  documents: string[];
  status: 'under_review' | 'completed' | 'rejected';
  assignedTo?: string;
  history: Array<{
    status: 'under_review' | 'completed' | 'rejected';
    updatedBy: string;
    updatedAt: string;
    remarks?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export class TaxFilingService extends BaseService {
  constructor() {
    super(axiosInstance, "/api/v1/secure/taxFiling");
  }

  // Create a new tax filing
  async create(userId: string, data: any): Promise<ITaxFiling> {
    console.log("Creating tax filing with data:", data);
    return this.post<ITaxFiling>("/", { ...data, userId });
  }
  async createAcc(userId: string, data: CreateTaxFilingDto): Promise<ITaxFiling> {
    return this.post<ITaxFiling>("/create-acc", { ...data, userId });
  }

  // Get tax filings for a specific user
  async getByUser(userId: string): Promise<ITaxFiling[]> {
    console.log("Fetching tax filings for user ID:", userId);
    return this.get<ITaxFiling[]>(`/my?userId=${userId}`);
  }

  // Get all tax filings
  async getAll(): Promise<ITaxFiling[]> {
    return this.get<ITaxFiling[]>("/");
  }

  // Get tax filing by ID
  async getById(id: string): Promise<ITaxFiling> {
    return this.get<ITaxFiling>(`/${id}`);
  }

  // Update tax filing status
  async updateStatus(id: string, data: UpdateFilingStatusDto): Promise<ITaxFiling> {
    console.log("Updating tax filing status:", { id, data });
    return this.put<ITaxFiling>(`/${id}/status`, { data });
  }

  // Get tax filing history
  async getHistory(id: string): Promise<ITaxFiling['history']> {
    const filing = await this.get<ITaxFiling>(`/${id}/history`);
    return filing.history;
  }
}