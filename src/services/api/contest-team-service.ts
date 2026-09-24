/**
 * DataContestTeam API Service
 * Ref: docs/api/data-contest-team.json
 * Endpoint: /v1/data_contest_team
 */

import { apiClient, type ApiResponse } from "@/lib/api/api-client";
import type {
  DataContestTeamDetail,
  DataContestTeamItem,
  DataContestTeamPayload,
  PaginatedData,
  PaginationQueryParams,
} from "@/types/api";

export const contestTeamService = {
  /**
   * Mengambil semua tim dalam sebuah lomba
   */
  async getAll(contestId: number | string): Promise<ApiResponse<DataContestTeamItem[]>> {
    return apiClient.get<DataContestTeamItem[]>("/v1/data_contest_team", {
      queryParams: { contest_id: contestId },
    });
  },

  /**
   * Mengambil tim dengan pagination & pencarian
   */
  async getPagination(
    contestId: number | string,
    params?: PaginationQueryParams,
  ): Promise<ApiResponse<PaginatedData<DataContestTeamItem>>> {
    return apiClient.get<PaginatedData<DataContestTeamItem>>("/v1/data_contest_team", {
      queryParams: { contest_id: contestId, ...params },
    });
  },

  /**
   * Mengambil detail tim (termasuk daftar anggota)
   */
  async getDetail(id: number | string): Promise<ApiResponse<DataContestTeamDetail>> {
    return apiClient.get<DataContestTeamDetail>(`/v1/data_contest_team/${id}`);
  },

  /**
   * Membuat tim baru beserta anggota
   */
  async create(payload: DataContestTeamPayload): Promise<ApiResponse<{ status: boolean; message: string }>> {
    return apiClient.post("/v1/data_contest_team", payload);
  },

  /**
   * Mengubah tim beserta anggota
   */
  async update(
    id: number | string,
    payload: DataContestTeamPayload,
  ): Promise<ApiResponse<{ status: boolean; message: string }>> {
    return apiClient.put(`/v1/data_contest_team/${id}`, payload);
  },

  /**
   * Menghapus tim (DELETE method)
   */
  async destroy(id: number | string): Promise<ApiResponse<{ status: boolean; message: string }>> {
    return apiClient.delete(`/v1/data_contest_team/${id}`);
  },
};
