import { axiosInstance } from "@/lib/ApiClient";
import { BaseService } from "./base.service";
import { CreateTaxFilingDto, UpdateFilingStatusDto } from "../../Server/src/modules/taxFiling/dto/taxFiling.dto";

// Define interface for the tax filing data structure
interface TaxFiling {
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
    super(axiosInstance, "/api/v1/tax-filings");
  }

  // Create a new tax filing
  async create(userId: string, data: CreateTaxFilingDto): Promise<TaxFiling> {
    return this.post<TaxFiling>("/", { ...data, userId });
  }

  // Get tax filings for a specific user
  async getByUser(userId: string): Promise<TaxFiling[]> {
    return this.get<TaxFiling[]>(`/my?userId=${userId}`);
  }

  // Get all tax filings
  async getAll(): Promise<TaxFiling[]> {
    return this.get<TaxFiling[]>("/");
  }

  // Get tax filing by ID
  async getById(id: string): Promise<TaxFiling> {
    return this.get<TaxFiling>(`/${id}`);
  }

  // Update tax filing status
  async updateStatus(id: string, data: UpdateFilingStatusDto, userId: string): Promise<TaxFiling> {
    return this.put<TaxFiling>(`/${id}/status`, { ...data, userId });
  }

  // Get tax filing history
  async getHistory(id: string): Promise<TaxFiling['history']> {
    const filing = await this.get<TaxFiling>(`/${id}/history`);
    return filing.history;
  }
}