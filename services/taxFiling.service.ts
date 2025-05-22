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
  userId: string;
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
  async create(userId: string, data: CreateTaxFilingDto): Promise<ITaxFiling> {
    return this.post<ITaxFiling>("/", { ...data, userId });
  }

  // Get tax filings for a specific user
  async getByUser(userId: string): Promise<ITaxFiling[]> {
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
  async updateStatus(id: string, data: UpdateFilingStatusDto, userId: string): Promise<ITaxFiling> {
    return this.put<ITaxFiling>(`/${id}/status`, { ...data, userId });
  }

  // Get tax filing history
  async getHistory(id: string): Promise<ITaxFiling['history']> {
    const filing = await this.get<ITaxFiling>(`/${id}/history`);
    return filing.history;
  }
}