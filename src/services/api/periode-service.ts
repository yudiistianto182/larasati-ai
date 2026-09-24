/**
 * MstPeriode API Service
 */

import { apiClient, type ApiResponse } from "@/lib/api/api-client";
import type { MstPeriodeItem, MstPeriodePayload, PaginatedData, PaginationQueryParams } from "@/types/api";

export const periodeService = {
  /**
   * Mengambil semua daftar periode lomba
   */
  async getAll(): Promise<ApiResponse<MstPeriodeItem[]>> {
    return apiClient.get<MstPeriodeItem[]>("/v1/mst_periode");
  },

  /**
   * Mengambil periode dengan pagination & search
   */
  async getPagination(params?: PaginationQueryParams): Promise<ApiResponse<PaginatedData<MstPeriodeItem>>> {
    return apiClient.get<PaginatedData<MstPeriodeItem>>("/v1/mst_periode", {
      queryParams: params,
    });
  },

  /**
   * Mengambil detail periode berdasarkan ID
   */
  async getDetail(id: number | string): Promise<ApiResponse<MstPeriodeItem>> {
    return apiClient.get<MstPeriodeItem>(`/v1/mst_periode/${id}`);
  },

  /**
   * Membuat periode baru
   */
  async create(payload: MstPeriodePayload): Promise<ApiResponse<{ status: boolean; message: string }>> {
    return apiClient.post("/v1/mst_periode", payload);
  },

  /**
   * Mengubah periode yang sudah ada
   */
  async update(id: number | string, payload: MstPeriodePayload): Promise<ApiResponse<{ status: boolean; message: string }>> {
    return apiClient.put(`/v1/mst_periode/${id}`, payload);
  },

  /**
   * Menghapus periode
   */
  async delete(id: number | string): Promise<ApiResponse<{ status: boolean; message: string }>> {
    return apiClient.delete(`/v1/mst_periode/${id}`);
  },
};
