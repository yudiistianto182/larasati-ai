/**
 * RefMethod API Service (Master 5 Pos & Metode Ujian)
 */

import { apiClient, type ApiResponse } from "@/lib/api/api-client";
import type { DropdownOption, PaginatedData, PaginationQueryParams, RefMethodDetail, RefMethodItem, RefMethodUpdatePayload } from "@/types/api";

export const methodService = {
  /**
   * Mengambil semua daftar metode stase
   */
  async getAll(): Promise<ApiResponse<RefMethodItem[]>> {
    return apiClient.get<RefMethodItem[]>("/v1/ref_method");
  },

  /**
   * Mengambil metode dengan pagination
   */
  async getPagination(params?: PaginationQueryParams): Promise<ApiResponse<PaginatedData<RefMethodItem>>> {
    return apiClient.get<PaginatedData<RefMethodItem>>("/v1/ref_method", {
      queryParams: params,
    });
  },

  /**
   * Mengambil list dropdown metode
   */
  async getDropdown(): Promise<ApiResponse<DropdownOption<number>[]>> {
    return apiClient.get<DropdownOption<number>[]>("/v1/ref_method", {
      queryParams: { dropdown: 1 },
    });
  },

  /**
   * Mengambil detail aturan dan langkah pos metode
   */
  async getDetail(id: number | string): Promise<ApiResponse<RefMethodDetail>> {
    return apiClient.get<RefMethodDetail>(`/v1/ref_method/${id}`);
  },

  /**
   * Mengubah aturan & skeleton langkah stase
   */
  async update(id: number | string, payload: RefMethodUpdatePayload): Promise<ApiResponse<{ status: boolean; message: string }>> {
    return apiClient.put(`/v1/ref_method/${id}`, payload);
  },
};
