/**
 * DataContest API Service
 * Ref: docs/api/data-contest.json
 * Endpoint: /v1/data_contest
 */

import { apiClient, type ApiResponse } from "@/lib/api/api-client";
import type {
  DataContestDetail,
  DataContestItem,
  DataContestPayload,
  PaginatedData,
  PaginationQueryParams,
} from "@/types/api";

export const contestService = {
  /**
   * Mengambil semua daftar lomba (tanpa pagination)
   */
  async getAll(): Promise<ApiResponse<DataContestItem[]>> {
    return apiClient.get<DataContestItem[]>("/v1/data_contest");
  },

  /**
   * Mengambil lomba dengan pagination & pencarian
   */
  async getPagination(params?: PaginationQueryParams): Promise<ApiResponse<PaginatedData<DataContestItem>>> {
    return apiClient.get<PaginatedData<DataContestItem>>("/v1/data_contest", {
      queryParams: params,
    });
  },

  /**
   * Mengambil detail lomba berdasarkan ID (termasuk scorer)
   */
  async getDetail(id: number | string): Promise<ApiResponse<DataContestDetail>> {
    return apiClient.get<DataContestDetail>(`/v1/data_contest/${id}`);
  },

  /**
   * Membuat lomba baru (termasuk scorer & kasus)
   */
  async create(payload: DataContestPayload): Promise<ApiResponse<{ status: boolean; message: string }>> {
    return apiClient.post("/v1/data_contest", payload);
  },

  /**
   * Mengubah data lomba
   */
  async update(
    id: number | string,
    payload: Partial<DataContestPayload>,
  ): Promise<ApiResponse<{ status: boolean; message: string }>> {
    return apiClient.put(`/v1/data_contest/${id}`, payload);
  },

  /**
   * Menghapus lomba (DELETE method)
   */
  async delete(id: number | string): Promise<ApiResponse<{ status: boolean; message: string }>> {
    return apiClient.delete(`/v1/data_contest/${id}`);
  },
};
