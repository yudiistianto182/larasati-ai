/**
 * TrxResponse API Service
 * Ref: docs/api/trx-response.json
 * Endpoint: /v1/trx_response
 */

import { apiClient, type ApiResponse } from "@/lib/api/api-client";
import type {
  PaginatedData,
  PaginationQueryParams,
  TrxResponseItem,
  TrxResponsePayload,
  TrxResponseStoreResult,
} from "@/types/api";

export const trxResponseService = {
  /**
   * Mengambil semua status pengerjaan tim secara global / per lomba (Liveview)
   */
  async getAll(contestId?: number | string): Promise<ApiResponse<TrxResponseItem[]>> {
    return apiClient.get<TrxResponseItem[]>("/v1/trx_response", {
      queryParams: contestId ? { contest_id: String(contestId) } : undefined,
    });
  },

  /**
   * Mengambil response peserta dengan pagination & filter
   */
  async getPagination(
    params?: PaginationQueryParams & { contest_id?: number | string }
  ): Promise<ApiResponse<PaginatedData<TrxResponseItem>>> {
    return apiClient.get<PaginatedData<TrxResponseItem>>("/v1/trx_response", {
      queryParams: params as Record<string, string | number | boolean | null | undefined>,
    });
  },

  /**
   * Input / inisialisasi kasus dan pasien untuk tim (Store)
   */
  async store(payload: TrxResponsePayload): Promise<ApiResponse<TrxResponseStoreResult>> {
    return apiClient.post<TrxResponseStoreResult>("/v1/trx_response", {
      contest_id: String(payload.contest_id),
      contestteam_id: String(payload.contestteam_id),
      case_id: String(payload.case_id),
      patient_id: String(payload.patient_id),
    });
  },

  /**
   * Update data response tim
   */
  async update(
    id: number | string,
    payload: Partial<TrxResponsePayload>
  ): Promise<ApiResponse<{ status: boolean; message: string }>> {
    return apiClient.put(`/v1/trx_response/${id}`, payload);
  },

  /**
   * Hapus data response
   */
  async delete(id: number | string): Promise<ApiResponse<{ status: boolean; message: string }>> {
    return apiClient.delete(`/v1/trx_response/${id}`);
  },
};
