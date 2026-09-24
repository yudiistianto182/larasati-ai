import { create } from "zustand";
import { configService } from "@/services/api/config-service";

// Default fallback keys jika backend offline
export const FALLBACK_GEMINI_API_KEY = "";
export const FALLBACK_SIMLI_API_KEY = "";

interface SysConfigState {
  geminiApiKey: string;
  simliApiKey: string;
  elevenLabsApiKey: string;
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;

  loadConfigs: () => Promise<void>;
  getEffectiveGeminiKey: () => string;
  getEffectiveSimliKey: () => string;
  setCustomKeys: (keys: { gemini?: string; simli?: string }) => void;
}

export const useSysConfigStore = create<SysConfigState>((set, get) => ({
  geminiApiKey: (typeof import.meta !== "undefined" && import.meta.env?.VITE_GEMINI_API_KEY) || "",
  simliApiKey: (typeof import.meta !== "undefined" && import.meta.env?.VITE_SIMLI_API_KEY) || "",
  elevenLabsApiKey: "",
  isLoading: false,
  isLoaded: false,
  error: null,

  /**
   * Mengambil konfigurasi Simli & Gemini dari API Backend saat load lomba
   */
  loadConfigs: async () => {
    // Jika sudah dimuat atau sedang loading, hindari pemanggilan berulang
    if (get().isLoaded || get().isLoading) return;

    set({ isLoading: true, error: null });

    try {
      console.log("%c[SysConfig] 🔄 Memuat konfigurasi API (Simli & Gemini) dari backend...", "color: #3b82f6; font-weight: bold;");
      const res = await configService.getConfigsDropdown();

      if (res.status && Array.isArray(res.data)) {
        let newGemini = get().geminiApiKey;
        let newSimli = get().simliApiKey;
        let newEleven = get().elevenLabsApiKey;

        res.data.forEach((item) => {
          const val = (item.text || "").trim();
          if (!val || val === "-") return;

          if (item.id === "GEMINI_API_KEY") {
            newGemini = val;
          } else if (item.id === "SIMLI_API_KEY") {
            newSimli = val;
          } else if (item.id === "ELEVENLABS_API_KEY") {
            newEleven = val;
          }
        });

        set({
          geminiApiKey: newGemini,
          simliApiKey: newSimli,
          elevenLabsApiKey: newEleven,
          isLoading: false,
          isLoaded: true,
        });

        console.log("%c[SysConfig] ✅ Konfigurasi API berhasil dimuat dari backend!", "color: #10b981; font-weight: bold;", {
          geminiConfigured: !!newGemini,
          simliConfigured: !!newSimli,
        });
      } else {
        set({ isLoading: false, isLoaded: true });
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Gagal memuat sys-config";
      console.warn(`[SysConfig] ⚠️ Backend tidak merespon (${errMsg}), menggunakan konfigurasi fallback bawaan.`);
      set({ isLoading: false, isLoaded: true, error: errMsg });
    }
  },

  getEffectiveGeminiKey: () => {
    const key = get().geminiApiKey?.trim();
    return key || "";
  },

  getEffectiveSimliKey: () => {
    const key = get().simliApiKey?.trim();
    return key || "";
  },

  setCustomKeys: ({ gemini, simli }) => {
    set((state) => ({
      geminiApiKey: gemini !== undefined ? gemini.trim() : state.geminiApiKey,
      simliApiKey: simli !== undefined ? simli.trim() : state.simliApiKey,
    }));
  },
}));
