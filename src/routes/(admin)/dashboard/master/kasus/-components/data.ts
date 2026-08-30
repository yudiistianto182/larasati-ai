export interface KasusAttribute {
  id: string;
  key: string;
  value: string;
}

// Stase 1 & 5: AI Keyword Trigger item
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
  petunjuk_soal: string;
}

export interface StaseSoalData {
  // Stase 1: Anamnesis AI
  stase1: {
    header: StaseHeaderData;
    ai_system_prompt: string;
    triggers: AiKeywordTrigger[];
  };
  // Stase 2: Faktor Risiko
  stase2: {
    header: StaseHeaderData;
    faktor_risiko: FaktorRisikoItem[];
  };
  // Stase 3: Prosedur IVA
  stase3: {
    header: StaseHeaderData;
    langkah_prosedur: ProsedurStepItem[];
  };
  // Stase 4: Interpretasi
  stase4: {
    header: StaseHeaderData;
    images: Array<string | InterpretasiImageItem>;
    pilihan_jawaban: InterpretasiOption[];
  };
  // Stase 5: Asuhan Kebidanan
  stase5: {
    header: StaseHeaderData;
    ai_system_prompt: string;
    triggers: AiKeywordTrigger[];
  };
}

export interface Kasus {
  id: string;
  nama: string;
  deskripsi: string;
  teks_perkenalan: string;
  atribut: KasusAttribute[];
  pasien_ids: string[];
  soal_text?: string;
  stase_data: StaseSoalData;
  has_perekam_nilai: boolean;
  created_at: string;
}

export const DEFAULT_AI_SYSTEM_PROMPT = `Kamu adalah Ny. Ani (29 tahun), seorang pasien wanita hamil (G2P1A0) yang sedang melakukan anamnesis dengan seorang bidan.
Karakteristik kepribadian dan keluhan medis Anda:
- Anda adalah wanita yang sopan, kooperatif, menggunakan bahasa Indonesia yang santun.
- Keluhan utama Anda: mengalami keputihan patologis selama 2 minggu terakhir. Keputihan kental, berwarna kuning kehijauan, berbau amis menyengat, serta terasa gatal dan tidak nyaman pada area kewanitaan.
- Riwayat obstetri (paritas): Ini adalah kehamilan ke-2 Anda (G2P1A0). Anak pertama Anda laki-laki dan lahir normal.
- Gejala penyerta: Perut bagian bawah terasa pegal dan agak kram setelah beraktivitas lelah atau berdiri terlalu lama.`;

