/**
 * API Helper & Configuration Utilities
 * 
 * Mengelola Base URL API backend, token otentikasi Bearer,
 * dan pembentukan URL endpoint secara dinamis tanpa ketergantungan file .env statis.
 */

const STORAGE_KEYS = {
  API_BASE_URL: "app_api_base_url",
  AUTH_TOKEN: "app_auth_token",
  AUTH_USER: "app_auth_user",
} as const;

// Default API Base URL
export const DEFAULT_API_BASE_URL = "https://larasati.online/api";

/**
 * Mendapatkan API Base URL saat ini:
 * Prioritas: LocalStorage (jika custom bukan legacy localhost) -> Fallback default (https://larasati.online/api)
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const customUrl = localStorage.getItem(STORAGE_KEYS.API_BASE_URL);
    if (customUrl && customUrl.trim() && !customUrl.includes("localhost:3333")) {
      return customUrl.trim().replace(/\/+$/, "");
    }
  }
  return DEFAULT_API_BASE_URL;
}

/**
 * Mengubah API Base URL secara dinamis saat runtime
 */
export function setApiBaseUrl(newUrl: string): void {
  if (typeof window !== "undefined") {
    const cleanUrl = newUrl.trim().replace(/\/+$/, "");
    localStorage.setItem(STORAGE_KEYS.API_BASE_URL, cleanUrl);
  }
}

/**
 * Mereset API Base URL ke default
 */
export function resetApiBaseUrl(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEYS.API_BASE_URL);
  }
}

/**
 * Mengambil token JWT Bearer dari storage
 */
export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }
  return null;
}

/**
 * Menyimpan token JWT Bearer
 */
export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token.trim());
  }
}

/**
 * Menghapus token JWT Bearer (Logout)
 */
export function removeAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  }
}

/**
 * Mengambil data User yang tersimpan di storage
 */
export function getAuthUser(): { user_id: number; user_name: string; user_email: string; role_id: number; role_name: string } | null {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Menyimpan data User ke storage
 */
export function setAuthUser(user: { user_id: number; user_name: string; user_email: string; role_id: number; role_name: string }): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
  }
}

/**
 * Memeriksa apakah user yang sedang aktif memiliki akses Administrator atau Root
 */
export function isUserAdmin(): boolean {
  const user = getAuthUser();
  if (!user) return false;
  // role_id 1 = Root, role_id 2 = Administrator, atau nama role mengandung admin/root
  if (user.role_id === 1 || user.role_id === 2) return true;
  const lowerRole = (user.role_name || "").toLowerCase();
  return lowerRole.includes("admin") || lowerRole.includes("root");
}

/**
 * Membentuk URL lengkap dari endpoint path dan optional query parameters
 * Contoh: buildApiUrl('/v1/sys_user', { limit: 10, page: 1 })
 */
export function buildApiUrl(
  path: string,
  queryParams?: Record<string, string | number | boolean | null | undefined>
): string {
  const baseUrl = getApiBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${baseUrl}${cleanPath}`);

  if (queryParams) {
    Object.entries(queryParams).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        url.searchParams.append(key, String(val));
      }
    });
  }

  return url.toString();
}

/**
 * Membentuk URL lengkap gambar storage API:
 * Format: api_url/storage/{casequestci_image} -> https://larasati.online/api/storage/{casequestci_image}
 */
export function buildStorageUrl(imagePath?: string | null): string {
  if (!imagePath || !imagePath.trim()) return "";
  const trimmed = imagePath.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  const apiBase = getApiBaseUrl().replace(/\/+$/, "");
  const cleanPath = trimmed.replace(/^\/?(api\/)?(storage\/)?/, "");
  return `${apiBase}/storage/${cleanPath}`;
}
