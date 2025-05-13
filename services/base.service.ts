import { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";

export class BaseService {
  protected client: AxiosInstance;
  protected loading: boolean;

  constructor(client: AxiosInstance, baseURL: string = "") {
    this.loading = false;
    this.client = client;
    this.client.defaults.baseURL = baseURL;

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        this.loading = true;
        return config;
      },
      (error) => {
        this.loading = false;
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        this.loading = false;
        return response;
      },
      (error) => {
        this.loading = false;
        return Promise.reject(error);
      }
    );
  }

  protected async get<T>(url: string, config?: InternalAxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  protected async post<T>(
    url: string,
    data?: any,
    config?: InternalAxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  protected async put<T>(
    url: string,
    data?: any,
    config?: InternalAxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  protected async patch<T>(
    url: string,
    data?: any,
    config?: InternalAxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  protected async delete<T>(url: string, config?: InternalAxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}