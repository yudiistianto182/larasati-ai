/**
 * DataCase API Service
 */

import { apiClient, type ApiResponse } from "@/lib/api/api-client";
import type { DataCaseDetail, DataCaseItem, DataCasePayload, PaginatedData, PaginationQueryParams } from "@/types/api";

export const caseService = {
  /**
   * Mengambil semua daftar kasus
   */
  async getAll(): Promise<ApiResponse<DataCaseItem[]>> {
    return apiClient.get<DataCaseItem[]>("/v1/data_case");
  },

  /**
   * Mengambil kasus dengan pagination & pencarian
   */
  async getPagination(params?: PaginationQueryParams): Promise<ApiResponse<PaginatedData<DataCaseItem>>> {
    return apiClient.get<PaginatedData<DataCaseItem>>("/v1/data_case", {
      queryParams: params,
    });
  },

  /**
   * Mengambil detail lengkap kasus beserta atribut, quest stase, dan trigger
   */
  async getDetail(id: number | string): Promise<ApiResponse<DataCaseDetail>> {
    return apiClient.get<DataCaseDetail>(`/v1/data_case/${id}`);
  },

  /**
   * Menyimpan kasus baru (mendukung FormData atau JSON DataCasePayload)
   */
  async create(payload: DataCasePayload | FormData): Promise<ApiResponse<{ status: boolean; message: string }>> {
    return apiClient.post("/v1/data_case", payload);
  },

  /**
   * Mengupdate data kasus (mendukung FormData atau JSON DataCasePayload)
   */
  async update(id: number | string, payload: Partial<DataCasePayload> | FormData): Promise<ApiResponse<{ status: boolean; message: string }>> {
    return apiClient.put(`/v1/data_case/${id}`, payload);
  },

  /**
   * Menghapus kasus
   */
  async delete(id: number | string): Promise<ApiResponse<{ status: boolean; message: string }>> {
    return apiClient.delete(`/v1/data_case/${id}`);
  },
};
