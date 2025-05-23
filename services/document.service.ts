import { axiosInstance } from "@/lib/ApiClient";
import { BaseService } from "./base.service";
//importing from the server file 


export interface CreateDocumentDto {
  name: string;
  type: 'NTN' | 'TaxReturn' | 'SalarySlip' | 'CNIC' | 'Other';
  fileUrl: string;
}

export interface UpdateStatusDto {
  status: 'approved' | 'rejected';
  notes?: string;
}

export interface UpdateDocumentDto {
  name?: string;
  type?: 'NTN' | 'TaxReturn' | 'SalarySlip' | 'CNIC' | 'Other';
}

// Define interface for the document data structure
export interface IDocument {
  id: string;
  name: string;
  type: string;
  fileUrl: string;
  user: string;
  status: string;
  notes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewLogs?: Array<{
    reviewedBy: string;
    status: string;
    notes?: string;
    reviewedAt: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export class DocumentService extends BaseService {
  constructor() {
    const documentAxiosInstance = axiosInstance.create();
    super(axiosInstance, "/api/v1/secure/document");
  }

  // Create a new document
  async create(data: CreateDocumentDto & { fileUrl: string }): Promise<IDocument> {
    return this.post<IDocument>("/", { ...data });
  }

  async createByAccountant(userId: string, data: CreateDocumentDto & { fileUrl: string }): Promise<IDocument> {
    return this.post<IDocument>("/post-docs", { ...data, userId });
  }

  async downloadDocument(filename: string): Promise<any> {
    return this.get<any>(`/download/${filename}`);
  }

  // Get all documents
  async getAll(): Promise<IDocument[]> {
    return this.get<IDocument[]>("/");
  }

  // Get review logs for a document
  async getReviewLogs(id: string): Promise<IDocument> {
    return this.get<IDocument>(`/${id}/logs`);
  }

  // Get documents by user ID
  async getByUser(userId: string): Promise<IDocument[]> {
    return this.get<IDocument[]>(`/user/${userId}`);
  }

  async viewDocument(filename: string): Promise<any> {
    return this.get<any>(`/view/${filename}`);
  }

  // Get document by ID
  async getById(id: string): Promise<IDocument> {
    return this.get<IDocument>(`/${id}`);
  }

  // Update document status
  async updateStatus(id: string, status: string, notes?: string, reviewerId?: string): Promise<IDocument> {
    console.log("Updating document status:", { id, status, notes, reviewerId });
    return this.put<IDocument>(`/${id}/status`, { status, notes });
  }

  // Update document details
  async updateDocument(id: string, data: UpdateDocumentDto): Promise<IDocument> {
    return this.put<IDocument>(`/${id}`, data);
  }

  // Delete document by ID
  async deleteDocument(id: string): Promise<void> {
    return this.delete<void>(`/${id}`);
  }
}