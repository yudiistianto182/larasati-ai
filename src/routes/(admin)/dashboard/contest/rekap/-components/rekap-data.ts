import type { TrxResponseAnswerDetail } from "@/types/api";

export interface MahasiswaMember {
  id: string;
  nama: string;
  nim: string;
  peran: string;
}

export interface Stase1AnamnesisAnswer {
  transcripts: {
    sender: "bidan" | "pasien";
    message: string;
    timestamp: string;
    isKeyQuestion?: boolean;
  }[];
  keywordsFound: {
    keyword: string;
    kategori: string;
    skor: number;
    maxSkor: number;
    isMatched: boolean;
  }[];
  totalSkor: number;
  maxSkor: number;
  evaluatorNote: string;
}

export interface Stase2FaktorRisikoAnswer {
  selectedCards: {
    nama: string;
    isCorrect: boolean;
    skor: number;
  }[];
  missedCards: string[];
  distractorSelected: string[];
  totalSkor: number;
  maxSkor: number;
  evaluatorNote: string;
}

export interface Stase3ProsedurIvaAnswer {
  arrangedSteps: {
    order: number;
    expectedOrder: number;
    namaLangkah: string;
    isExactPosition: boolean;
    skor: number;
  }[];
  totalSkor: number;
  maxSkor: number;
  evaluatorNote: string;
}

export interface Stase4InterpretasiAnswer {
  selectedOption: string;
  optionLabel: string;
  isCorrect: boolean;
  totalSkor: number;
  skor: number;
  maxSkor: number;
  diagnosisSummary: string;
  evaluatorNote: string;
}

export interface Stase5AsuhanAiAnswer {
  transcripts: {
    sender: "bidan" | "pasien";
    message: string;
    timestamp: string;
  }[];
  counselingCriteria: {
    kriteria: string;
    deskripsi: string;
    skor: number;
    maxSkor: number;
    isFulfilled: boolean;
  }[];
  totalSkor: number;
  maxSkor: number;
  evaluatorNote: string;
}

export interface KelompokRekapData {
  id: string;
  nama: string;
  kasusId: string;
  kasusNama: string;
  waktuPengerjaan: string;
  rank: number;
  totalAkumulasi: number;
  maxTotalAkumulasi: number;
  rataRataSkor: number;
  totalSkor: number;
  predikat: "Sangat Kompeten" | "Kompeten" | "Perlu Bimbingan";
  status: "Lulus" | "Remedial";
  anggota: MahasiswaMember[];
  stase1: Stase1AnamnesisAnswer;
  stase2: Stase2FaktorRisikoAnswer;
  stase3: Stase3ProsedurIvaAnswer;
  stase4: Stase4InterpretasiAnswer;
  stase5: Stase5AsuhanAiAnswer;
}

export const REKAP_KELOMPOK_LIST: KelompokRekapData[] = [];

