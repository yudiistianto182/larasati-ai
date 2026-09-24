/**
 * SysRole API Service
 */

import { apiClient, type ApiResponse } from "@/lib/api/api-client";
import type { DropdownOption, SysRoleItem } from "@/types/api";

export const roleService = {
  /**
   * Mengambil seluruh master role
   */
  async getAll(): Promise<ApiResponse<SysRoleItem[]>> {
    return apiClient.get<SysRoleItem[]>("/v1/sys_role");
  },

  /**
   * Mengambil list master role untuk dropdown (Root, Administrator, Reporter, Juri, Peserta)
   */
  async getDropdown(): Promise<ApiResponse<DropdownOption<number>[]>> {
    return apiClient.get<DropdownOption<number>[]>("/v1/sys_role", {
      queryParams: { dropdown: 1 },
    });
  },
};
