import * as React from "react";

export interface StaseDetailData {
  pos: number;
  name: string;
  kodeAmplop: string;
  status: "completed" | "in_progress" | "locked";
  score?: number;
  maxScore: number;
  timeSpentFormatted: string;
  summaryAnswer: string;
  details?: {
    type: "chat" | "magnet" | "sequence" | "mcq" | "audio";
    items?: string[];
    selectedOption?: string;
    chatMessages?: Array<{ sender: string; text: string }>;
    audioDuration?: string;
  };
  liveActivity?: string;
}

export interface GroupRaceState {
  id: string;
  groupNum: number;
  name: string;
  pos: number; // 0: Perkenalan, 1..5: Pos 1..5, 6: Finish
  color: string;
  borderClass: string;
  badgeBg: string;
  avatarUrl?: string;
  totalScore: number;
  timeElapsedFormatted: string;
  currentStaseStatus: "working" | "idle" | "completed";
  staseData: Record<number, StaseDetailData>;
}

export interface CircuitWaypoint {
  pos: number;
  name: string;
  subtitle: string;
  iconName: string;
  leftPct: number;
  topPct: number;
  isFinish?: boolean;
  isStart?: boolean;
}

// Clean concise waypoints: Station Number + Station Name (00 is Perkenalan)
export const CIRCUIT_WAYPOINTS: CircuitWaypoint[] = [
  {
    pos: 0,
    name: "Perkenalan",
    subtitle: "Briefing Awal",
    iconName: "flag",
    leftPct: 11,
    topPct: 20,
    isStart: true,
  },
  {
    pos: 1,
    name: "Anamnesis AI",
    subtitle: "Wawancara Pasien",
    iconName: "record_voice_over",
    leftPct: 30,
    topPct: 28,
  },
  {
    pos: 2,
    name: "Faktor Risiko",
    subtitle: "Papan Magnet",
    iconName: "stethoscope",
    leftPct: 14,
    topPct: 54,
  },
  {
    pos: 3,
    name: "Prosedur IVA",
    subtitle: "Penyusunan SOP",
    iconName: "fact_check",
    leftPct: 35,
    topPct: 68,
  },
  {
    pos: 4,
    name: "Interpretasi Visual",
    subtitle: "Skrining & MCQ",
    iconName: "medical_services",
    leftPct: 53,
    topPct: 44,
  },
  {
    pos: 5,
    name: "Asuhan AI",
    subtitle: "Konseling Pasien",
    iconName: "school",
    leftPct: 50,
    topPct: 82,
  },
  {
    pos: 6,
    name: "Finish",
    subtitle: "Rekaman Klinis",
    iconName: "military_tech",
    leftPct: 72,
    topPct: 72,
    isFinish: true,
  },
];

export const DEFAULT_GROUPS_META: Record<
  number,
  { name: string; color: string; borderClass: string; badgeBg: string }
> = {
  1: {
    name: "Kelompok 1 (Surya Emas)",
    color: "#fde047",
    borderClass: "border-[#fde047] shadow-[0_0_22px_rgba(253,224,71,0.9)] ring-2 ring-[#fde047]/60",
    badgeBg: "bg-[#fde047] text-black",
  },
  2: {
    name: "Kelompok 2 (Zamrud)",
    color: "#4ade80",
    borderClass: "border-[#4ade80] shadow-[0_0_22px_rgba(74,222,128,0.9)] ring-2 ring-[#4ade80]/60",
    badgeBg: "bg-[#4ade80] text-black",
  },
  3: {
    name: "Kelompok 3 (Safir)",
    color: "#60a5fa",
    borderClass: "border-[#60a5fa] shadow-[0_0_22px_rgba(96,165,250,0.9)] ring-2 ring-[#60a5fa]/60",
    badgeBg: "bg-[#60a5fa] text-black",
  },
  4: {
    name: "Kelompok 4 (Delima)",
    color: "#f87171",
    borderClass: "border-[#f87171] shadow-[0_0_22px_rgba(248,113,113,0.9)] ring-2 ring-[#f87171]/60",
    badgeBg: "bg-[#f87171] text-black",
  },
};

