export interface KasusAttribute {
  id: string;
  key: string;
  value: string;
}

// Stase 1 & 5: Keyword Trigger item
export interface AiKeywordTrigger {
  id: string;
  konteks: string;
  keyword: string;
  skor: number;
  jawaban_cadangan: string; // Offline fallback response
}

// Stase 2: Faktor Risiko item with conditional dependency
export interface FaktorRisikoItem {
  id: string;
  nama_jawaban: string;
  syarat_id: string; // "tanpa_syarat" or trigger ID from Stase 1
  skor: number;
}

// Stase 3: Prosedur IVA step with drag-and-drop ordering
export interface ProsedurStepItem {
  id: string;
  nama_langkah: string;
  skor: number;
  order: number;
}

// Stase 4: Interpretasi Image Item with Name & Description
export interface InterpretasiImageItem {
  id: string;
  url: string;
  nama: string;
  keterangan: string;
}

// Stase 4: Interpretasi MCQ option with image upload
export interface InterpretasiOption {
  id: string;
  label: string;
  is_correct: boolean;
  skor: number;
}

export interface StaseHeaderData {
  nama_stase: string;
  kode_amplop: string;
  durasi_menit: number;
  durasi_detik?: number;
  petunjuk_soal: string;
}

export interface StaseSoalData {
  // Stase 1: Anamnesis
  stase1: {
    casequest_id?: number;
    header: StaseHeaderData;
    ai_system_prompt: string;
    init_message?: string;
    triggers: AiKeywordTrigger[];
  };
  // Stase 2: Faktor Risiko
  stase2: {
    casequest_id?: number;
    header: StaseHeaderData;
    faktor_risiko: FaktorRisikoItem[];
  };
  // Stase 3: Prosedur IVA
  stase3: {
    casequest_id?: number;
    header: StaseHeaderData;
    langkah_prosedur: ProsedurStepItem[];
  };
  // Stase 4: Interpretasi
  stase4: {
    casequest_id?: number;
    header: StaseHeaderData;
    images: Array<string | InterpretasiImageItem>;
    pilihan_jawaban: InterpretasiOption[];
  };
  // Stase 5: Asuhan Kebidanan
  stase5: {
    casequest_id?: number;
    header: StaseHeaderData;
    ai_system_prompt: string;
    init_message?: string;
    triggers: AiKeywordTrigger[];
  };
  // Stase 6: Record Audio
  stase6?: {
    casequest_id?: number;
  };
}

export interface Kasus {
  id: string;
  nama: string;
  deskripsi: string;
  teks_perkenalan: string;
  atribut: KasusAttribute[];
  pasien_ids: string[];
  patient_count?: number;
  pasien_count?: number;
  soal_text?: string;
  stase_data: StaseSoalData;
  has_perekam_nilai: boolean;
  created_at: string;
}

export const DEFAULT_AI_SYSTEM_PROMPT = `Kamu adalah seorang pasien yang sedang melakukan anamnesis dengan seorang bidan di Poli KIA.
Karakteristik kepribadian dan keluhan medis Anda:
- Anda adalah wanita yang sopan, kooperatif, menggunakan bahasa Indonesia yang santun.
- Sampaikan keluhan secara bertahap sesuai pertanyaan bidan.`;

export function createDefaultStaseSoalData(): StaseSoalData {
  return {
    stase1: {
      header: {
        nama_stase: "Pos 1: Anamnesis Pasien",
        kode_amplop: "AMP-01",
        durasi_menit: 5,
        petunjuk_soal: "",
      },
      ai_system_prompt: "",
      init_message: "Selamat siang Bidan.",
      triggers: [],
    },
    stase2: {
      header: {
        nama_stase: "Pos 2: Deteksi Faktor Risiko",
        kode_amplop: "AMP-02",
        durasi_menit: 5,
        petunjuk_soal: "",
      },
      faktor_risiko: [],
    },
    stase3: {
      header: {
        nama_stase: "Pos 3: Prosedur IVA",
        kode_amplop: "AMP-03",
        durasi_menit: 10,
        petunjuk_soal: "",
      },
      langkah_prosedur: [],
    },
    stase4: {
      header: {
        nama_stase: "Pos 4: Interpretasi Visual",
        kode_amplop: "AMP-04",
        durasi_menit: 5,
        petunjuk_soal: "",
      },
      images: [],
      pilihan_jawaban: [],
    },
    stase5: {
      header: {
        nama_stase: "Pos 5: Asuhan Kebidanan & Konseling Interaktif",
        kode_amplop: "AMP-05",
        durasi_menit: 5,
        petunjuk_soal: "",
      },
      ai_system_prompt: "",
      init_message: "Terima kasih atas penjelasannya Bu Bidan.",
      triggers: [],
    },
    stase6: {
      casequest_id: undefined,
    },
  };
}
