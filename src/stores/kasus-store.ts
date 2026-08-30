import { create } from "zustand";
import { fallbackKasus, type Kasus } from "@/routes/(admin)/dashboard/master/kasus/-components/data";

interface KasusStore {
  kasusList: Kasus[];
  addKasus: (kasus: Omit<Kasus, "id" | "created_at">) => string;
  updateKasus: (id: string, data: Partial<Kasus>) => void;
  deleteKasus: (id: string) => void;
  getKasusById: (id: string) => Kasus | undefined;
}

export const useKasusStore = create<KasusStore>((set, get) => ({
  kasusList: fallbackKasus,

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

  deleteKasus: (id) => {
    set((prev) => ({
      kasusList: prev.kasusList.filter((k) => k.id !== id),
    }));
  },

  getKasusById: (id) => {
    return get().kasusList.find((k) => k.id === id);
  },
}));
