/**
 * Auth API Service
 */

import { apiClient, type ApiResponse } from "@/lib/api/api-client";
import { removeAuthToken, setAuthToken, setAuthUser } from "@/lib/api/api-helper";
import type { LoginPayload, LoginResponseData, ProfileResponseData } from "@/types/api";

export const authService = {
  /**
   * Melakukan login user & menyimpan token jika berhasil
   */
  async login(payload: LoginPayload): Promise<ApiResponse<LoginResponseData>> {
    const res = await apiClient.post<LoginResponseData>("/v1/auth/login", payload, {
      requiresAuth: false,
      errorTitle: "Autentikasi Gagal",
    });
    if (res.status && res.data?.token?.token) {
      setAuthToken(res.data.token.token);
      if (res.data.user) {
        setAuthUser(res.data.user);
      }
    }
    return res;
  },

  /**
   * Mengambil data profil user yang sedang login
   */
  async getProfile(): Promise<ApiResponse<ProfileResponseData>> {
    const res = await apiClient.get<ProfileResponseData>("/v1/auth/profile");
    if (res.status && res.data?.user) {
      setAuthUser(res.data.user);
    }
    return res;
  },

  /**
   * Logout user & membersihkan token dari penyimpanan lokal
   */
  async logout(): Promise<ApiResponse<{ status: boolean; message: string }>> {
    try {
      const res = await apiClient.get<{ status: boolean; message: string }>("/v1/auth/logout");
      removeAuthToken();
      return res;
    } catch (e) {
      removeAuthToken();
      throw e;
    }
  },
};
