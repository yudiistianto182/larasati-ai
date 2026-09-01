export type LiveviewMode = "panoramic" | "parallax" | "matrix" | "leaderboard" | "detail" | "grid";

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
  pos: number; // 0: Perkenalan, 1..5: Pos 1..5, 5: Finish
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

export const CIRCUIT_WAYPOINTS: CircuitWaypoint[] = [
  {
    pos: 0,
    name: "Perkenalan",
    subtitle: "Briefing Awal",
    iconName: "flag",
    leftPct: 10,
    topPct: 27,
    isStart: true,
  },
  {
    pos: 1,
    name: "Anamnesis",
    subtitle: "Pasien",
    iconName: "mic",
    leftPct: 26,
    topPct: 63,
  },
  {
    pos: 2,
    name: "Faktor Risiko",
    subtitle: "Papan Magnet",
    iconName: "magnet",
    leftPct: 44,
    topPct: 33,
  },
  {
    pos: 3,
    name: "Prosedur IVA",
    subtitle: "Urutan SOP",
    iconName: "layers",
    leftPct: 61,
    topPct: 70,
  },
  {
    pos: 4,
    name: "Interpretasi",
    subtitle: "Visual MCQ",
    iconName: "image",
    leftPct: 77,
    topPct: 37,
  },
  {
    pos: 5,
    name: "Asuhan",
    subtitle: "Konseling Empatik",
    iconName: "trophy",
    leftPct: 91,
    topPct: 63,
    isFinish: true,
  },
];

export const DEFAULT_GROUPS_META: Record<
  number,
  { name: string; color: string; borderClass: string; badgeBg: string }
> = {
  1: {
    name: "Kelompok A (Ny. Ani)",
    color: "#fde047",
    borderClass: "border-[#fde047] shadow-[0_0_22px_rgba(253,224,71,0.9)] ring-2 ring-[#fde047]/60",
    badgeBg: "bg-[#fde047] text-black",
  },
  2: {
    name: "Kelompok B (Ny. B)",
    color: "#4ade80",
    borderClass: "border-[#4ade80] shadow-[0_0_22px_rgba(74,222,128,0.9)] ring-2 ring-[#4ade80]/60",
    badgeBg: "bg-[#4ade80] text-black",
  },
};

