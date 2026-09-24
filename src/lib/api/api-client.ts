/**
 * Reusable HTTP API Client
 * 
 * Generic fetch wrapper dengan penanganan header otomatis,
 * injeksi Bearer Token, parsing JSON, dan standardisasi ApiResponse<T>.
 */

import { buildApiUrl, getAuthToken } from "./api-helper";
import { useErrorAlertStore } from "@/stores/error-alert-store";

export interface ApiResponse<T = unknown> {
  status: boolean;
  message: string;
  data: T;
}

export interface RequestOptions extends RequestInit {
  queryParams?: Record<string, string | number | boolean | null | undefined>;
  requiresAuth?: boolean;
  suppressGlobalErrorModal?: boolean;
  errorTitle?: string;
}

export class ApiError extends Error {
  statusCode: number;
  responseBody?: unknown;

  constructor(message: string, statusCode: number, responseBody?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}

/**
 * Generic request method
 */
export async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    queryParams,
    requiresAuth = true,
    headers: customHeaders = {},
    ...fetchOptions
  } = options;

  const url = buildApiUrl(endpoint, queryParams);

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(fetchOptions.body && !(fetchOptions.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...(customHeaders as Record<string, string>),
  };

  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    const contentType = response.headers.get("content-type");
    let responseData: unknown = null;

    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = text;
      }
    }

    if (!response.ok) {
      let errorMessage: string | null = null;
      if (responseData && typeof responseData === "object") {
        const obj = responseData as Record<string, unknown>;
        if ("message" in obj && obj.message) {
          errorMessage = String(obj.message);
        } else if ("errors" in obj && Array.isArray(obj.errors) && obj.errors.length > 0) {
          errorMessage = obj.errors.map((e: any) => e.message || e.field || JSON.stringify(e)).join(", ");
        }
      }
      if (!errorMessage) {
        errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      }

      throw new ApiError(errorMessage, response.status, responseData);
    }

    // Standardize to ApiResponse structure
    if (
      responseData &&
      typeof responseData === "object" &&
      "status" in responseData
    ) {
      // Jika status dari payload bernilai false (misal response dengan status: false)
      if ((responseData as Record<string, unknown>).status === false) {
        const obj = responseData as Record<string, unknown>;
        let errorMsg = String(obj.message || "");
        if (!errorMsg && "errors" in obj && Array.isArray(obj.errors) && obj.errors.length > 0) {
          errorMsg = obj.errors.map((e: any) => e.message || e.field || JSON.stringify(e)).join(", ");
        }
        if (!errorMsg) errorMsg = "Permintaan gagal diproses";
        throw new ApiError(errorMsg, response.status, responseData);
      }

      if ("data" in responseData) {
        return responseData as ApiResponse<T>;
      }
    }

    return {
      status: true,
      message: "Success",
      data: responseData as T,
    };
  } catch (error) {
    const apiError =
      error instanceof ApiError
        ? error
        : new ApiError(
            `Koneksi API Gagal: ${error instanceof Error ? error.message : "Network error"}`,
            0
          );

    // Tampilkan modal alert secara otomatis ke seluruh modul jika tidak disupress
    if (!options.suppressGlobalErrorModal) {
      useErrorAlertStore.getState().showError(
        options.errorTitle || "Peringatan Sistem",
        apiError.message,
        apiError.statusCode || undefined
      );
    }

    throw apiError;
  }
}

/**
 * Convenience HTTP Methods
 */
export const apiClient = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, "method">) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: Omit<RequestOptions, "method">) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
