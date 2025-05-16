import { axiosInstance } from "@/lib/ApiClient";
import { BaseService } from "./base.service";
//importing from the server file 
import {  CreateDocumentDto, UpdateDocumentDto, UpdateStatusDto } from "../../Server/src/modules/document/dto/document.dto";

// Define interface for the document data structure
interface Document {
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
    super(axiosInstance, "/api/v1/documents");
  }

  // Create a new document
  async create(userId: string, data: CreateDocumentDto & { fileUrl: string }): Promise<Document> {
    return this.post<Document>("/", { ...data, userId });
  }

  // Get all documents
  async getAll(): Promise<Document[]> {
    return this.get<Document[]>("/");
  }

  // Get review logs for a document
  async getReviewLogs(id: string): Promise<Document> {
    return this.get<Document>(`/${id}/logs`);
  }

  // Get documents by user ID
  async getByUser(userId: string): Promise<Document[]> {
    return this.get<Document[]>(`/my-documents?userId=${userId}`);
  }

  // Get document by ID
  async getById(id: string): Promise<Document> {
    return this.get<Document>(`/${id}`);
  }

  // Update document status
  async updateStatus(id: string, status: string, notes?: string, reviewerId?: string): Promise<Document> {
    return this.put<Document>(`/${id}/status`, { status, notes, reviewerId });
  }

  // Update document details
  async updateDocument(id: string, data: UpdateDocumentDto): Promise<Document> {
    return this.put<Document>(`/${id}`, data);
  }

  // Delete document by ID
  async deleteDocument(id: string): Promise<void> {
    return this.delete<void>(`/${id}`);
  }
}