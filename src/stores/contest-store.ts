import { create } from "zustand";

export interface Mahasiswa {
  id: string;
  nama: string;
  nim: string;
}

export interface Penilai {
  id: string;
  nama: string;
  nip: string;
  spesialisasi: string;
  role: string;
}

export interface KelompokLomba {
  id: string;
  nama: string;
  mahasiswa_ids: string[];
  ketua_mhs_id?: string;
  kasus_id?: string;
}

export interface Contest {
  id: string;
  nama: string;
  periode_id: number;
  periode_nama?: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  deskripsi: string;
  kasus_ids: string[];
  kelompok_list: KelompokLomba[];
  allow_shared_kasus: boolean;
  penilai_ids: string[];
  status: "Akan Datang" | "Sedang Berlangsung" | "Selesai";
}

export const INITIAL_MAHASISWA_LIST: Mahasiswa[] = [
  { id: "mhs-01", nama: "Adinda Putri Maharani", nim: "21060120140001" },
  { id: "mhs-02", nama: "Bella Safira Ramadhani", nim: "21060120140002" },
  { id: "mhs-03", nama: "Citra Dewi Lestari", nim: "21060120140003" },
  { id: "mhs-04", nama: "Dian Ayu Wardani", nim: "21060120140004" },
  { id: "mhs-05", nama: "Erna Wulandari", nim: "21060120140005" },
  { id: "mhs-06", nama: "Fatimah Nur Azizah", nim: "21060120140006" },
  { id: "mhs-07", nama: "Gita Puspitasari", nim: "21060120140007" },
  { id: "mhs-08", nama: "Hanna Novita Sari", nim: "21060120140008" },
  { id: "mhs-09", nama: "Indah Permata Sari", nim: "21060120140009" },
  { id: "mhs-10", nama: "Jesika Anggraini", nim: "21060120140010" },
  { id: "mhs-11", nama: "Khairunnisa Salsabila", nim: "21060120140011" },
  { id: "mhs-12", nama: "Lestari Widyaningrum", nim: "21060120140012" },
];

export const INITIAL_PENILAI_LIST: Penilai[] = [
  {
    id: "pnl-01",
    nama: "Dr. Bdn. Hj. Siti Rahmawati, S.ST., M.Keb",
    nip: "198005122005012003",
    spesialisasi: "Asuhan Kebidanan Patologis & Kegawatdaruratan",
    role: "Dosen Penguji Utama",
  },
  {
    id: "pnl-02",
    nama: "Bdn. Dewi Lestari, S.Tr.Keb., M.Tr.Keb",
    nip: "198509182008122002",
    spesialisasi: "Deteksi Dini Kanker Serviks & Prosedur IVA",
    role: "Penguji Klinis Stase 3",
  },
  {
    id: "pnl-03",
    nama: "dr. Andika Pratama, Sp.OG (K)",
    nip: "197803152003121004",
    spesialisasi: "Obstetri & Ginekologi Onkologi",
    role: "Dokter Penilai Ahli",
  },
  {
    id: "pnl-04",
    nama: "Bdn. Nurul Hidayah, S.ST., Bdn",
    nip: "198811202010012008",
    spesialisasi: "Konseling Pasien & Komunikasi Terapeutik",
    role: "Instruktur Klinis",
  },
  {
    id: "pnl-05",
    nama: "Bdn. Rina Marlina, M.Keb",
    nip: "198302142006042001",
    spesialisasi: "Pemeriksaan Fisik & Faktor Risiko Maternal",
    role: "Penguji Stase 2",
  },
];

export const INITIAL_CONTEST_LIST: Contest[] = [
  {
    id: "lomba-01",
    nama: "Midwife OSCE Circuit Challenge 2026",
    periode_id: 3,
    periode_nama: "Periode 2026",
    tanggal_mulai: "2026-03-01T08:00:00.000Z",
    tanggal_selesai: "2026-03-15T17:00:00.000Z",
    deskripsi: "Kompetisi sirkuit klinis kebidanan terintegrasi 5 stase untuk evaluasi keterampilan anamnesis AI, deteksi risiko, prosedur IVA, interpretasi klinis, dan konseling.",
    kasus_ids: ["KSS-001", "KSS-002"],
    allow_shared_kasus: false,
    penilai_ids: ["pnl-01", "pnl-02", "pnl-03"],
    status: "Sedang Berlangsung",
    kelompok_list: [
      {
        id: "kel-01",
        nama: "Kelompok A (Stase Pagi)",
        mahasiswa_ids: ["mhs-01", "mhs-02", "mhs-03"],
        ketua_mhs_id: "mhs-01",
        kasus_id: "KSS-001",
      },
      {
        id: "kel-02",
        nama: "Kelompok B (Stase Siang)",
        mahasiswa_ids: ["mhs-04", "mhs-05", "mhs-06"],
        ketua_mhs_id: "mhs-04",
        kasus_id: "KSS-002",
      },
    ],
  },
  {
    id: "lomba-02",
    nama: "Simulasi Uji Kompetensi Bidan Daerah",
    periode_id: 2,
    periode_nama: "Periode 2025",
    tanggal_mulai: "2025-11-10T08:00:00.000Z",
    tanggal_selesai: "2025-11-20T17:00:00.000Z",
    deskripsi: "Simulasi persiapan uji kompetensi profesi bidan dengan kasus patologis reproduksi dan asuhan komprehensif.",
    kasus_ids: ["KSS-001"],
    allow_shared_kasus: true,
    penilai_ids: ["pnl-01", "pnl-04"],
    status: "Selesai",
    kelompok_list: [
      {
        id: "kel-03",
        nama: "Kelompok 1",
        mahasiswa_ids: ["mhs-07", "mhs-08"],
        ketua_mhs_id: "mhs-07",
        kasus_id: "KSS-001",
      },
      {
        id: "kel-04",
        nama: "Kelompok 2",
        mahasiswa_ids: ["mhs-09", "mhs-10"],
        ketua_mhs_id: "mhs-09",
        kasus_id: "KSS-001",
      },
    ],
  },
];

interface ContestState {
  contests: Contest[];
  mahasiswaList: Mahasiswa[];
  penilaiList: Penilai[];
  addContest: (contest: Omit<Contest, "id">) => string;
  updateContest: (id: string, updated: Partial<Contest>) => void;
  deleteContest: (id: string) => void;
  getContestById: (id: string) => Contest | undefined;
}

export const useContestStore = create<ContestState>((set, get) => ({
  contests: INITIAL_CONTEST_LIST,
  mahasiswaList: INITIAL_MAHASISWA_LIST,
  penilaiList: INITIAL_PENILAI_LIST,

  addContest: (contest) => {
    const newId = `lomba-${String(Date.now()).slice(-4)}`;
    const newContest: Contest = {
      ...contest,
      id: newId,
    };
    set((state) => ({
      contests: [newContest, ...state.contests],
    }));
    return newId;
  },

  updateContest: (id, updated) => {
    set((state) => ({
      contests: state.contests.map((c) => (c.id === id ? { ...c, ...updated } : c)),
    }));
  },

  deleteContest: (id) => {
    set((state) => ({
      contests: state.contests.filter((c) => c.id !== id),
    }));
  },

  getContestById: (id) => {
    return get().contests.find((c) => c.id === id);
  },
}));
