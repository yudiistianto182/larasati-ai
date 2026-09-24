/**
 * DataPatient API Service
 */

import { apiClient, type ApiResponse } from "@/lib/api/api-client";
import type { DataPatientItem, DataPatientPayload, PaginatedData, PaginationQueryParams } from "@/types/api";

export const patientService = {
  /**
   * Mengambil semua daftar pasien
   */
  async getAll(): Promise<ApiResponse<DataPatientItem[]>> {
    return apiClient.get<DataPatientItem[]>("/v1/data_patient");
  },

  /**
   * Mengambil data pasien dengan pagination
   */
  async getPagination(params?: PaginationQueryParams): Promise<ApiResponse<PaginatedData<DataPatientItem>>> {
    return apiClient.get<PaginatedData<DataPatientItem>>("/v1/data_patient", {
      queryParams: params,
    });
  },

  /**
   * Mengambil detail pasien berdasarkan ID
   */
  async getDetail(id: number | string): Promise<ApiResponse<DataPatientItem>> {
    return apiClient.get<DataPatientItem>(`/v1/data_patient/${id}`);
  },

  /**
   * Mendaftarkan pasien baru
   */
  async create(payload: DataPatientPayload): Promise<ApiResponse<{ status: boolean; message: string }>> {
    return apiClient.post("/v1/data_patient", payload);
  },

  /**
   * Mengubah data pasien
   */
  async update(id: number | string, payload: DataPatientPayload): Promise<ApiResponse<{ status: boolean; message: string }>> {
    return apiClient.put(`/v1/data_patient/${id}`, payload);
  },

  /**
   * Menghapus pasien
   */
  async delete(id: number | string): Promise<ApiResponse<{ status: boolean; message: string }>> {
    return apiClient.delete(`/v1/data_patient/${id}`);
  },
};
