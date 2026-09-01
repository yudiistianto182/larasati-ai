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

export const REKAP_KELOMPOK_LIST: KelompokRekapData[] = [
  {
    id: "kel-01",
    nama: "Kelompok A",
    kasusId: "KSS-001",
    kasusNama: "Ny. Ani (45 Tahun) — Perdarahan Pasca Koitus & Multiparitas",
    waktuPengerjaan: "07 Menit 45 Detik",
    rank: 1,
    totalAkumulasi: 490,
    maxTotalAkumulasi: 500,
    rataRataSkor: 98.0,
    totalSkor: 490,
    predikat: "Sangat Kompeten",
    status: "Lulus",
    anggota: [
      { id: "mhs-01", nama: "Adinda Putri Maharani", nim: "21060120140001", peran: "Ketua Tim" },
      { id: "mhs-02", nama: "Bella Safira Ramadhani", nim: "21060120140002", peran: "Anggota 1" },
      { id: "mhs-03", nama: "Citra Dewi Lestari", nim: "21060120140003", peran: "Anggota 2" },
    ],
    stase1: {
      transcripts: [
        {
          sender: "bidan",
          message: "Selamat pagi Bu Ani, perkenalkan saya Bidan Adinda. Ada keluhan apa yang dirasakan belakangan ini?",
          timestamp: "00:15",
          isKeyQuestion: false,
        },
        {
          sender: "pasien",
          message: "Selamat pagi Bu Bidan. Saya sering mengalami keputihan yang berbau dan kadang terasa gatal sejak 2 bulan ini.",
          timestamp: "00:30",
        },
        {
          sender: "bidan",
          message: "Baik Bu Ani, apakah pernah mengalami perdarahan atau bercak darah, terutama setelah berhubungan seksual dengan suami?",
          timestamp: "00:52",
          isKeyQuestion: true,
        },
        {
          sender: "pasien",
          message: "Iya betul sekali Bu Bidan, beberapa kali keluar flek merah segar setelah senggama. Saya jadi agak takut...",
          timestamp: "01:10",
        },
        {
          sender: "bidan",
          message: "Bisa diceritakan riwayat kehamilan Ibu sebelumnya, sudah melahirkan berapa kali dan kapan menstruasi terakhir?",
          timestamp: "01:35",
          isKeyQuestion: true,
        },
        {
          sender: "pasien",
          message: "Saya sudah melahirkan 4 kali normal dan tidak pernah keguguran (G5P4A0). HPHT sekitar 2 minggu lalu dan siklus masih teratur.",
          timestamp: "01:55",
        },
        {
          sender: "bidan",
          message: "Apakah Ibu saat ini memakai alat kontrasepsi dan pernah melakukan pemeriksaan IVA atau Pap smear sebelumnya?",
          timestamp: "02:18",
          isKeyQuestion: true,
        },
        {
          sender: "pasien",
          message: "Saya pakai IUD/spiral sudah 8 tahunan Bu. Saya belum pernah periksa IVA ataupun vaksinasi kanker serviks.",
          timestamp: "02:40",
        },
      ],
      keywordsFound: [
        { keyword: "Keluhan Keputihan Patologis & Berbau", kategori: "Keluhan Utama", skor: 20, maxSkor: 20, isMatched: true },
        { keyword: "Perdarahan Kontak / Pasca Senggama", kategori: "Tanda Bahaya", skor: 25, maxSkor: 25, isMatched: true },
        { keyword: "Status Paritas & Riwayat Obstetri G5P4A0", kategori: "Riwayat Reproduksi", skor: 20, maxSkor: 20, isMatched: true },
        { keyword: "Penggunaan Kontrasepsi IUD > 8 Tahun", kategori: "Riwayat KB", skor: 20, maxSkor: 20, isMatched: true },
        { keyword: "Riwayat Skrining IVA & Vaksin HPV", kategori: "Riwayat Pencegahan", skor: 10, maxSkor: 15, isMatched: true },
      ],
      totalSkor: 95,
      maxSkor: 100,
      evaluatorNote: "Anamnesis sangat runtut, menggali seluruh faktor risiko kritis dengan komunikasi yang sopan dan terarah.",
    },
    stase2: {
      selectedCards: [
        { nama: "Perdarahan Kontak Pasca Koitus", isCorrect: true, skor: 25 },
        { nama: "Multiparitas Tinggi (G5P4A0)", isCorrect: true, skor: 25 },
        { nama: "Usia Menikah / Kontak Seksual Pertama < 20 Tahun", isCorrect: true, skor: 25 },
        { nama: "Belum Pernah Skrining IVA / Pap Smear & Tidak Vaksinasi HPV", isCorrect: true, skor: 25 },
      ],
      missedCards: [],
      distractorSelected: [],
      totalSkor: 100,
      maxSkor: 100,
      evaluatorNote: "Semua kartu faktor risiko patologi serviks ditempelkan dengan tepat tanpa ada kartu distraktor.",
    },
    stase3: {
      arrangedSteps: [
        { order: 1, expectedOrder: 1, namaLangkah: "Informed consent, penjelasan prosedur, dan cuci tangan 6 langkah", isExactPosition: true, skor: 15 },
        { order: 2, expectedOrder: 2, namaLangkah: "Pasang spekulum cocor bebek (Graves) hingga porsio serviks terlihat jelas", isExactPosition: true, skor: 20 },
        { order: 3, expectedOrder: 3, namaLangkah: "Bersihkan lendir, darah, atau fluor albus dengan kapas lidi steril", isExactPosition: true, skor: 15 },
        { order: 4, expectedOrder: 4, namaLangkah: "Identifikasi Sambungan Skuamo-Kolumnar (SSK) secara menyeluruh", isExactPosition: true, skor: 15 },
        { order: 5, expectedOrder: 5, namaLangkah: "Oleskan asam asetat 3-5% secara merata pada porsio dan tunggu 1 menit", isExactPosition: true, skor: 20 },
        { order: 6, expectedOrder: 6, namaLangkah: "Lepaskan spekulum secara hati-hati dan dekontaminasi alat dalam larutan klorin 0.5%", isExactPosition: true, skor: 15 },
      ],
      totalSkor: 100,
      maxSkor: 100,
      evaluatorNote: "Urutan SOP Prosedur IVA 100% sempurna sesuai standar Kementerian Kesehatan RI.",
    },
    stase4: {
      selectedOption: "C",
      optionLabel: "Opsi C — IVA Positif dengan Lesi Asetowhite Luas (>75% kuadran SSK)",
      isCorrect: true,
      totalSkor: 100,
      skor: 100,
      maxSkor: 100,
      diagnosisSummary: "Teridentifikasi plak asetowhite tebal, opak, berbatas tegas di area transformasi / SSK serviks pasca aplikasi asam asetat 3-5%.",
      evaluatorNote: "Ketepatan diagnosis visual sangat akurat. Menunjukkan pemahaman mendalam tentang kriteria IVA positif.",
    },
    stase5: {
      transcripts: [
        {
          sender: "bidan",
          message: "Ibu Ani, alhamdulillah pemeriksaannya sudah selesai. Saya sampaikan hasil pemeriksaannya dengan jelas ya Bu.",
          timestamp: "00:15",
        },
        {
          sender: "pasien",
          message: "Bagaimana hasilnya Bu Bidan? Apakah saya terkena kanker ganas?",
          timestamp: "00:25",
        },
        {
          sender: "bidan",
          message: "Ibu tidak perlu panik ya. Hasil IVA menunjukkan ada lesi putih atau bercak yang dinamakan lesi pra-kanker. Ini BUKAN kanker ganas, melainkan tanda awal yang justru bisa disembuhkan secara tuntas bila ditangani sejak dini.",
          timestamp: "00:50",
        },
        {
          sender: "pasien",
          message: "Alhamdulillah kalau masih bisa diobati... Lalu tindakan apa yang harus saya jalani selanjutnya Bu Bidan?",
          timestamp: "01:10",
        },
        {
          sender: "bidan",
          message: "Kami akan membuatkan surat rujukan ke Dokter Spesialis Kandungan (SpOG) di RSUD untuk pemeriksaan lanjutan dan penanganan krioterapi. Nanti Ibu didampingi oleh suami ya saat berkonsultasi.",
          timestamp: "01:38",
        },
      ],
      counselingCriteria: [
        { kriteria: "Komunikasi Empatik & Menenangkan", deskripsi: "Meredakan kecemasan dan memberikan rasa aman pada pasien", skor: 25, maxSkor: 25, isFulfilled: true },
        { kriteria: "Edukasi Lesi Pra-Kanker vs Kanker", deskripsi: "Menjelaskan bahwa IVA positif adalah lesi yang dapat disembuhkan", skor: 30, maxSkor: 30, isFulfilled: true },
        { kriteria: "Penjelasan Rencana Krioterapi / Tindakan", deskripsi: "Menjelaskan opsi penanganan terapi medis yang tersedia", skor: 20, maxSkor: 25, isFulfilled: true },
        { kriteria: "Prosedur Rujukan SpOG & Dukungan Keluarga", deskripsi: "Menyiapkan surat rujukan dan melibatkan pendampingan suami", skor: 20, maxSkor: 20, isFulfilled: true },
      ],
      totalSkor: 95,
      maxSkor: 100,
      evaluatorNote: "Penyampaian asuhan sangat menyejukkan, artikulasi jelas, penjelasan klinis akurat dan mudah dipahami pasien.",
    },
  },
  {
    id: "kel-02",
    nama: "Kelompok B",
    kasusId: "KSS-002",
    kasusNama: "Ny. B (38 Tahun) — Lesi Asetowhite Tidak Luas & Skrining Rutin",
    waktuPengerjaan: "08 Menit 30 Detik",
    rank: 2,
    totalAkumulasi: 430,
    maxTotalAkumulasi: 500,
    rataRataSkor: 86.0,
    totalSkor: 430,
    predikat: "Kompeten",
    status: "Lulus",
    anggota: [
      { id: "mhs-04", nama: "Dian Ayu Wardani", nim: "21060120140004", peran: "Ketua Tim" },
      { id: "mhs-05", nama: "Erna Wulandari", nim: "21060120140005", peran: "Anggota 1" },
      { id: "mhs-06", nama: "Fatimah Nur Azizah", nim: "21060120140006", peran: "Anggota 2" },
    ],
    stase1: {
      transcripts: [
        {
          sender: "bidan",
          message: "Halo Ibu, saya Bidan Dian. Ada keluhan apa yang membuat Ibu datang ke klinik kami?",
          timestamp: "00:20",
          isKeyQuestion: false,
        },
        {
          sender: "pasien",
          message: "Halo Bu Bidan. Saya merasa sering keputihan dan ingin periksa leher rahim karena tetangga saya ada yang kena tumor.",
          timestamp: "00:38",
        },
        {
          sender: "bidan",
          message: "Apakah saat berhubungan dengan suami ada rasa sakit atau keluar darah Bu?",
          timestamp: "01:02",
          isKeyQuestion: true,
        },
        {
          sender: "pasien",
          message: "Kadang ada sedikit flek kecokelatan kalau berhubungan pas capek Bu.",
          timestamp: "01:20",
        },
        {
          sender: "bidan",
          message: "Ibu anak ke berapa dan riwayat kehamilannya bagaimana?",
          timestamp: "01:45",
          isKeyQuestion: true,
        },
        {
          sender: "pasien",
          message: "Saya sudah punya 3 anak, semuanya lahir normal.",
          timestamp: "02:00",
        },
      ],
      keywordsFound: [
        { keyword: "Keluhan Keputihan Patologis & Berbau", kategori: "Keluhan Utama", skor: 20, maxSkor: 20, isMatched: true },
        { keyword: "Perdarahan Kontak / Pasca Senggama", kategori: "Tanda Bahaya", skor: 25, maxSkor: 25, isMatched: true },
        { keyword: "Status Paritas & Riwayat Obstetri G5P4A0", kategori: "Riwayat Reproduksi", skor: 20, maxSkor: 20, isMatched: true },
        { keyword: "Penggunaan Kontrasepsi IUD > 8 Tahun", kategori: "Riwayat KB", skor: 20, maxSkor: 20, isMatched: true },
        { keyword: "Riwayat Skrining IVA & Vaksin HPV", kategori: "Riwayat Pencegahan", skor: 0, maxSkor: 15, isMatched: false },
      ],
      totalSkor: 85,
      maxSkor: 100,
      evaluatorNote: "Wawancara cukup baik, namun lupa menanyakan riwayat skrining sebelumnya dan status vaksinasi HPV.",
    },
    stase2: {
      selectedCards: [
        { nama: "Perdarahan Kontak Pasca Koitus", isCorrect: true, skor: 25 },
        { nama: "Multiparitas Tinggi (G5P4A0)", isCorrect: true, skor: 25 },
        { nama: "Usia Menikah / Kontak Seksual Pertama < 20 Tahun", isCorrect: true, skor: 25 },
      ],
      missedCards: ["Belum Pernah Skrining IVA / Pap Smear & Tidak Vaksinasi HPV"],
      distractorSelected: [],
      totalSkor: 75,
      maxSkor: 100,
      evaluatorNote: "Tiga faktor risiko utama teridentifikasi, namun satu faktor risiko skrining terlewat di papan magnet.",
    },
    stase3: {
      arrangedSteps: [
        { order: 1, expectedOrder: 1, namaLangkah: "Informed consent, penjelasan prosedur, dan cuci tangan 6 langkah", isExactPosition: true, skor: 15 },
        { order: 2, expectedOrder: 2, namaLangkah: "Pasang spekulum cocor bebek (Graves) hingga porsio serviks terlihat jelas", isExactPosition: true, skor: 20 },
        { order: 3, expectedOrder: 4, namaLangkah: "Identifikasi Sambungan Skuamo-Kolumnar (SSK) secara menyeluruh", isExactPosition: false, skor: 10 },
        { order: 4, expectedOrder: 3, namaLangkah: "Bersihkan lendir, darah, atau fluor albus dengan kapas lidi steril", isExactPosition: false, skor: 10 },
        { order: 5, expectedOrder: 5, namaLangkah: "Oleskan asam asetat 3-5% secara merata pada porsio dan tunggu 1 menit", isExactPosition: true, skor: 20 },
        { order: 6, expectedOrder: 6, namaLangkah: "Lepaskan spekulum secara hati-hati dan dekontaminasi alat dalam larutan klorin 0.5%", isExactPosition: true, skor: 15 },
      ],
      totalSkor: 85,
      maxSkor: 100,
      evaluatorNote: "Langkah 3 dan 4 tertukar urutannya (seharusnya membersihkan lendir terlebih dahulu sebelum identifikasi SSK).",
    },
    stase4: {
      selectedOption: "C",
      optionLabel: "Opsi C — IVA Positif dengan Lesi Asetowhite Luas (>75% kuadran SSK)",
      isCorrect: true,
      totalSkor: 100,
      skor: 100,
      maxSkor: 100,
      diagnosisSummary: "Memilih jawaban Opsi C dengan benar pada visualisasi serviks asam asetat.",
      evaluatorNote: "Interpretasi gambar serviks tepat sasaran.",
    },
    stase5: {
      transcripts: [
        {
          sender: "bidan",
          message: "Ibu, hasil pemeriksaannya ada lesi putih ya, namanya IVA positif. Ibu harus dirujuk ke Rumah Sakit.",
          timestamp: "00:20",
        },
        {
          sender: "pasien",
          message: "Aduh Bu Bidan, apakah itu parah? Saya takut sekali kalau harus operasi...",
          timestamp: "00:35",
        },
        {
          sender: "bidan",
          message: "Jangan khawatir Bu, ini masih bisa ditangani oleh dokter spesialis kandungan. Nanti kami buatkan surat rujukan.",
          timestamp: "01:00",
        },
      ],
      counselingCriteria: [
        { kriteria: "Komunikasi Empatik & Menenangkan", deskripsi: "Meredakan kecemasan dan memberikan rasa aman pada pasien", skor: 20, maxSkor: 25, isFulfilled: true },
        { kriteria: "Edukasi Lesi Pra-Kanker vs Kanker", deskripsi: "Menjelaskan bahwa IVA positif adalah lesi yang dapat disembuhkan", skor: 25, maxSkor: 30, isFulfilled: true },
        { kriteria: "Penjelasan Rencana Krioterapi / Tindakan", deskripsi: "Menjelaskan opsi penanganan terapi medis yang tersedia", skor: 15, maxSkor: 25, isFulfilled: false },
        { kriteria: "Prosedur Rujukan SpOG & Dukungan Keluarga", deskripsi: "Menyiapkan surat rujukan dan melibatkan pendampingan suami", skor: 25, maxSkor: 20, isFulfilled: true },
      ],
      totalSkor: 85,
      maxSkor: 100,
      evaluatorNote: "Penyampaian rujukan baik, namun penjelasan edukasi mengenai tindakan krioterapi masih kurang mendalam.",
    },
  },
];

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
      "Tampak gambaran epitel asetowhite tebal (dense acetowhite epithelium) dengan batas tegas menutupi zona transformasi dan meluas melebihi 75% permukaan serviks. Gambaran ini mengindikasikan lesi pra-kanker derajat tinggi (CIN 2/3) yang membutuhkan penanganan krioterapi atau rujukan spesialis onkologi.",
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
        nama: "Penjelasan Rencana Krioterapi / Tata Laksana Lanjut",
        bobot: 25,
        deskripsi: "Menjelaskan metode pengobatan krioterapi (pembekuan sel abnormal) atau prosedur rujukan.",
      },
      {
        nama: "Prosedur Surat Rujukan SpOG & Pelibatan Pasangan (Suami)",
        bobot: 20,
        deskripsi: "Memberikan surat rujukan ke fasilitas lanjutan dan menganjurkan dukungan keluarga.",
      },
    ],
  },
};