export function createDefaultStaseSoalData(): StaseSoalData {
  return {
    stase1: {
      header: {
        nama_stase: "Pos 1: Interaktif dengan AI (Anamnesis Pasien)",
        kode_amplop: "AMP-ANM-01",
        durasi_menit: 7,
        petunjuk_soal:
          "Lakukan wawancara klinis (anamnesis terarah) kepada pasien virtual. Ajukan pertanyaan seputar keluhan utama, riwayat reproduksi, pola haid, riwayat persalinan, serta gejala penyerta untuk menggali indikasi pemeriksaan IVA.",
      },
      ai_system_prompt: DEFAULT_AI_SYSTEM_PROMPT,
      triggers: [
        {
          id: "trg-1",
          konteks: "Menanyakan Riwayat Menstruasi & Siklus Haid",
          keyword: "HPHT, haid terakhir, siklus haid, keputihan, flek darah",
          skor: 10,
          jawaban_cadangan: "HPHT saya sekitar 3 bulan yang lalu Bu Bidan, siklus haid saya biasanya teratur 28 hari, tapi akhir-akhir ini ada keputihan yang sangat mengganggu.",
        },
        {
          id: "trg-2",
          konteks: "Menanyakan Riwayat Perdarahan Pasca Hubungan (Post-Coital Bleeding)",
          keyword: "darah setelah berhubungan, kontak seksual, perdarahan senggama",
          skor: 15,
          jawaban_cadangan: "Iya Bu Bidan, pernah ada flek bercak darah sedikit setelah berhubungan dengan suami minggu lalu.",
        },
        {
          id: "trg-3",
          konteks: "Menanyakan Riwayat Penggunaan Kontrasepsi",
          keyword: "KB, pil, suntik, IUD, implan, spiral",
          skor: 10,
          jawaban_cadangan: "Sebelumnya saya memakai KB suntik 3 bulan Bu, tapi sudah berhenti sekitar 1 tahun yang lalu.",
        },
      ],
    },
    stase2: {
      header: {
        nama_stase: "Pos 2: Multi Select Jawaban (Faktor Risiko)",
        kode_amplop: "AMP-RSK-02",
        durasi_menit: 5,
        petunjuk_soal:
          "Analisis dan tentukan faktor risiko yang dimiliki pasien berdasarkan hasil temuan anamnesis pada stase sebelumnya. Pilih keterkaitan syarat yang relevan untuk setiap temuan faktor risiko.",
      },
      faktor_risiko: [
        {
          id: "fkr-1",
          nama_jawaban: "Usia Pertama Kali Melakukan Hubungan Seksual < 20 Tahun",
          syarat_id: "tanpa_syarat",
          skor: 10,
        },
        {
          id: "fkr-2",
          nama_jawaban: "Riwayat Perdarahan Kontak (Post-Coital Bleeding Positif)",
          syarat_id: "trg-2",
          skor: 15,
        },
        {
          id: "fkr-3",
          nama_jawaban: "Paritas Tinggi (Multipara / Melahirkan > 3 Kali)",
          syarat_id: "tanpa_syarat",
          skor: 10,
        },
      ],
    },
    stase3: {
      header: {
        nama_stase: "Pos 3: Mengurutkan Langkah (SOP Prosedur IVA)",
        kode_amplop: "AMP-IVA-03",
        durasi_menit: 10,
        petunjuk_soal:
          "Susun dan laksanakan urutan langkah-langkah standar operasional prosedur (SOP) pemeriksaan IVA secara tepat, aseptik, dan sistematis.",
      },
      langkah_prosedur: [
        {
          id: "prc-1",
          nama_langkah: "Informed consent dan posisikan pasien pada meja ginekologi (posisi litotomi)",
          skor: 10,
          order: 1,
        },
        {
          id: "prc-2",
          nama_langkah: "Pasang spekulum cocor bebek (Cusco) secara tepat dan kunci hingga porsio terlihat jelas",
          skor: 15,
          order: 2,
        },
        {
          id: "prc-3",
          nama_langkah: "Bersihkan porsio dan cairan serviks dengan kapas lidi DTT secara lembut",
          skor: 10,
          order: 3,
        },
        {
          id: "prc-4",
          nama_langkah: "Celupkan lidi kapas ke dalam larutan asam asetat 3-5% dan oleskan merata ke seluruh permukaan serviks (SSK)",
          skor: 20,
          order: 4,
        },
        {
          id: "prc-5",
          nama_langkah: "Tunggu selama minimal 1 menit dan amati apakah timbul bercak putih (plak asetowhite)",
          skor: 20,
          order: 5,
        },
        {
          id: "prc-6",
          nama_langkah: "Lepaskan spekulum secara perlahan dan bereskan alat ke dalam larutan klorin 0.5%",
          skor: 10,
          order: 6,
        },
      ],
    },
    stase4: {
      header: {
        nama_stase: "Pos 4: Single Choice Image (Interpretasi Visual)",
        kode_amplop: "AMP-ITP-04",
        durasi_menit: 5,
        petunjuk_soal:
          "Perhatikan gambar hasil inspeksi serviks pasca aplikasi asam asetat 3-5%. Tentukan interpretasi klinis yang paling tepat dan pilih 1 jawaban kunci yang benar.",
      },
      images: [
        {
          id: "img-1",
          url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80",
          nama: "Foto Serviks Pasca Asam Asetat 3%",
          keterangan: "Tampak epitel kolumnar dan plak asetowhite tebal pada zona transformasi SSK jam 11 s.d. 02.",
        },
      ],
      pilihan_jawaban: [
        {
          id: "opt-1",
          label: "IVA Negatif: Serviks licin, merah muda merata, tidak terdapat epitel asetowhite.",
          is_correct: false,
          skor: 0,
        },
        {
          id: "opt-2",
          label: "IVA Positif: Tampak plak epitel asetowhite tebal berbatas tegas pada Sambungan Skuamo-Kolumnar (SSK).",
          is_correct: true,
          skor: 25,
        },
        {
          id: "opt-3",
          label: "Servisitis Akut: Eritema difus dengan eksudat mukopurulen tanpa plak putih.",
          is_correct: false,
          skor: 0,
        },
        {
          id: "opt-4",
          label: "Suspek Kanker Serviks Invasif: Massa eksofitik rapuh dan mudah berdarah.",
          is_correct: false,
          skor: 0,
        },
      ],
    },
    stase5: {
      header: {
        nama_stase: "Pos 5: Interaktif dengan AI (Konseling Asuhan)",
        kode_amplop: "AMP-ASH-05",
        durasi_menit: 8,
        petunjuk_soal:
          "Berikan konseling hasil pemeriksaan IVA kepada pasien dan tentukan rencana asuhan kebidanan berikutnya (edukasi krioterapi / rujukan ke SpOG / jadwal kontrol ulang).",
      },
      ai_system_prompt: DEFAULT_AI_SYSTEM_PROMPT,
      triggers: [
        {
          id: "trg-ash-1",
          konteks: "Menjelaskan Makna Hasil IVA Positif Secara Empatik",
          keyword: "bukan vonis kanker, lesi pra-kanker dini, masih bisa diobati tuntas",
          skor: 15,
          jawaban_cadangan: "Terima kasih penjelasannya Bu Bidan, jadi ini masih tahap awal dan bisa disembuhkan ya Bu? Saya tadi sempat takut sekali.",
        },
        {
          id: "trg-ash-2",
          konteks: "Menjelaskan Pilihan Terapi Krioterapi / Rujukan",
          keyword: "krioterapi, pembekuan gas medis, rujukan SpOG, rumah sakit",
          skor: 20,
          jawaban_cadangan: "Baik Bu Bidan, saya bersedia jika perlu dirujuk atau dilakukan tindakan krioterapi demi kesehatan saya.",
        },
        {
          id: "trg-ash-3",
          konteks: "Memberikan Edukasi Pola Hidup Bersih & Skrining Rutin",
          keyword: "setia pada satu pasangan, hindari merokok, kontrol ulang rutin, jaga kebersihan area kewanitaan",
          skor: 10,
          jawaban_cadangan: "Siap Bu Bidan, saya dan suami akan selalu menjaga kebersihan dan rutin kontrol sesuai jadwal.",
        },
      ],
    },
  };
}