// Exact scores matching Rekap Penilaian:
// Kelompok A (1): Pos 1 = 100, Pos 2 = 100, Pos 3 = 95, Pos 4 = 100, Pos 5 = 95 => Total: 490 / 500 (Avg 98.0)
// Kelompok B (2): Pos 1 = 85,  Pos 2 = 75,  Pos 3 = 85, Pos 4 = 100, Pos 5 = 85 => Total: 430 / 500 (Avg 86.0)
export const INITIAL_MOCK_STASES_FACTORY = (
  currentPos: number,
  groupNum: number,
): Record<number, StaseDetailData> => {
  const isKelA = groupNum === 1;

  const getScore = (pos: number, targetScore: number) => {
    if (currentPos > pos) return targetScore;
    if (currentPos === pos) return targetScore;
    return undefined;
  };

  return {
    1: {
      pos: 1,
      name: "Pos 1: Anamnesis",
      kodeAmplop: "AMP-ANM-01",
      status: currentPos >= 1 ? (currentPos === 1 && currentPos < 5 ? "in_progress" : "completed") : "locked",
      score: getScore(1, isKelA ? 100 : 85),
      maxScore: 100,
      timeSpentFormatted: currentPos >= 1 ? (isKelA ? "01:30" : "01:40") : "-",
      summaryAnswer: isKelA
        ? "5 Keyword Lengkap Tergali: Keputihan patologis, perdarahan kontak, paritas G5P4A0, KB IUD 8 th, riwayat skrining."
        : "4 Keyword Tergali: Keputihan, flek kontak, paritas, KB IUD (lupa menanyakan riwayat skrining/vaksinasi HPV).",
      liveActivity: isKelA
        ? "Selesai: Anamnesis komprehensif berhasil mendapatkan seluruh keyword klinis Ny. Ani."
        : "Selesai: Anamnesis cukup baik namun terlewat menanyakan riwayat skrining.",
      details: {
        type: "chat",
        chatMessages: isKelA
          ? [
            { sender: "Bidan", text: "Selamat pagi Bu Ani, apakah pernah keluar flek darah setelah berhubungan dengan suami?" },
            { sender: "Ny. Ani", text: "Iya betul sekali Bu Bidan, beberapa kali keluar flek merah segar setelah senggama." },
            { sender: "Bidan", text: "Apakah Ibu sudah pernah skrining IVA atau vaksin kanker serviks sebelumnya?" },
            { sender: "Ny. Ani", text: "Belum pernah sama sekali Bu Bidan..." },
          ]
          : [
            { sender: "Bidan", text: "Halo Ibu, ada keluhan apa yang dirasakan belakangan ini?" },
            { sender: "Ny. B", text: "Saya sering keputihan dan kadang ada flek kecokelatan saat berhubungan." },
          ],
      },
    },
    2: {
      pos: 2,
      name: "Pos 2: Faktor Risiko",
      kodeAmplop: "AMP-RSK-02",
      status: currentPos >= 2 ? (currentPos === 2 && currentPos < 5 ? "in_progress" : "completed") : "locked",
      score: getScore(2, isKelA ? 100 : 75),
      maxScore: 100,
      timeSpentFormatted: currentPos >= 2 ? (isKelA ? "01:15" : "01:30") : "-",
      summaryAnswer: isKelA
        ? "4 Kartu Benar Tertempel: Perdarahan Kontak, Multiparitas G5P4A0, Menikah <20 Thn, Belum Skrining IVA."
        : "3 Kartu Tertempel: Perdarahan Kontak, Multiparitas, Menikah Muda (1 Kartu Skrining Terlewat).",
      liveActivity: isKelA
        ? "Selesai: 4/4 kartu faktor risiko berhasil ditempelkan ke papan magnet tanpa kartu distraktor."
        : "Selesai: 3 kartu tertempel, 1 kartu terlewat.",
      details: {
        type: "magnet",
        items: isKelA
          ? [
            "Perdarahan Kontak Pasca Koitus (Post-Coital Bleeding)",
            "Multiparitas Tinggi (G5P4A0)",
            "Usia Menikah / Kontak Seksual Pertama < 20 Tahun",
            "Belum Pernah Skrining IVA & Tidak Vaksinasi HPV",
          ]
          : [
            "Perdarahan Kontak Pasca Koitus",
            "Multiparitas Tinggi (G5P4A0)",
            "Usia Menikah < 20 Tahun",
          ],
      },
    },
    3: {
      pos: 3,
      name: "Pos 3: Prosedur IVA",
      kodeAmplop: "AMP-SOP-03",
      status: currentPos >= 3 ? (currentPos === 3 && currentPos < 5 ? "in_progress" : "completed") : "locked",
      score: getScore(3, isKelA ? 95 : 85),
      maxScore: 100,
      timeSpentFormatted: currentPos >= 3 ? (isKelA ? "01:45" : "02:00") : "-",
      summaryAnswer: isKelA
        ? "Urutan Langkah 1-6 Tersusun Sempurna Sesuai Standar Kemenkes RI."
        : "Urutan Langkah 1-6 Tersusun (Langkah 3 & 4 tertukar posisi).",
      liveActivity: isKelA
        ? "Selesai: Penyusunan alur SOP inspeksi visual asam asetat telah diverifikasi juri."
        : "Selesai: Urutan SOP terselesaikan dengan 1 koreksi posisi.",
      details: {
        type: "sequence",
        items: [
          "1. Informed consent, siapkan pencahayaan & cuci tangan 6 langkah",
          "2. Pasang spekulum cocor bebek secara perlahan hingga porsio terlihat",
          "3. Bersihkan lendir/darah dengan lidi kapas steril",
          "4. Oleskan asam asetat 3-5% secara merata pada porsio & SSK",
          "5. Tunggu 1 menit & amati reaksi plak asetowhite",
          "6. Lepaskan spekulum & dekontaminasi klorin 0.5%",
        ],
      },
    },
    4: {
      pos: 4,
      name: "Pos 4: Interpretasi Visual",
      kodeAmplop: "AMP-ITP-04",
      status: currentPos >= 4 ? (currentPos === 4 && currentPos < 5 ? "in_progress" : "completed") : "locked",
      score: getScore(4, 100),
      maxScore: 100,
      timeSpentFormatted: currentPos >= 4 ? (isKelA ? "01:10" : "01:20") : "-",
      summaryAnswer: "Pilihan Benar: C. IVA Positif dengan Lesi Asetowhite Luas (>75% kuadran SSK).",
      liveActivity: "Selesai: Jawaban diagnosis tepat sasaran (Opsi C).",
      details: {
        type: "mcq",
        selectedOption: "C. IVA Positif (Ditemukan plak tebal warna putih pekat / Acetowhite tebal pada SSK)",
      },
    },
    5: {
      pos: 5,
      name: "Pos 5: Asuhan",
      kodeAmplop: "AMP-ASH-05",
      status: currentPos >= 5 ? "completed" : "locked",
      score: getScore(5, isKelA ? 95 : 85),
      maxScore: 100,
      timeSpentFormatted: currentPos >= 5 ? (isKelA ? "02:05" : "02:00") : "-",
      summaryAnswer: isKelA
        ? "Konseling Empatik Sempurna: Edukasi lesi pra-kanker dapat diobati tuntas, opsi krioterapi & rujukan SpOG."
        : "Konseling Cukup Baik: Menjelaskan hasil IVA positif & menyiapkan surat rujukan SpOG.",
      liveActivity: isKelA
        ? "Selesai: Ny. Ani tenang dan memahami langkah rujukan ke RSUD."
        : "Selesai: Konseling asuhan selesai.",
      details: {
        type: "chat",
        chatMessages: isKelA
          ? [
            { sender: "Bidan", text: "Ibu Ani, hasil IVA menunjukkan adanya lesi pra-kanker. Ini bukan kanker ganas ya Bu, melainkan tanda awal yang bisa disembuhkan tuntas." },
            { sender: "Ny. Ani", text: "Alhamdulillah kalau masih bisa diobati... Terima kasih banyak Bu Bidan." },
            { sender: "Bidan", text: "Kami buatkan surat rujukan ke Dokter Spesialis Kandungan untuk pemeriksaan lanjutan dan krioterapi ya Bu." },
          ]
          : [
            { sender: "Bidan", text: "Ibu, hasil pemeriksaannya IVA positif dan perlu dirujuk ke Rumah Sakit." },
            { sender: "Ny. B", text: "Baik Bu Bidan, terima kasih atas penjelasannya." },
          ],
      },
    },
  };
};
