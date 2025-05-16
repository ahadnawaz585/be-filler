import { axiosInstance } from "@/lib/ApiClient";
import { BaseService } from "./base.service";
//importing from the server file 
import { CreateContentDto, UpdateContentDto } from "../../Server/src/modules/content/dto/content.dto";

// Define interface for the content data structure
interface Content {
  id: string;
  title: string;
  body: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

// Define interface for query parameters for getAllContent
interface ContentQueryParams {
  [key: string]: string | number | undefined;
}

export class ContentService extends BaseService {
  constructor() {
    super(axiosInstance, "/api/v1/content");
  }

  // Get all content with optional query filters
  async getAllContent(query?: ContentQueryParams): Promise<Content[]> {
    const queryString = query
      ? `?${Object.entries(query)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
          .join("&")}`
      : "";
    return this.get<Content[]>(`/${queryString}`);
  }

  // Get content by ID
  async getContentById(id: string): Promise<Content> {
    return this.get<Content>(`/${id}`);
  }

  // Create new content
  async createContent(data: CreateContentDto): Promise<Content> {
    return this.post<Content>("/", data);
  }

  // Update existing content
  async updateContent(id: string, data: UpdateContentDto): Promise<Content> {
    return this.put<Content>(`/${id}`, data);
  }

  // Delete content by ID
  async deleteContent(id: string): Promise<void> {
    return this.delete<void>(`/${id}`);
  }
}