export const KUNCI_JAWABAN_STANDAR = {
  stase1: {
    title: "Pos 1: Anamnesis Klinis Terarah Pasien",
    durasi: "3 Menit",
    petunjuk: "Wawancara klinis terarah riwayat ginekologi & faktor risiko keganasan serviks.",
    bobotTotal: "20% dari Nilai Akhir",
    kunciPoin: [
      {
        nama: "Keluhan Keputihan Kronis & Berbau",
        bobot: 20,
        deskripsi: "Menggali sifat keputihan (warna, bau, durasi, gatal/tidak).",
      },
      {
        nama: "Perdarahan Kontak (Contact Bleeding / Post-Coital)",
        bobot: 25,
        deskripsi: "Wajib ditanyakan karena merupakan tanda kardinal patologi epitel serviks.",
      },
      {
        nama: "Riwayat Obstetri & Multiparitas (G5P4A0)",
        bobot: 20,
        deskripsi: "Menanyakan jumlah persalinan normal, abortus, dan usia kehamilan.",
      },
      {
        nama: "Riwayat Kontrasepsi (Pemakaian IUD > 8 Tahun)",
        bobot: 20,
        deskripsi: "Menanyakan jenis kontrasepsi yang sedang dipakai dan lama pemakaiannya.",
      },
      {
        nama: "Riwayat Skrining IVA/Pap Smear & Vaksinasi HPV",
        bobot: 15,
        deskripsi: "Menanyakan apakah pernah melakukan skrining sebelumnya dan riwayat imunisasi HPV.",
      },
    ],
  },
  stase2: {
    title: "Pos 2: Identifikasi Faktor Risiko (Papan Magnet)",
    durasi: "1 Menit",
    petunjuk: "Memilih dan menempelkan kartu faktor risiko yang terverifikasi dari riwayat pasien.",
    bobotTotal: "20% dari Nilai Akhir",
    kunciPoin: [
      {
        nama: "Perdarahan Kontak Pasca Koitus",
        bobot: 25,
        status: "Wajib Ditempel",
        deskripsi: "Faktor risiko patologis epitel serviks aktif.",
      },
      {
        nama: "Multiparitas Tinggi (G5P4A0)",
        bobot: 25,
        status: "Wajib Ditempel",
        deskripsi: "Trauma jalan lahir berulang meningkatkan paparan karsinogen.",
      },
      {
        nama: "Usia Menikah / Hubungan Seksual Pertama < 20 Tahun",
        bobot: 25,
        status: "Wajib Ditempel",
        deskripsi: "Epitel serviks muda (metaplasia imatur) sangat rentan infeksi onkogenik HPV.",
      },
      {
        nama: "Belum Pernah Skrining IVA / Pap Smear & Tidak Vaksinasi HPV",
        bobot: 25,
        status: "Wajib Ditempel",
        deskripsi: "Absennya deteksi dini menyebabkan lesi berkembang tanpa intervensi.",
      },
    ],
    distraktors: [
      "Riwayat Alergi Makanan Ringan (Bukan Faktor Risiko)",
      "Golongan Darah O Rhesus Positif (Bukan Faktor Risiko)",
      "Kebiasaan Konsumsi Teh Manis (Bukan Faktor Risiko)",
    ],
  },
  stase3: {
    title: "Pos 3: Prosedur Standar Tindakan IVA (SOP Kemenkes)",
    durasi: "1 Menit",
    petunjuk: "Menyusun urutan 6 langkah baku pemeriksaan IVA secara kronologis.",
    bobotTotal: "20% dari Nilai Akhir",
    kunciPoin: [
      {
        step: 1,
        nama: "Informed consent, penjelasan prosedur, dan cuci tangan 6 langkah",
        bobot: 15,
        keterangan: "Prinsip etika & pencegahan infeksi nosokomial.",
      },
      {
        step: 2,
        nama: "Pasang spekulum cocor bebek (Graves) hingga porsio serviks terlihat jelas",
        bobot: 20,
        keterangan: "Visualisasi porsio secara penuh dan fiksasi sekrup spekulum.",
      },
      {
        step: 3,
        nama: "Bersihkan lendir, darah, atau fluor albus dengan kapas lidi steril",
        bobot: 15,
        keterangan: "Lendir harus dibersihkan agar asam asetat dapat bereaksi langsung dengan epitel.",
      },
      {
        step: 4,
        nama: "Identifikasi Sambungan Skuamo-Kolumnar (SSK) secara menyeluruh",
        bobot: 15,
        keterangan: "Memastikan seluruh zona transformasi dapat dievaluasi.",
      },
      {
        step: 5,
        nama: "Oleskan asam asetat 3-5% secara merata pada porsio dan tunggu 1 menit",
        bobot: 20,
        keterangan: "Waktu reaksi 1 menit diperlukan untuk timbulnya efek asetowhite.",
      },
      {
        step: 6,
        nama: "Lepaskan spekulum secara hati-hati dan dekontaminasi alat dalam larutan klorin 0.5%",
        bobot: 15,
        keterangan: "Pencegahan infeksi pasca tindakan dan sterilisasi alat.",
      },
    ],
  },
  stase4: {
    title: "Pos 4: Interpretasi Temuan Visual & Diagnosis Klinis",
    durasi: "30 Detik",
    petunjuk: "Menganalisis foto serviks hasil asam asetat dan memilih opsi diagnosis yang tepat.",
    bobotTotal: "20% dari Nilai Akhir",
    jawabanBenar: "Opsi C — IVA Positif dengan Lesi Asetowhite Luas (>75% kuadran SSK)",
    bobotBenar: 100,
    pembahasan:
      "Tampak gambaran epitel asetowhite tebal (dense acetowhite epithelium) dengan batas tegas menutupi zona transformasi dan meluas melebihi 75% permukaan serviks. Gambaran ini mengindikasikan lesi pra-kanker derajat tinggi (CIN 2/3) yang membutuhkan rujukan spesialis obstetri & ginekologi.",
  },
  stase5: {
    title: "Pos 5: Asuhan Kebidanan & Konseling Empatik",
    durasi: "2 Menit",
    petunjuk: "Menyampaikan edukasi hasil pemeriksaan IVA dan konseling empatik kepada pasien virtual.",
    bobotTotal: "20% dari Nilai Akhir",
    kunciPoin: [
      {
        nama: "Komunikasi Terapeutik & Empati Aktif",
        bobot: 25,
        deskripsi: "Menenangkan pasien dari syok / kepanikan atas hasil positif.",
      },
      {
        nama: "Edukasi Bahwa IVA Positif BUKAN Vonis Kanker Ganas",
        bobot: 30,
        deskripsi: "Menegaskan bahwa ini adalah lesi pra-kanker yang dapat disembuhkan 100% dengan terapi tepat.",
      },
      {
        nama: "Penjelasan Rencana Tata Laksana & Rujukan SpOG",
        bobot: 25,
        deskripsi: "Menjelaskan metode penanganan lanjutan dan alur rujukan medis terpadu.",
      },
      {
        nama: "Prosedur Surat Rujukan SpOG & Pelibatan Pasangan (Suami)",
        bobot: 20,
        deskripsi: "Memberikan surat rujukan ke fasilitas lanjutan dan menganjurkan dukungan keluarga.",
      },
    ],
  },
};

