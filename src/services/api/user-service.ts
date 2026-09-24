/**
 * SysUser API Service
 */

import { apiClient, type ApiResponse } from "@/lib/api/api-client";
import type { PaginatedData, PaginationQueryParams, SysUserItem, SysUserStorePayload, SysUserUpdatePayload } from "@/types/api";

export const userService = {
  /**
   * Mengambil seluruh data pengguna
   */
  async getAll(): Promise<ApiResponse<SysUserItem[]>> {
    return apiClient.get<SysUserItem[]>("/v1/sys_user");
  },

  /**
   * Mengambil data pengguna dengan paginasi, pencarian, dan pengurutan
   */
  async getPagination(params?: PaginationQueryParams): Promise<ApiResponse<PaginatedData<SysUserItem>>> {
    return apiClient.get<PaginatedData<SysUserItem>>("/v1/sys_user", {
      queryParams: params,
    });
  },

  /**
   * Mendaftarkan pengguna baru
   */
  async create(payload: SysUserStorePayload): Promise<ApiResponse<{ status: boolean; message: string }>> {
    return apiClient.post("/v1/sys_user", {
      ...payload,
      user_role_id: String(payload.user_role_id),
      user_is_banned: payload.user_is_banned !== undefined ? String(payload.user_is_banned) : "0",
    });
  },

  /**
   * Mengubah data pengguna
   */
  async update(id: number | string, payload: SysUserUpdatePayload): Promise<ApiResponse<{ status: boolean; message: string }>> {
    const body: Record<string, any> = { ...payload };
    if (body.user_role_id !== undefined) {
      body.user_role_id = String(body.user_role_id);
    }
    if (body.user_is_banned !== undefined) {
      body.user_is_banned = String(body.user_is_banned);
    }
    return apiClient.put(`/v1/sys_user/${id}`, body);
  },

  /**
   * Menghapus pengguna
   */
  async delete(id: number | string): Promise<ApiResponse<{ status: boolean; message: string }>> {
    return apiClient.delete(`/v1/sys_user/${id}`);
  },
};