export const fallbackKasus: Kasus[] = [
  {
    id: "KSS-001",
    nama: "Skrining Kanker Serviks & Deteksi Dini IVA Positif",
    deskripsi: "Skenario pemeriksaan lengkap IVA (Inspeksi Visual Asam Asetat) pada wanita usia subur dengan keluhan keputihan dan perdarahan kontak.",
    teks_perkenalan: "Anda bertugas di Poli KIA Puskesmas. Seorang wanita usia 32 tahun datang mengeluh keputihan berulang dan pernah mengalami flek setelah berhubungan suami istri.",
    atribut: [
      { id: "k-attr-1-1", key: "Diagnosis Utama", value: "Suspek Lesi Pra-Kanker Serviks (IVA Positif)" },
      { id: "k-attr-1-2", key: "Tingkat Kegawatan", value: "Pemeriksaan & Terapi Terencana" },
      { id: "k-attr-1-3", key: "Tindakan Medis", value: "Pemeriksaan IVA & Konseling Krioterapi" },
    ],
    pasien_ids: ["PSN-001", "PSN-002"],
    soal_text: "Laksanakan seluruh rangkaian 5 stase: Anamnesis AI, Identifikasi Faktor Risiko, SOP Prosedur IVA, Interpretasi Hasil Asetowhite, dan Asuhan Kebidanan lanjutan.",
    stase_data: createDefaultStaseSoalData(),
    has_perekam_nilai: true,
    created_at: "2026-08-20",
  },
  {
    id: "KSS-002",
    nama: "Deteksi Dini dan Asuhan Preeklampsia Ringan",
    deskripsi: "Studi kasus deteksi dini peningkatan tekanan darah pada kehamilan trimester 3 dan rujukan terencana.",
    teks_perkenalan: "Ibu hamil berusia 32 tahun datang untuk kunjungan ANC rutin trimester 3. Pasien mengeluh sering pusing ringan dan kedua tungkai bengkak sejak 3 hari yang lalu.",
    atribut: [
      { id: "k-attr-2-1", key: "Diagnosis Utama", value: "Suspek Preeklampsia Ringan" },
      { id: "k-attr-2-2", key: "Keluhan Utama", value: "Pusing dan Edema Ekstremitas" },
      { id: "k-attr-2-3", key: "Tingkat Kegawatan", value: "Perlu Stabilisasi & Rujukan" },
    ],
    pasien_ids: ["PSN-002"],
    soal_text: "Identifikasi tanda bahaya kehamilan, lakukan tes penunjang dasar (proteinuria), berikan konseling tanda bahaya, dan susun alur rujukan FAST.",
    stase_data: createDefaultStaseSoalData(),
    has_perekam_nilai: true,
    created_at: "2026-08-22",
  },
];