export const INITIAL_MOCK_STASES_FACTORY = (
  currentPos: number,
  groupNum: number,
): Record<number, StaseDetailData> => ({
  1: {
    pos: 1,
    name: "Pos 1: Anamnesis AI",
    kodeAmplop: "AMP-ANM-01",
    status: currentPos >= 1 ? (currentPos === 1 ? "in_progress" : "completed") : "locked",
    score: currentPos > 1 ? 92 - (groupNum - 1) * 3 : currentPos === 1 ? 75 : undefined,
    maxScore: 100,
    timeSpentFormatted: currentPos >= 1 ? "05:42" : "-",
    summaryAnswer: "Menggali keluhan keputihan, HPHT 3 bulan lalu, riwayat flek kontak & KB suntik 3 bulan.",
    liveActivity: "Sedang berbicara ke mic: 'Ibu Ani, apakah ada rasa gatal atau bau pada keputihannya?'",
    details: {
      type: "chat",
      chatMessages: [
        { sender: "Bidan", text: "Selamat pagi Bu Ani, sudah berapa lama keluhan keputihan ini dirasakan?" },
        { sender: "Ny. Ani", text: "Sekitar 2-3 minggu ini Bu Bidan, rasanya sangat tidak nyaman..." },
        { sender: "Bidan", text: "Apakah ada riwayat keluar flek bercak darah setelah berhubungan?" },
        { sender: "Ny. Ani", text: "Iya Bu, minggu lalu sempat ada bercak darah sedikit setelah dengan suami." },
      ],
    },
  },
  2: {
    pos: 2,
    name: "Pos 2: Faktor Risiko",
    kodeAmplop: "AMP-RSK-02",
    status: currentPos >= 2 ? (currentPos === 2 ? "in_progress" : "completed") : "locked",
    score: currentPos > 2 ? 88 - (groupNum - 1) * 2 : currentPos === 2 ? 65 : undefined,
    maxScore: 100,
    timeSpentFormatted: currentPos >= 2 ? "04:15" : "-",
    summaryAnswer: "3 Kartu Tertempel: Perdarahan Kontak, Keputihan Patologis, Multiparitas G2P1A0.",
    liveActivity: "Sedang drag & drop kartu 'Riwayat Penggunaan KB Suntik 3 Bulan' ke Papan Magnet.",
    details: {
      type: "magnet",
      items: [
        "Perdarahan Kontak Pasca Senggama (Post-Coital Bleeding)",
        "Keputihan Patologis Kental Kuning Kehijauan & Berbau",
        "Riwayat Multiparitas (G2P1A0)",
        "Penggunaan Kontrasepsi Hormonal Suntik",
      ],
    },
  },
  3: {
    pos: 3,
    name: "Pos 3: Prosedur IVA",
    kodeAmplop: "AMP-SOP-03",
    status: currentPos >= 3 ? (currentPos === 3 ? "in_progress" : "completed") : "locked",
    score: currentPos > 3 ? 95 - (groupNum - 1) * 4 : currentPos === 3 ? 70 : undefined,
    maxScore: 100,
    timeSpentFormatted: currentPos >= 3 ? "05:08" : "-",
    summaryAnswer: "Urutan Langkah 1-6 Tersusun Rapi Sesuai Standar Kemenkes RI.",
    liveActivity: "Sedang menggeser posisi Langkah 4 (Aplikasi Asam Asetat) di atas Langkah 5.",
    details: {
      type: "sequence",
      items: [
        "1. Informed consent, siapkan pencahayaan & cuci tangan 6 langkah",
        "2. Pasang spekulum cocor bebek secara perlahan",
        "3. Bersihkan porsio serviks dari lendir dengan lidi kapas steril",
        "4. Oleskan larutan asam asetat 3-5% secara merata",
        "5. Tunggu 1 menit & amati reaksi plak asetowhite pada SSK",
        "6. Lepaskan spekulum & rendam klorin 0.5%",
      ],
    },
  },
  4: {
    pos: 4,
    name: "Pos 4: Interpretasi Visual",
    kodeAmplop: "AMP-ITP-04",
    status: currentPos >= 4 ? (currentPos === 4 ? "in_progress" : "completed") : "locked",
    score: currentPos > 4 ? 90 - (groupNum - 1) * 3 : currentPos === 4 ? 80 : undefined,
    maxScore: 100,
    timeSpentFormatted: currentPos >= 4 ? "03:50" : "-",
    summaryAnswer: "Pilihan: C. IVA Positif (Ditemukan plak tebal warna putih pekat / Acetowhite tebal pada SSK).",
    liveActivity: "Sedang memperbesar (pinch zoom 240%) area batas SSK jam 12.",
    details: {
      type: "mcq",
      selectedOption: "C. IVA Positif (Ditemukan plak tebal warna putih pekat / Acetowhite tebal pada SSK)",
    },
  },
  5: {
    pos: 5,
    name: "Pos 5: Asuhan AI",
    kodeAmplop: "AMP-ASH-05",
    status: currentPos >= 5 ? (currentPos === 5 ? "in_progress" : "completed") : "locked",
    score: currentPos > 5 ? 89 - (groupNum - 1) * 2 : currentPos === 5 ? 60 : undefined,
    maxScore: 100,
    timeSpentFormatted: currentPos >= 5 ? "06:12" : "-",
    summaryAnswer: "Konseling empatik: Edukasi lesi pra-kanker dapat diobati tuntas, opsi krioterapi & rujukan SpOG.",
    liveActivity: "Sedang menjelaskan ke Ny. Ani: 'Ibu jangan takut ya, ini belum kanker...'",
    details: {
      type: "chat",
      chatMessages: [
        { sender: "Ny. Ani", text: "Bu Bidan... apakah saya terkena kanker ganas? Saya sangat takut..." },
        { sender: "Bidan", text: "Tenang ya Ibu Ani, hasil IVA positif bukan vonis kanker, melainkan deteksi dini lesi pra-kanker yang masih bisa disembuhkan tuntas." },
      ],
    },
  },
  6: {
    pos: 6,
    name: "Pos 6: Finish",
    kodeAmplop: "AMP-REC-06",
    status: currentPos >= 6 ? "completed" : "locked",
    score: currentPos >= 6 ? 94 - (groupNum - 1) * 3 : undefined,
    maxScore: 100,
    timeSpentFormatted: currentPos >= 6 ? "03:20" : "-",
    summaryAnswer: "Rekaman Laporan Suara Lengkap Selesai Dikirim ke Dewan Penguji (03:14).",
    liveActivity: currentPos === 6 ? "Rekaman Terkumpul & Selesai" : "Menunggu giliran perekaman",
    details: {
      type: "audio",
      audioDuration: "03:14 menit",
    },
  },
});
