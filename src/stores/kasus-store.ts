import { create } from "zustand";
import { type Kasus, createDefaultStaseSoalData } from "@/routes/(admin)/dashboard/master/kasus/-components/data";
import { caseService, extractNumericCaseId, mapApiDetailToKasus } from "@/services/api";

interface KasusStore {
  kasusList: Kasus[];
  isLoading: boolean;
  fetchKasus: () => Promise<void>;
  getKasusDetail: (id: string | number) => Promise<Kasus | null>;
  addKasus: (kasus: Omit<Kasus, "id" | "created_at">) => string;
  updateKasus: (id: string, data: Partial<Kasus>) => void;
  deleteKasus: (id: string) => Promise<boolean>;
  getKasusById: (id: string) => Kasus | undefined;
}

let caseFetchPromise: Promise<void> | null = null;
let caseDetailPromises: Record<string, Promise<Kasus | null> | undefined> = {};

export const useKasusStore = create<KasusStore>((set, get) => ({
  kasusList: [],
  isLoading: false,

  fetchKasus: async () => {
    if (caseFetchPromise) return caseFetchPromise;
    set({ isLoading: true });

    caseFetchPromise = (async () => {
      try {
        const res = await caseService.getAll();
        const rawList = Array.isArray(res.data)
          ? res.data
          : (res.data && typeof res.data === "object" && "data" in res.data && Array.isArray((res.data as any).data))
          ? (res.data as any).data
          : [];

        const mappedList: Kasus[] = rawList.map((c: any) => ({
          id: `KSS-${c.case_id}`,
          nama: c.case_name || "Kasus Tanpa Nama",
          deskripsi: c.case_desc || c.case_introduction || "-",
          teks_perkenalan: c.case_introduction || "-",
          has_perekam_nilai: true,
          pasien_ids: [],
          atribut: [],
          stase_data: createDefaultStaseSoalData(),
          created_at: c.insert_timestamp ? c.insert_timestamp.split("T")[0] : "2026-08-28",
        }));

        set((prev) => {
          const detailMap = new Map(prev.kasusList.map((k) => [k.id, k]));
          const merged = mappedList.map((m) => {
            const existing = detailMap.get(m.id);
            if (existing) {
              return {
                ...m,
                stase_data: existing.stase_data,
                atribut: existing.atribut.length > 0 ? existing.atribut : m.atribut,
                pasien_ids: existing.pasien_ids.length > 0 ? existing.pasien_ids : m.pasien_ids,
              };
            }
            return m;
          });
          return { kasusList: merged };
        });
      } catch (e) {
        console.warn("[KasusStore] Gagal mengambil data kasus dari API:", e);
      } finally {
        set({ isLoading: false });
        caseFetchPromise = null;
      }
    })();

    return caseFetchPromise;
  },

  getKasusDetail: async (id: string | number) => {
    const cleanId = extractNumericCaseId(id);
    if (!cleanId) return null;

    const pendingPromise = caseDetailPromises[cleanId];
    if (pendingPromise) {
      return pendingPromise;
    }

    caseDetailPromises[cleanId] = (async () => {
      try {
        const res = await caseService.getDetail(cleanId);
        if (res.status && res.data) {
          const fullKasus = mapApiDetailToKasus(res.data);
          // Perbarui / tambahkan ke cache kasusList lokal
          set((prev) => {
            const exists = prev.kasusList.some((k) => k.id === fullKasus.id);
            if (exists) {
              return {
                kasusList: prev.kasusList.map((k) => (k.id === fullKasus.id ? fullKasus : k)),
              };
            } else {
              return {
                kasusList: [fullKasus, ...prev.kasusList],
              };
            }
          });
          return fullKasus;
        }
        return null;
      } catch (e) {
        console.warn(`[KasusStore] Gagal mengambil detail kasus ${cleanId} dari API:`, e);
        return get().kasusList.find((k) => k.id === id || extractNumericCaseId(k.id) === cleanId) || null;
      } finally {
        setTimeout(() => {
          delete caseDetailPromises[cleanId];
        }, 3000);
      }
    })();

    return caseDetailPromises[cleanId];
  },

  addKasus: (newKasusData) => {
    const state = get();
    const nextNum =
      state.kasusList.length > 0
        ? Math.max(
            ...state.kasusList.map((k) => {
              const num = parseInt(k.id.replace("KSS-", ""), 10);
              return isNaN(num) ? 0 : num;
            }),
          ) + 1
        : 1;

    const newId = `KSS-${String(nextNum).padStart(3, "0")}`;
    const today = new Date().toISOString().split("T")[0];

    const createdKasus: Kasus = {
      ...newKasusData,
      id: newId,
      created_at: today,
    };

    set((prev) => ({
      kasusList: [createdKasus, ...prev.kasusList],
    }));

    return newId;
  },

  updateKasus: (id, updatedData) => {
    set((prev) => ({
      kasusList: prev.kasusList.map((k) => (k.id === id ? { ...k, ...updatedData } : k)),
    }));
  },

  deleteKasus: async (id) => {
    const cleanId = extractNumericCaseId(id);
    try {
      await caseService.delete(cleanId);
    } catch (e) {
      console.warn(`[KasusStore] API delete gagal/offline untuk kasus ${cleanId}:`, e);
      const errMsg = e instanceof Error ? e.message : String(e);
      if (errMsg.includes("foreign key constraint fails")) {
        throw e;
      }
    }

    set((prev) => ({
      kasusList: prev.kasusList.filter((k) => k.id !== id && extractNumericCaseId(k.id) !== cleanId),
    }));
    return true;
  },

  getKasusById: (id) => {
    const cleanId = extractNumericCaseId(id);
    return get().kasusList.find((k) => k.id === id || extractNumericCaseId(k.id) === cleanId);
  },
}));
