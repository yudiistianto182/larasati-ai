/**
 * SysConfig API Service
 */

import { apiClient, type ApiResponse } from "@/lib/api/api-client";
import type { SysConfigDetail, SysConfigDropdownItem } from "@/types/api";

export const configService = {
  /**
   * Mengambil list seluruh API config keys (GEMINI_API_KEY, SIMLI_API_KEY, dll)
   */
  async getConfigsDropdown(): Promise<ApiResponse<SysConfigDropdownItem[]>> {
    return apiClient.get<SysConfigDropdownItem[]>("/v1/sys_config", {
      queryParams: { dropdown: 1 },
    });
  },

  /**
   * Mengambil detail config spesifik berdasarkan key name
   */
  async getConfigDetail(key: string): Promise<ApiResponse<SysConfigDetail>> {
    return apiClient.get<SysConfigDetail>(`/v1/sys_config/${encodeURIComponent(key)}`);
  },
};
