import { create } from "zustand";

interface ErrorAlertState {
  isOpen: boolean;
  title: string;
  message: string;
  statusCode?: number;
  showError: (title: string, message: string, statusCode?: number) => void;
  closeError: () => void;
}

export const useErrorAlertStore = create<ErrorAlertState>((set) => ({
  isOpen: false,
  title: "Peringatan Sistem",
  message: "Terjadi kesalahan saat memproses permintaan.",
  statusCode: undefined,

  showError: (title, message, statusCode) => {
    set({
      isOpen: true,
      title: title || "Terjadi Kesalahan",
      message: message || "Terjadi kesalahan pada respon server.",
      statusCode,
    });
  },

  closeError: () => {
    set({ isOpen: false });
  },
}));

/**
 * Helper function to trigger error alert from anywhere
 */
export function triggerErrorAlert(title: string, message: string, statusCode?: number) {
  useErrorAlertStore.getState().showError(title, message, statusCode);
}
