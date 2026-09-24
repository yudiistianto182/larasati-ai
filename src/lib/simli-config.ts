/**
 * ============================================================================
 * SIMLI AI AVATAR CONFIGURATION SERVICE
 * ============================================================================
 * 
 * 🔑 KUNCI YANG DIGUNAKAN:
 * 1. Simli API Key: https://app.simli.com
 * 2. Simli Face ID / Avatar ID: dari Simli Dashboard
 * 3. Google Gemini API Key: diatur di src/lib/gemini-ai.ts (atau VITE_GEMINI_API_KEY)
 */

import { useSysConfigStore, FALLBACK_SIMLI_API_KEY } from "@/stores/sys-config-store";

// 1. SIMLI API KEY FALLBACK
export const SIMLI_API_KEY: string =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SIMLI_API_KEY) ||
  FALLBACK_SIMLI_API_KEY;

// 2. SIMLI FACE ID / AVATAR ID
export const SIMLI_FACE_ID: string =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SIMLI_FACE_ID) ||
  "1bbd026a-e281-4a8f-bea7-6e57e8bee437";

/**
 * Mendapatkan Simli API Key efektif (prioritas: dynamic sys-config -> fallback)
 */
export function getSimliApiKey(): string {
  try {
    const dynamicKey = useSysConfigStore.getState().getEffectiveSimliKey();
    if (dynamicKey && dynamicKey.trim()) return dynamicKey.trim();
  } catch {
    // fallback
  }
  return SIMLI_API_KEY.trim();
}

/**
 * Memeriksa apakah konfigurasi Simli sudah lengkap & siap untuk dicoba dihubungkan
 */
export function isSimliConfigured(): boolean {
  const apiKey = getSimliApiKey();
  const faceId = SIMLI_FACE_ID.trim();

  if (!apiKey || apiKey === "YOUR_SIMLI_API_KEY" || apiKey === "YOUR_SIMLI_API_KEY_HERE") {
    return false;
  }
  if (!faceId || faceId === "YOUR_SIMLI_FACE_ID" || faceId === "YOUR_SIMLI_FACE_ID_HERE") {
    return false;
  }
  return true;
}