/**
 * Mapper dari response detail API trx_response_answer ke model UI KelompokRekapData
 */
export function mapTrxResponseAnswerToKelompokRekap(
  detail: TrxResponseAnswerDetail,
  rank: number = 1,
): KelompokRekapData {
  // Map Pos 1 (Method 1 - Anamnesis)
  const pos1 = detail.pos?.find((p) => p.casequest_order === 1 || p.casequest_method_id === 1);
  const pos1Chats = Array.isArray(pos1?.answers?.chats) ? pos1.answers.chats : [];
  const pos1Triggers = Array.isArray(pos1?.answers?.triggers) ? pos1.answers.triggers : [];
  const pos1Score = pos1?.total_score ?? 0;

  // Map Pos 2 (Method 2 - MC Faktor Risiko)
  const pos2 = detail.pos?.find((p) => p.casequest_order === 2 || p.casequest_method_id === 2);
  const pos2Answers = Array.isArray(pos2?.answers) ? pos2.answers : [];
  const pos2Score = pos2?.total_score ?? 0;

  // Map Pos 3 (Method 3 - OS Prosedur IVA)
  const pos3 = detail.pos?.find((p) => p.casequest_order === 3 || p.casequest_method_id === 3);
  const pos3Answers = Array.isArray(pos3?.answers) ? pos3.answers : [];
  const pos3Score = pos3?.total_score ?? 0;

  // Map Pos 4 (Method 4 - Visual MCQ)
  const pos4 = detail.pos?.find((p) => p.casequest_order === 4 || p.casequest_method_id === 4);
  const pos4Answers = Array.isArray(pos4?.answers) ? pos4.answers : [];
  const pos4Score = pos4?.total_score ?? 0;

  // Map Pos 5 (Method 1 kedua / order 5 - Asuhan Kebidanan)
  const pos5 = detail.pos?.find(
    (p) => p.casequest_order === 5 || (p.casequest_method_id === 1 && p !== pos1),
  );
  const pos5Chats = Array.isArray(pos5?.answers?.chats) ? pos5.answers.chats : [];
  const pos5Triggers = Array.isArray(pos5?.answers?.triggers) ? pos5.answers.triggers : [];
  const pos5Score = pos5?.total_score ?? 0;

  const totalCalc =
    detail.calculated_total_score ??
    Math.round(parseFloat(detail.response_total_score || "0"));

  return {
    id: String(detail.response_id),
    nama: detail.contestteam_name || "Tim Peserta",
    kasusId: String(detail.response_case_id),
    kasusNama: detail.case_name || "Kasus Sirkuit",
    waktuPengerjaan: "07:45",
    rank,
    totalAkumulasi: totalCalc,
    maxTotalAkumulasi: 500,
    rataRataSkor: totalCalc / 5,
    totalSkor: totalCalc,
    predikat:
      totalCalc >= 400
        ? "Sangat Kompeten"
        : totalCalc >= 300
          ? "Kompeten"
          : "Perlu Bimbingan",
    status: totalCalc >= 300 ? "Lulus" : "Remedial",
    anggota: [
      {
        id: "m-1",
        nama: detail.contestteam_name || "Peserta Lomba",
        nim: "TIM-API",
        peran: "Ketua & Anggota Tim",
      },
    ],
    stase1: {
      transcripts: pos1Chats.map((c: any) => ({
        sender: c.responseia_sender === 1 ? "pasien" : "bidan",
        message: c.responseia_text,
        timestamp: c.chat_time || "10:00",
        isKeyQuestion: c.responseia_sender === 2,
      })),
      keywordsFound: pos1Triggers.map((t: any) => ({
        keyword: t.casequestiatrigger_key,
        kategori: t.casequestiatrigger_name,
        skor: parseFloat(t.responseiatrigger_score) || 10,
        maxSkor: 10,
        isMatched: true,
      })),
      totalSkor: pos1Score,
      maxSkor: 100,
      evaluatorNote: "Catatan: Fitur catatan evaluator dari juri belum disediakan API backend.",
    },
    stase2: {
      selectedCards: pos2Answers.map((a: any) => ({
        nama: a.casequestmc_name || `Faktor Risiko #${a.casequestmc_id}`,
        isCorrect: (a.score ?? 0) > 0,
        skor: a.score ?? 0,
      })),
      missedCards: [],
      distractorSelected: [],
      totalSkor: pos2Score,
      maxSkor: 100,
      evaluatorNote: "Pilihan faktor risiko tersimpan di basis data.",
    },
    stase3: {
      arrangedSteps: pos3Answers.map((a: any) => ({
        order: a.responseos_order ?? a.user_order ?? 1,
        expectedOrder: a.correct_order ?? 1,
        namaLangkah:
          a.casequestos_name || `Langkah SOP #${a.responseos_casequestos_id}`,
        isExactPosition:
          a.is_correct ?? a.responseos_order === a.correct_order,
        skor: parseFloat(String(a.responseos_score ?? a.score ?? 0)) || 0,
      })),
      totalSkor: pos3Score,
      maxSkor: 100,
      evaluatorNote: "Urutan langkah SOP berhasil diverifikasi sistem.",
    },
    stase4: {
      selectedOption:
        pos4Answers[0]?.casequestcioption_name || "Opsi Terpilih",
      optionLabel:
        pos4Answers[0]?.casequestcioption_name || "Hasil Diagnosis",
      isCorrect: (pos4Answers[0]?.score ?? 0) > 0,
      totalSkor: pos4Score,
      skor: pos4Score,
      maxSkor: 100,
      diagnosisSummary: "Interpretasi visual porsio serviks.",
      evaluatorNote: "Pilihan interpretasi visual tersimpan.",
    },
    stase5: {
      transcripts: pos5Chats.map((c: any) => ({
        sender: c.responseia_sender === 1 ? "pasien" : "bidan",
        message: c.responseia_text,
        timestamp: c.chat_time || "10:05",
      })),
      counselingCriteria: pos5Triggers.map((t: any) => ({
        kriteria: t.casequestiatrigger_name,
        deskripsi: t.casequestiatrigger_key,
        skor: parseFloat(t.responseiatrigger_score) || 20,
        maxSkor: 25,
        isFulfilled: true,
      })),
      totalSkor: pos5Score,
      maxSkor: 100,
      evaluatorNote: "Konseling interaktif selesai.",
    },
  };
}
