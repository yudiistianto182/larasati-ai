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
  petunjuk_soal: string;
}

export interface StaseSoalData {
  // Stase 1: Anamnesis
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

export const DEFAULT_AI_SYSTEM_PROMPT = `Kamu adalah Ny. Ani (45 tahun), seorang pasien yang sedang melakukan anamnesis dengan seorang bidan di Poli KIA.
Karakteristik kepribadian dan keluhan medis Anda:
- Anda adalah wanita yang sopan, kooperatif, menggunakan bahasa Indonesia yang santun.
- Keluhan utama Anda: mengalami keputihan abnormal kronis dan perdarahan pasca berhubungan seksual.
- Riwayat paritas: G5P4A0, menikah di usia 18 tahun, menggunakan IUD selama 8 tahun.`;

export function createDefaultStaseSoalData(): StaseSoalData {
  return fallbackKasus[0].stase_data;
}

export const fallbackKasus: Kasus[] = [
  {
    "id": "KSS-001",
    "nama": "Ny. Ani (45 tahun) — LARASATI JOURNEY — CASE A",
    "deskripsi": "Pemeriksaan IVA dengan Hasil IVA Positif disertai Lesi Luas / Mencurigakan Keganasan",
    "teks_perkenalan": "Selamat datang di Midwife Clinic. Hari ini Anda bertugas sebagai Bidan. Seorang pasien (Ny. Ani, 45 tahun) datang dengan masalah kesehatan reproduksi.",
    "atribut": [
      {
        "id": "attr-KSS-001-1",
        "key": "Status Obstetri",
        "value": "G5P4A0 (multiparitas)"
      },
      {
        "id": "attr-KSS-001-2",
        "key": "Keluhan Utama",
        "value": "Keputihan abnormal dan perdarahan setelah berhubungan seksual"
      },
      {
        "id": "attr-KSS-001-3",
        "key": "Alasan Kedatangan",
        "value": "Datang untuk pemeriksaan IVA (Inspeksi Visual dengan Asam Asetat)"
      },
      {
        "id": "attr-KSS-001-4",
        "key": "Riwayat Kontrasepsi",
        "value": "Menggunakan IUD/AKDR sekitar 8 tahun"
      },
      {
        "id": "attr-KSS-001-5",
        "key": "Riwayat Skrining",
        "value": "Belum pernah melakukan IVA maupun Pap smear sebelumnya"
      },
      {
        "id": "attr-KSS-001-6",
        "key": "Riwayat Vaksinasi HPV",
        "value": "Belum pernah mendapatkan vaksinasi HPV"
      }
    ],
    "pasien_ids": [
      "PSN-001"
    ],
    "soal_text": "Laksanakan 5 stase sirkuit klinis kebidanan untuk Ny. Ani: Anamnesis, Deteksi Faktor Risiko, Prosedur IVA, Interpretasi Temuan, dan Asuhan Kebidanan Interaktif.",
    "stase_data": {
      "stase1": {
        "header": {
          "nama_stase": "Pos 1: Anamnesis Pasien",
          "kode_amplop": "AMP-ANM-A1",
          "durasi_menit": 7,
          "petunjuk_soal": "Gali data anamnesis Ny. Ani secara lengkap dan komunikatif melalui percakapan bertahap seputar kesehatan reproduksi pasien."
        },
        "ai_system_prompt": "Kamu adalah Ny. Ani, berusia 45 tahun, dengan status obstetri G5P4A0 (multiparitas).\nKeluhan: Keputihan abnormal dan perdarahan setelah berhubungan seksual.\nJawablah pertanyaan Bidan secara sopan, santun, dan komunikatif.",
        "triggers": [
          {
            "id": "trg-anm-case_a-1",
            "konteks": "Anamnesis Kategori 1: Riwayat keluhan",
            "keyword": "keluhan, keluhannya apa, kenapa datang, alasan datang, apa yang dirasakan, keputihan, berbau, bercampur darah, keluar darah, ada keluhan apa, sakit apa, keluhan utama, durasi",
            "skor": 10,
            "jawaban_cadangan": "Sudah 3 bulan ini saya keputihan, jumlahnya lebih banyak, berbau, warnanya kekuningan, kadang bercampur darah, dan beberapa kali keluar darah setelah berhubungan suami istri."
          },
          {
            "id": "trg-anm-case_a-2",
            "konteks": "Anamnesis Kategori 2: Riwayat menstruasi",
            "keyword": "haid, menstruasi, hpht, siklus haid, kapan terakhir haid, teratur, mens, datang bulan, berapa hari haid, siklusnya, darah haid",
            "skor": 10,
            "jawaban_cadangan": "Terakhir haid sekitar 2 minggu lalu, Bu. Siklus saya teratur, biasanya sekitar 7 hari."
          },
          {
            "id": "trg-anm-case_a-3",
            "konteks": "Anamnesis Kategori 3: Riwayat perkawinan/menikah",
            "keyword": "menikah, perkawinan, nikah, usia menikah, umur berapa menikah, pernikahan pertama, berapa kali menikah, bersuami, status pernikahan",
            "skor": 10,
            "jawaban_cadangan": "Saya menikah usia 18 tahun, Bu Bidan, dan ini pernikahan pertama saya."
          },
          {
            "id": "trg-anm-case_a-4",
            "konteks": "Anamnesis Kategori 4: Riwayat hubungan seksual",
            "keyword": "hubungan seksual, hubungan intim, berhubungan, bersenggama, setelah berhubungan, keluar darah setelah berhubungan, perdarahan kontak, nyeri senggama, dispareunia, aktif seksual",
            "skor": 10,
            "jawaban_cadangan": "Masih aktif, Bu, dan saya sudah beberapa kali mengalami perdarahan setelah berhubungan."
          },
          {
            "id": "trg-anm-case_a-5",
            "konteks": "Anamnesis Kategori 5: Riwayat obstetri/paritas (G5P4A0)",
            "keyword": "hamil, melahirkan, anak, paritas, persalinan, keguguran, gpa, gravida, berapa anak, berapa kali melahirkan, pernah keguguran, riwayat persalinan",
            "skor": 10,
            "jawaban_cadangan": "Sudah, Bu. Saya hamil 5 kali, melahirkan 4 kali, dan tidak pernah keguguran."
          },
          {
            "id": "trg-anm-case_a-6",
            "konteks": "Anamnesis Kategori 6: Riwayat kontrasepsi",
            "keyword": "kb, kontrasepsi, spiral, iud, pil kb, suntik kb, implan, susuk, kondom, pakai kb apa, alat kontrasepsi, sudah berapa lama kb, metode kb",
            "skor": 10,
            "jawaban_cadangan": "Saya pakai IUD/spiral, Bu, sudah kurang lebih 8 tahun."
          },
          {
            "id": "trg-anm-case_a-7",
            "konteks": "Anamnesis Kategori 7: Riwayat penyakit",
            "keyword": "penyakit, riwayat penyakit, pernah sakit apa, darah tinggi, hipertensi, diabetes, kencing manis, kanker, tumor, riwayat keluarga, minum obat, alergi, pms, infeksi menular, pengobatan",
            "skor": 10,
            "jawaban_cadangan": "Tidak ada riwayat penyakit tertentu, Bu, dan saat ini saya tidak sedang minum obat apa pun."
          },
          {
            "id": "trg-anm-case_a-8",
            "konteks": "Anamnesis Kategori 8: Riwayat skrining kanker serviks",
            "keyword": "skrining, iva, pap smear, periksa iva, tes iva, vaksin hpv, imunisasi hpv, suntik hpv, pernah periksa sebelumnya, deteksi dini, belum pernah iva",
            "skor": 10,
            "jawaban_cadangan": "Belum pernah sama sekali, Bu Bidan. Ini pertama kalinya."
          },
          {
            "id": "trg-anm-case_a-9",
            "konteks": "Anamnesis Kategori 9: Riwayat vaksinasi HPV",
            "keyword": "skrining, iva, pap smear, periksa iva, tes iva, vaksin hpv, imunisasi hpv, suntik hpv, pernah periksa sebelumnya, deteksi dini, belum pernah iva",
            "skor": 10,
            "jawaban_cadangan": "Belum pernah, Bu Bidan. Saya baru dengar tentang itu."
          }
        ]
      },
      "stase2": {
        "header": {
          "nama_stase": "Pos 2: Deteksi Faktor Risiko",
          "kode_amplop": "AMP-RSK-A2",
          "durasi_menit": 5,
          "petunjuk_soal": "Berdasarkan hasil anamnesis Ny. A, identifikasi dan pilih faktor-faktor risiko serta temuan penting yang perlu diwaspadai pada kasus ini."
        },
        "faktor_risiko": [
          {
            "id": "fkr-case_a-1",
            "nama_jawaban": "Usia 45 tahun",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_a-2",
            "nama_jawaban": "Menikah pada usia 18 tahun",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_a-3",
            "nama_jawaban": "G5P4A0",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_a-4",
            "nama_jawaban": "Belum pernah melakukan skrining IVA/Pap smear",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_a-5",
            "nama_jawaban": "Belum mendapatkan vaksinasi HPV",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_a-6",
            "nama_jawaban": "Keputihan abnormal dan berbau",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_a-7",
            "nama_jawaban": "Perdarahan setelah hubungan seksual",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_a-8",
            "nama_jawaban": "Riwayat operasi usus buntu",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          },
          {
            "id": "fkr-case_a-9",
            "nama_jawaban": "Tidak memiliki alergi obat",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          },
          {
            "id": "fkr-case_a-10",
            "nama_jawaban": "Pernikahan pertama",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          },
          {
            "id": "fkr-case_a-11",
            "nama_jawaban": "Siklus menstruasi teratur",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          },
          {
            "id": "fkr-case_a-12",
            "nama_jawaban": "Menggunakan IUD selama 8 tahun",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          },
          {
            "id": "fkr-case_a-13",
            "nama_jawaban": "Tidak memiliki riwayat penyakit tertentu",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          },
          {
            "id": "fkr-case_a-14",
            "nama_jawaban": "Tidak pernah mengalami keguguran",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          }
        ]
      },
      "stase3": {
        "header": {
          "nama_stase": "Pos 3: Prosedur IVA",
          "kode_amplop": "AMP-SOP-A3",
          "durasi_menit": 6,
          "petunjuk_soal": "Lakukan pemeriksaan IVA test dengan menyusun langkah-langkah Standar Operasional Prosedur (SOP) secara berurutan, aseptik, dan sistematis."
        },
        "langkah_prosedur": [
          {
            "id": "prc-case_a-1",
            "nama_langkah": "Bidan mencuci tangan dan menggunakan APD (alat pelindung diri)",
            "skor": 10,
            "order": 1
          },
          {
            "id": "prc-case_a-2",
            "nama_langkah": "Mempersiapkan alat dan memposisikan pasien pada posisi litotomi",
            "skor": 10,
            "order": 2
          },
          {
            "id": "prc-case_a-3",
            "nama_langkah": "Melakukan vulva hygiene",
            "skor": 10,
            "order": 3
          },
          {
            "id": "prc-case_a-4",
            "nama_langkah": "Memasang spekulum dengan benar",
            "skor": 10,
            "order": 4
          },
          {
            "id": "prc-case_a-5",
            "nama_langkah": "Melakukan inspeksi visual pada portio",
            "skor": 10,
            "order": 5
          },
          {
            "id": "prc-case_a-6",
            "nama_langkah": "Mengaplikasikan asam asetat 3–5% ke seluruh permukaan porsio",
            "skor": 10,
            "order": 6
          },
          {
            "id": "prc-case_a-7",
            "nama_langkah": "Mengamati perubahan pada serviks selama 1–2 menit",
            "skor": 10,
            "order": 7
          },
          {
            "id": "prc-case_a-8",
            "nama_langkah": "Membersihkan porsio dan melepaskan spekulum",
            "skor": 10,
            "order": 8
          },
          {
            "id": "prc-case_a-9",
            "nama_langkah": "Merapikan pasien dan mencuci tangan kembali",
            "skor": 10,
            "order": 9
          },
          {
            "id": "prc-case_a-10",
            "nama_langkah": "Melakukan pemeriksaan tanpa meminta persetujuan (informed consent) pasien",
            "skor": 0,
            "order": 99
          },
          {
            "id": "prc-case_a-11",
            "nama_langkah": "Mengoleskan asam asetat sebelum memasang spekulum",
            "skor": 0,
            "order": 99
          },
          {
            "id": "prc-case_a-12",
            "nama_langkah": "Mengulang pemberian asam asetat terus-menerus sampai seluruh serviks tampak putih",
            "skor": 0,
            "order": 99
          },
          {
            "id": "prc-case_a-13",
            "nama_langkah": "Langsung menyatakan pasien menderita kanker hanya berdasarkan tampilan serviks",
            "skor": 0,
            "order": 99
          }
        ]
      },
      "stase4": {
        "header": {
          "nama_stase": "Pos 4: Interpretasi Visual",
          "kode_amplop": "AMP-ITP-A4",
          "durasi_menit": 5,
          "petunjuk_soal": "Amati temuan visual serviks pasca aplikasi asam asetat 3–5% (tampak plak putih tebal, luas, berbatas tidak teratur, dan mudah berdarah), kemudian tentukan interpretasi diagnosis klinis yang tepat."
        },
        "images": [
          {
            "id": "img-case_a-1",
            "url": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80",
            "nama": "Foto Serviks Ny. A",
            "keterangan": "Amati temuan visual serviks pasca aplikasi asam asetat 3–5% (tampak plak putih tebal, luas, berbatas tidak teratur, dan mudah berdarah), kemudian tentukan interpretasi diagnosis klinis yang tepat."
          }
        ],
        "pilihan_jawaban": [
          {
            "id": "opt-case_a-1",
            "label": "IVA positif dengan lesi luas/mencurigakan keganasan.",
            "is_correct": true,
            "skor": 25
          },
          {
            "id": "opt-case_a-2",
            "label": "IVA negatif",
            "is_correct": false,
            "skor": 0
          },
          {
            "id": "opt-case_a-3",
            "label": "IVA positif dengan lesi tidak luas",
            "is_correct": false,
            "skor": 0
          },
          {
            "id": "opt-case_a-4",
            "label": "Pasien pasti menderita kanker serviks",
            "is_correct": false,
            "skor": 0
          },
          {
            "id": "opt-case_a-5",
            "label": "Tidak membutuhkan pemeriksaan lanjutan",
            "is_correct": false,
            "skor": 0
          },
          {
            "id": "opt-case_a-6",
            "label": "Cukup melakukan IVA ulang satu tahun kemudian",
            "is_correct": false,
            "skor": 0
          }
        ]
      },
      "stase5": {
        "header": {
          "nama_stase": "Pos 5: Asuhan Kebidanan & Konseling Interaktif",
          "kode_amplop": "AMP-ASH-A5",
          "durasi_menit": 8,
          "petunjuk_soal": "Berikan asuhan kebidanan dan konseling secara empatik kepada Ny. A: jelaskan bahwa hasil IVA positif lesi luas belum tentu kanker namun membutuhkan rujukan ke SpOG, berikan dukungan psikologis, siapkan surat rujukan, dan berikan edukasi pola hidup."
        },
        "ai_system_prompt": "Kamu adalah Ny. A, usia 45 tahun, dengan status obstetri G5P4A0 (multiparitas).\nKeluhan awalmu: Keputihan abnormal dan perdarahan setelah berhubungan seksual.\nKamu baru saja selesai diperiksa IVA oleh Bidan dan sedang berkonsultasi di Pos 5 untuk mendengarkan penjelasan hasil pemeriksaan, konseling, dan rencana tindak lanjut.\nKarakteristik kepribadian & emosi:\n- Merasa cemas terhadap hasil pemeriksaan namun sangat menghargai dan kooperatif terhadap saran bidan.\n- Berbahasa Indonesia yang sopan dan santun.\n- Ajukan pertanyaan klarifikasi jika Bidan menjelaskan tindakan medis (seperti rujukan SpOG atau krioterapi).",
        "triggers": [
          {
            "id": "trg-ai-ash-a-1",
            "konteks": "Menjelaskan hasil pemeriksaan kepada pasien dengan bahasa sederhana.",
            "keyword": "menjelaskan, hasil, pemeriksaan, pasien, bahasa",
            "skor": 14,
            "jawaban_cadangan": "Terima kasih penjelasannya Bu Bidan, jadi kondisi serviks saya seperti itu ya... Saya sempat khawatir sekali. Bagaimana langkah selanjutnya Bu?"
          },
          {
            "id": "trg-ai-ash-a-2",
            "konteks": "Menjelaskan bahwa hasil IVA positif dengan lesi luas belum berarti pasien pasti mengalami kanker.",
            "keyword": "menjelaskan, bahwa, hasil, positif, lesi",
            "skor": 14,
            "jawaban_cadangan": "Baik Bu Bidan, terima kasih atas penjelasan dan dukungannya. Saya memahami terkait \"Menjelaskan bahwa hasil IVA positif dengan lesi luas belum berarti pasien pasti mengalami kanker.\" dan bersedia mengikuti panduan Bu Bidan."
          },
          {
            "id": "trg-ai-ash-a-3",
            "konteks": "Memberikan dukungan dan kesempatan kepada pasien untuk menyampaikan kekhawatiran.",
            "keyword": "memberikan, dukungan, kesempatan, pasien, menyampaikan",
            "skor": 14,
            "jawaban_cadangan": "Baik Bu Bidan, terima kasih atas penjelasan dan dukungannya. Saya memahami terkait \"Memberikan dukungan dan kesempatan kepada pasien untuk menyampaikan kekhawatiran.\" dan bersedia mengikuti panduan Bu Bidan."
          },
          {
            "id": "trg-ai-ash-a-4",
            "konteks": "Melakukan kolaborasi dengan dokter.",
            "keyword": "melakukan, kolaborasi, dokter",
            "skor": 14,
            "jawaban_cadangan": "Baik Bu Bidan, terima kasih atas penjelasan dan dukungannya. Saya memahami terkait \"Melakukan kolaborasi dengan dokter.\" dan bersedia mengikuti panduan Bu Bidan."
          },
          {
            "id": "trg-ai-ash-a-5",
            "konteks": "Merujuk pasien untuk mendapatkan pemeriksaan/evaluasi diagnostik lebih lanjut sesuai indikasi.",
            "keyword": "merujuk, pasien, mendapatkan, pemeriksaanevaluasi, diagnostik",
            "skor": 14,
            "jawaban_cadangan": "Baik Bu Bidan, saya mengerti pentingnya rujukan ini demi penanganan dokter spesialis SpOG yang lebih pasti. Saya dan keluarga akan segera mengurus rujukan ke rumah sakit."
          },
          {
            "id": "trg-ai-ash-a-6",
            "konteks": "Memastikan pasien memahami rencana rujukan dan tindak lanjut.",
            "keyword": "memastikan, pasien, memahami, rencana, rujukan",
            "skor": 14,
            "jawaban_cadangan": "Baik Bu Bidan, saya mengerti pentingnya rujukan ini demi penanganan dokter spesialis SpOG yang lebih pasti. Saya dan keluarga akan segera mengurus rujukan ke rumah sakit."
          },
          {
            "id": "trg-ai-ash-a-7",
            "konteks": "Mendokumentasikan hasil pemeriksaan, edukasi, kolaborasi, dan rujukan.",
            "keyword": "mendokumentasikan, hasil, pemeriksaan, edukasi, kolaborasi",
            "skor": 14,
            "jawaban_cadangan": "Baik Bu Bidan, saya mengerti pentingnya rujukan ini demi penanganan dokter spesialis SpOG yang lebih pasti. Saya dan keluarga akan segera mengurus rujukan ke rumah sakit."
          }
        ]
      }
    },
    "has_perekam_nilai": true,
    "created_at": "2026-08-31"
  },
  {
    "id": "KSS-002",
    "nama": "Ny. B (38 tahun) — LARASATI JOURNEY — CASE B",
    "deskripsi": "Pemeriksaan IVA dengan Hasil IVA Positif Lesi Tidak Luas (Belum Mencurigakan Keganasan)",
    "teks_perkenalan": "Selamat datang di Midwife Clinic. Hari ini Anda bertugas sebagai Bidan. Seorang pasien (Ny. B, 38 tahun) datang dengan masalah kesehatan reproduksi atas anjuran kader Posyandu.",
    "atribut": [
      {
        "id": "attr-KSS-002-1",
        "key": "Status Obstetri",
        "value": "multiparitas"
      },
      {
        "id": "attr-KSS-002-2",
        "key": "Keluhan Utama",
        "value": "Keputihan berbau dan gatal, disertai nyeri perut bagian bawah"
      },
      {
        "id": "attr-KSS-002-3",
        "key": "Alasan Kedatangan",
        "value": "Datang untuk pemeriksaan IVA (Inspeksi Visual dengan Asam Asetat) atas anjuran kader kesehatan"
      },
      {
        "id": "attr-KSS-002-4",
        "key": "Riwayat Kontrasepsi",
        "value": "Menggunakan IUD/AKDR"
      },
      {
        "id": "attr-KSS-002-5",
        "key": "Riwayat Skrining",
        "value": "Belum pernah melakukan IVA maupun Pap smear sebelumnya"
      },
      {
        "id": "attr-KSS-002-6",
        "key": "Riwayat Vaksinasi HPV",
        "value": "Belum pernah mendapatkan vaksinasi HPV"
      }
    ],
    "pasien_ids": [
      "PSN-002"
    ],
    "soal_text": "Laksanakan 5 stase sirkuit klinis kebidanan untuk Ny. B: Anamnesis, Deteksi Faktor Risiko, Prosedur IVA, Interpretasi Temuan, dan Asuhan Kebidanan Interaktif.",
    "stase_data": {
      "stase1": {
        "header": {
          "nama_stase": "Pos 1: Anamnesis Pasien",
          "kode_amplop": "AMP-ANM-B1",
          "durasi_menit": 7,
          "petunjuk_soal": "Lakukan wawancara klinis anamnesis kepada Ny. B untuk menggali seluruh kesehatan reproduksi dan keluhan yang dirasakan."
        },
        "ai_system_prompt": "Kamu adalah Ny. B, berusia 38 tahun, dengan status obstetri multiparitas.\nKeluhan: Keputihan berbau dan gatal, disertai nyeri perut bagian bawah.\nJawablah pertanyaan Bidan secara sopan, santun, dan komunikatif.",
        "triggers": [
          {
            "id": "trg-anm-case_b-1",
            "konteks": "Anamnesis Kategori 1: Riwayat keluhan",
            "keyword": "keluhan, keluhannya apa, kenapa datang, alasan datang, apa yang dirasakan, keputihan, berbau, bercampur darah, keluar darah, ada keluhan apa, sakit apa, keluhan utama, durasi",
            "skor": 10,
            "jawaban_cadangan": "Ini lho, Bu Bidan, sudah beberapa bulan ini keputihan saya beda, warnanya kekuningan, baunya nggak enak, terus gatal. Perut bagian bawah juga kadang nyeri."
          },
          {
            "id": "trg-anm-case_b-2",
            "konteks": "Anamnesis Kategori 2: Riwayat menstruasi",
            "keyword": "haid, menstruasi, hpht, siklus haid, kapan terakhir haid, teratur, mens, datang bulan, berapa hari haid, siklusnya, darah haid",
            "skor": 10,
            "jawaban_cadangan": "Terakhir haid 2 minggu lalu, Bu. Siklus saya normal, biasanya 7 hari."
          },
          {
            "id": "trg-anm-case_b-3",
            "konteks": "Anamnesis Kategori 3: Riwayat perkawinan/menikah",
            "keyword": "menikah, perkawinan, nikah, usia menikah, umur berapa menikah, pernikahan pertama, berapa kali menikah, bersuami, status pernikahan",
            "skor": 10,
            "jawaban_cadangan": "Saya menikah umur 19 tahun, Bu Bidan, ini pernikahan pertama saya."
          },
          {
            "id": "trg-anm-case_b-4",
            "konteks": "Anamnesis Kategori 4: Riwayat hubungan seksual",
            "keyword": "hubungan seksual, hubungan intim, berhubungan, bersenggama, setelah berhubungan, keluar darah setelah berhubungan, perdarahan kontak, nyeri senggama, dispareunia, aktif seksual",
            "skor": 10,
            "jawaban_cadangan": "Terakhir 3 hari yang lalu, Bu, nggak ada keluhan apa-apa waktu itu."
          },
          {
            "id": "trg-anm-case_b-5",
            "konteks": "Anamnesis Kategori 5: Riwayat obstetri/paritas (G4P4A0)",
            "keyword": "hamil, melahirkan, anak, paritas, persalinan, keguguran, gpa, gravida, berapa anak, berapa kali melahirkan, pernah keguguran, riwayat persalinan",
            "skor": 10,
            "jawaban_cadangan": "Anak saya empat, Bu, nggak pernah keguguran. Anak terakhir sekarang umurnya 7 tahun."
          },
          {
            "id": "trg-anm-case_b-6",
            "konteks": "Anamnesis Kategori 6: Riwayat kontrasepsi",
            "keyword": "kb, kontrasepsi, spiral, iud, pil kb, suntik kb, implan, susuk, kondom, pakai kb apa, alat kontrasepsi, sudah berapa lama kb, metode kb",
            "skor": 10,
            "jawaban_cadangan": "Saya pakai IUD/spiral, Bu Bidan."
          },
          {
            "id": "trg-anm-case_b-7",
            "konteks": "Anamnesis Kategori 7: Riwayat penyakit",
            "keyword": "penyakit, riwayat penyakit, pernah sakit apa, darah tinggi, hipertensi, diabetes, kencing manis, kanker, tumor, riwayat keluarga, minum obat, alergi, pms, infeksi menular, pengobatan",
            "skor": 10,
            "jawaban_cadangan": "Nggak ada riwayat penyakit menular seksual, Bu, saya juga nggak lagi minum obat apa-apa. Keluarga juga nggak ada yang kena kanker."
          },
          {
            "id": "trg-anm-case_b-8",
            "konteks": "Anamnesis Kategori 8: Riwayat pemenuhan kebutuhan sehari-hari",
            "keyword": "kebiasaan, pola hidup, makan, minum, olahraga, sabun kewanitaan, pembersih kewanitaan, cebok, douching, merokok, aktivitas sehari-hari, pola makan, higienitas",
            "skor": 10,
            "jawaban_cadangan": "Saya suka makanan pedas, minum air putih sekitar 2 liter sehari, tapi jarang banget olahraga, Bu."
          },
          {
            "id": "trg-anm-case_b-9",
            "konteks": "Anamnesis Kategori 9: Riwayat skrining kanker serviks dan imunisasi HPV",
            "keyword": "skrining, iva, pap smear, periksa iva, tes iva, vaksin hpv, imunisasi hpv, suntik hpv, pernah periksa sebelumnya, deteksi dini, belum pernah iva",
            "skor": 10,
            "jawaban_cadangan": "Belum pernah sama sekali, Bu Bidan. IVA belum, vaksin HPV juga belum pernah."
          }
        ]
      },
      "stase2": {
        "header": {
          "nama_stase": "Pos 2: Deteksi Faktor Risiko",
          "kode_amplop": "AMP-RSK-B2",
          "durasi_menit": 5,
          "petunjuk_soal": "Berdasarkan hasil anamnesis Ny. B, identifikasi faktor risiko dan temuan klinis yang relevan dengan indikasi pemeriksaan IVA."
        },
        "faktor_risiko": [
          {
            "id": "fkr-case_b-1",
            "nama_jawaban": "Menikah pada usia 19 tahun",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_b-2",
            "nama_jawaban": "G4P4A0",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_b-3",
            "nama_jawaban": "Keputihan berbau dan gatal",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_b-4",
            "nama_jawaban": "Nyeri perut bagian bawah",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_b-5",
            "nama_jawaban": "Belum pernah melakukan skrining IVA/Pap smear",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_b-6",
            "nama_jawaban": "Belum mendapatkan vaksinasi HPV",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_b-7",
            "nama_jawaban": "Jarang berolahraga",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_b-8",
            "nama_jawaban": "Suka makanan pedas",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          },
          {
            "id": "fkr-case_b-9",
            "nama_jawaban": "Pernikahan pertama",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          },
          {
            "id": "fkr-case_b-10",
            "nama_jawaban": "Siklus menstruasi teratur",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          },
          {
            "id": "fkr-case_b-11",
            "nama_jawaban": "Menggunakan KB IUD",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          },
          {
            "id": "fkr-case_b-12",
            "nama_jawaban": "Tidak memiliki riwayat penyakit tertentu",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          },
          {
            "id": "fkr-case_b-13",
            "nama_jawaban": "Tidak pernah mengalami keguguran",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          },
          {
            "id": "fkr-case_b-14",
            "nama_jawaban": "Minum air putih sekitar 2 liter sehari",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          }
        ]
      },
      "stase3": {
        "header": {
          "nama_stase": "Pos 3: Prosedur IVA",
          "kode_amplop": "AMP-SOP-B3",
          "durasi_menit": 6,
          "petunjuk_soal": "Susun langkah-langkah standar operasional prosedur (SOP) pemeriksaan IVA secara tepat dan berurutan dari persiapan hingga pasca tindakan."
        },
        "langkah_prosedur": [
          {
            "id": "prc-case_b-1",
            "nama_langkah": "Bidan mencuci tangan dan menggunakan APD (alat pelindung diri)",
            "skor": 10,
            "order": 1
          },
          {
            "id": "prc-case_b-2",
            "nama_langkah": "Mempersiapkan alat dan memposisikan pasien pada posisi litotomi",
            "skor": 10,
            "order": 2
          },
          {
            "id": "prc-case_b-3",
            "nama_langkah": "Melakukan vulva hygiene",
            "skor": 10,
            "order": 3
          },
          {
            "id": "prc-case_b-4",
            "nama_langkah": "Memasang spekulum dengan benar",
            "skor": 10,
            "order": 4
          },
          {
            "id": "prc-case_b-5",
            "nama_langkah": "Melakukan inspeksi visual pada portio",
            "skor": 10,
            "order": 5
          },
          {
            "id": "prc-case_b-6",
            "nama_langkah": "Mengaplikasikan asam asetat 3–5% ke seluruh permukaan porsio",
            "skor": 10,
            "order": 6
          },
          {
            "id": "prc-case_b-7",
            "nama_langkah": "Mengamati perubahan pada serviks selama 1–2 menit",
            "skor": 10,
            "order": 7
          },
          {
            "id": "prc-case_b-8",
            "nama_langkah": "Membersihkan porsio dan melepaskan spekulum",
            "skor": 10,
            "order": 8
          },
          {
            "id": "prc-case_b-9",
            "nama_langkah": "Merapikan pasien dan mencuci tangan kembali",
            "skor": 10,
            "order": 9
          },
          {
            "id": "prc-case_b-10",
            "nama_langkah": "Melakukan pemeriksaan tanpa meminta persetujuan (informed consent) pasien",
            "skor": 0,
            "order": 99
          },
          {
            "id": "prc-case_b-11",
            "nama_langkah": "Mengoleskan asam asetat sebelum memasang spekulum",
            "skor": 0,
            "order": 99
          },
          {
            "id": "prc-case_b-12",
            "nama_langkah": "Mengulang pemberian asam asetat terus-menerus sampai seluruh serviks tampak putih",
            "skor": 0,
            "order": 99
          },
          {
            "id": "prc-case_b-13",
            "nama_langkah": "Langsung menyatakan pasien menderita kanker hanya berdasarkan tampilan serviks",
            "skor": 0,
            "order": 99
          }
        ]
      },
      "stase4": {
        "header": {
          "nama_stase": "Pos 4: Interpretasi Visual",
          "kode_amplop": "AMP-ITP-B4",
          "durasi_menit": 5,
          "petunjuk_soal": "Amati temuan visual serviks pasca asam asetat 3–5% (tampak plak putih tipis berbatas tegas hanya pada sebagian kecil serviks dan tidak rapuh), lalu tentukan interpretasi hasil pemeriksaan."
        },
        "images": [
          {
            "id": "img-case_b-1",
            "url": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80",
            "nama": "Foto Serviks Ny. B",
            "keterangan": "Amati temuan visual serviks pasca asam asetat 3–5% (tampak plak putih tipis berbatas tegas hanya pada sebagian kecil serviks dan tidak rapuh), lalu tentukan interpretasi hasil pemeriksaan."
          }
        ],
        "pilihan_jawaban": [
          {
            "id": "opt-case_b-1",
            "label": "IVA positif dengan lesi tidak luas.",
            "is_correct": true,
            "skor": 25
          },
          {
            "id": "opt-case_b-2",
            "label": "IVA negatif",
            "is_correct": false,
            "skor": 0
          },
          {
            "id": "opt-case_b-3",
            "label": "IVA positif dengan lesi luas/mencurigakan keganasan",
            "is_correct": false,
            "skor": 0
          },
          {
            "id": "opt-case_b-4",
            "label": "Pasien pasti menderita kanker serviks",
            "is_correct": false,
            "skor": 0
          },
          {
            "id": "opt-case_b-5",
            "label": "Tidak perlu tindakan apa pun, cukup diobservasi",
            "is_correct": false,
            "skor": 0
          },
          {
            "id": "opt-case_b-6",
            "label": "Harus langsung dirujuk ke SpOG tanpa penjelasan awal",
            "is_correct": false,
            "skor": 0
          }
        ]
      },
      "stase5": {
        "header": {
          "nama_stase": "Pos 5: Asuhan Kebidanan & Konseling Interaktif",
          "kode_amplop": "AMP-ASH-B5",
          "durasi_menit": 8,
          "petunjuk_soal": "Berikan konseling asuhan kebidanan kepada Ny. B: jelaskan bahwa hasil IVA positif lesi tidak luas ini belum tentu kanker dan dapat ditangani dengan krioterapi di faskes primer, jelaskan prosedur tindakan, serta jadwalkan evaluasi kontrol berkala."
        },
        "ai_system_prompt": "Kamu adalah Ny. B, usia 38 tahun, dengan status obstetri multiparitas.\nKeluhan awalmu: Keputihan berbau dan gatal, disertai nyeri perut bagian bawah.\nKamu baru saja selesai diperiksa IVA oleh Bidan dan sedang berkonsultasi di Pos 5 untuk mendengarkan penjelasan hasil pemeriksaan, konseling, dan rencana tindak lanjut.\nKarakteristik kepribadian & emosi:\n- Merasa cemas terhadap hasil pemeriksaan namun sangat menghargai dan kooperatif terhadap saran bidan.\n- Berbahasa Indonesia yang sopan dan santun.\n- Ajukan pertanyaan klarifikasi jika Bidan menjelaskan tindakan medis (seperti rujukan SpOG atau krioterapi).",
        "triggers": [
          {
            "id": "trg-ai-ash-b-1",
            "konteks": "Menjelaskan hasil pemeriksaan IVA kepada pasien dengan bahasa yang mudah dipahami.",
            "keyword": "menjelaskan, hasil, pemeriksaan, pasien, bahasa",
            "skor": 14,
            "jawaban_cadangan": "Terima kasih penjelasannya Bu Bidan, jadi kondisi serviks saya seperti itu ya... Saya sempat khawatir sekali. Bagaimana langkah selanjutnya Bu?"
          },
          {
            "id": "trg-ai-ash-b-2",
            "konteks": "Menjelaskan bahwa hasil IVA positif dengan lesi tidak luas ini belum tentu kanker, namun tetap perlu ditangani.",
            "keyword": "menjelaskan, bahwa, hasil, positif, lesi",
            "skor": 14,
            "jawaban_cadangan": "Baik Bu Bidan, terima kasih atas penjelasan dan dukungannya. Saya memahami terkait \"Menjelaskan bahwa hasil IVA positif dengan lesi tidak luas ini belum tentu kanker, namun tetap perlu ditangani.\" dan bersedia mengikuti panduan Bu Bidan."
          },
          {
            "id": "trg-ai-ash-b-3",
            "konteks": "Memberikan kesempatan kepada pasien untuk bertanya dan menyampaikan kekhawatirannya.",
            "keyword": "memberikan, kesempatan, pasien, bertanya, menyampaikan",
            "skor": 14,
            "jawaban_cadangan": "Baik Bu Bidan, terima kasih atas penjelasan dan dukungannya. Saya memahami terkait \"Memberikan kesempatan kepada pasien untuk bertanya dan menyampaikan kekhawatirannya.\" dan bersedia mengikuti panduan Bu Bidan."
          },
          {
            "id": "trg-ai-ash-b-4",
            "konteks": "Melakukan kolaborasi dengan dokter terkait rencana tindakan krioterapi.",
            "keyword": "melakukan, kolaborasi, dokter, terkait, rencana",
            "skor": 14,
            "jawaban_cadangan": "Apakah prosedur krioterapi (gas pendingin) itu aman dan bisa langsung menyembuhkan sel serviks saya Bu? Saya bersedia jika itu yang terbaik."
          },
          {
            "id": "trg-ai-ash-b-5",
            "konteks": "Menganjurkan/melakukan tindakan krioterapi sesuai indikasi.",
            "keyword": "menganjurkanmelakukan, tindakan, krioterapi, sesuai, indikasi",
            "skor": 14,
            "jawaban_cadangan": "Apakah prosedur krioterapi (gas pendingin) itu aman dan bisa langsung menyembuhkan sel serviks saya Bu? Saya bersedia jika itu yang terbaik."
          },
          {
            "id": "trg-ai-ash-b-6",
            "konteks": "Melakukan evaluasi untuk memastikan pasien memahami penjelasan dan rencana tindak lanjut.",
            "keyword": "melakukan, evaluasi, memastikan, pasien, memahami",
            "skor": 14,
            "jawaban_cadangan": "Baik Bu Bidan, terima kasih atas penjelasan dan dukungannya. Saya memahami terkait \"Melakukan evaluasi untuk memastikan pasien memahami penjelasan dan rencana tindak lanjut.\" dan bersedia mengikuti panduan Bu Bidan."
          },
          {
            "id": "trg-ai-ash-b-7",
            "konteks": "Mendokumentasikan hasil pemeriksaan, edukasi, dan rencana tindak lanjut, lalu menutup pertemuan dengan salam.",
            "keyword": "mendokumentasikan, hasil, pemeriksaan, edukasi, rencana",
            "skor": 14,
            "jawaban_cadangan": "Baik Bu Bidan, terima kasih atas penjelasan dan dukungannya. Saya memahami terkait \"Mendokumentasikan hasil pemeriksaan, edukasi, dan rencana tindak lanjut, lalu menutup pertemuan dengan salam.\" dan bersedia mengikuti panduan Bu Bidan."
          }
        ]
      }
    },
    "has_perekam_nilai": true,
    "created_at": "2026-08-31"
  },
  {
    "id": "KSS-003",
    "nama": "Ny. C (29 tahun) — LARASATI JOURNEY — CASE C",
    "deskripsi": "Pemeriksaan IVA dengan Hasil Negatif pada Pasien dengan Keluhan Keputihan Abnormal",
    "teks_perkenalan": "Selamat datang di Midwife Clinic. Hari ini Anda bertugas sebagai Bidan. Seorang pasien (Ny. C, 29 tahun) datang mengeluhkan keputihan abnormal yang sangat mengganggu.",
    "atribut": [
      {
        "id": "attr-KSS-003-1",
        "key": "Status Obstetri",
        "value": "G2P2A0"
      },
      {
        "id": "attr-KSS-003-2",
        "key": "Keluhan Utama",
        "value": "Keputihan banyak, berbau amis, dan gatal, tanpa disertai perdarahan"
      },
      {
        "id": "attr-KSS-003-3",
        "key": "Alasan Kedatangan",
        "value": "Datang untuk pemeriksaan IVA karena mengeluh keputihan yang tidak biasa"
      },
      {
        "id": "attr-KSS-003-4",
        "key": "Riwayat Kontrasepsi",
        "value": "Menggunakan pil KB kombinasi"
      },
      {
        "id": "attr-KSS-003-5",
        "key": "Riwayat Skrining",
        "value": "Belum pernah melakukan IVA maupun Pap smear sebelumnya"
      },
      {
        "id": "attr-KSS-003-6",
        "key": "Riwayat Vaksinasi HPV",
        "value": "Belum pernah mendapatkan vaksinasi HPV"
      }
    ],
    "pasien_ids": [
      "PSN-003"
    ],
    "soal_text": "Laksanakan 5 stase sirkuit klinis kebidanan untuk Ny. C: Anamnesis, Deteksi Faktor Risiko, Prosedur IVA, Interpretasi Temuan, dan Asuhan Kebidanan Interaktif.",
    "stase_data": {
      "stase1": {
        "header": {
          "nama_stase": "Pos 1: Anamnesis Pasien",
          "kode_amplop": "AMP-ANM-C1",
          "durasi_menit": 7,
          "petunjuk_soal": "Lakukan anamnesis terarah kepada Ny. C untuk menggali riwayat keluhan keputihan, kebiasaan perawatan genitalia, dan riwayat reproduksi pasien."
        },
        "ai_system_prompt": "Kamu adalah Ny. C, berusia 29 tahun, dengan status obstetri G2P2A0.\nKeluhan: Keputihan banyak, berbau amis, dan gatal, tanpa disertai perdarahan.\nJawablah pertanyaan Bidan secara sopan, santun, dan komunikatif.",
        "triggers": [
          {
            "id": "trg-anm-case_c-1",
            "konteks": "Anamnesis Kategori 1: Riwayat keluhan",
            "keyword": "keluhan, keluhannya apa, kenapa datang, alasan datang, apa yang dirasakan, keputihan, berbau, bercampur darah, keluar darah, ada keluhan apa, sakit apa, keluhan utama, durasi",
            "skor": 10,
            "jawaban_cadangan": "Ini, Bu Bidan, akhir-akhir ini keputihan saya banyak banget, berbau dan gatal juga. Tapi nggak keluar darah kok."
          },
          {
            "id": "trg-anm-case_c-2",
            "konteks": "Anamnesis Kategori 2: Riwayat menstruasi",
            "keyword": "haid, menstruasi, hpht, siklus haid, kapan terakhir haid, teratur, mens, datang bulan, berapa hari haid, siklusnya, darah haid",
            "skor": 10,
            "jawaban_cadangan": "Baru selesai haid minggu lalu, siklus saya teratur, 28 hari."
          },
          {
            "id": "trg-anm-case_c-3",
            "konteks": "Anamnesis Kategori 3: Riwayat perkawinan/menikah",
            "keyword": "menikah, perkawinan, nikah, usia menikah, umur berapa menikah, pernikahan pertama, berapa kali menikah, bersuami, status pernikahan",
            "skor": 10,
            "jawaban_cadangan": "Umur 24 tahun, Bu, ini pernikahan pertama saya."
          },
          {
            "id": "trg-anm-case_c-4",
            "konteks": "Anamnesis Kategori 4: Riwayat hubungan seksual",
            "keyword": "hubungan seksual, hubungan intim, berhubungan, bersenggama, setelah berhubungan, keluar darah setelah berhubungan, perdarahan kontak, nyeri senggama, dispareunia, aktif seksual",
            "skor": 10,
            "jawaban_cadangan": "tidak ada keluhan setelah berhubungan."
          },
          {
            "id": "trg-anm-case_c-5",
            "konteks": "Anamnesis Kategori 5: Riwayat obstetri/paritas (G2P2A0)",
            "keyword": "hamil, melahirkan, anak, paritas, persalinan, keguguran, gpa, gravida, berapa anak, berapa kali melahirkan, pernah keguguran, riwayat persalinan",
            "skor": 10,
            "jawaban_cadangan": "Dua, Bu, nggak pernah keguguran."
          },
          {
            "id": "trg-anm-case_c-6",
            "konteks": "Anamnesis Kategori 6: Riwayat kontrasepsi",
            "keyword": "kb, kontrasepsi, spiral, iud, pil kb, suntik kb, implan, susuk, kondom, pakai kb apa, alat kontrasepsi, sudah berapa lama kb, metode kb",
            "skor": 10,
            "jawaban_cadangan": "Saya pakai pil KB kombinasi, udah dua tahun."
          },
          {
            "id": "trg-anm-case_c-7",
            "konteks": "Anamnesis Kategori 7: Riwayat penyakit",
            "keyword": "penyakit, riwayat penyakit, pernah sakit apa, darah tinggi, hipertensi, diabetes, kencing manis, kanker, tumor, riwayat keluarga, minum obat, alergi, pms, infeksi menular, pengobatan",
            "skor": 10,
            "jawaban_cadangan": "Tidak ada riwayat penyakit apa-apa Bu. Saya dan keluarga sehat-sehat aja selama ini."
          },
          {
            "id": "trg-anm-case_c-8",
            "konteks": "Anamnesis Kategori 8: Riwayat pemenuhan kebutuhan sehari-hari",
            "keyword": "kebiasaan, pola hidup, makan, minum, olahraga, sabun kewanitaan, pembersih kewanitaan, cebok, douching, merokok, aktivitas sehari-hari, pola makan, higienitas",
            "skor": 10,
            "jawaban_cadangan": "Saya makan normal seperti biasa, BAK dan BAB saya juga normal, olahraga 2 kali seminggu, saya sering pakai sabun pembersih kewanitaan yang wangi-wangi, Bu, apalagi kalau lagi banyak keputihan."
          },
          {
            "id": "trg-anm-case_c-9",
            "konteks": "Anamnesis Kategori 9: Riwayat skrining kanker serviks dan imunisasi HPV",
            "keyword": "skrining, iva, pap smear, periksa iva, tes iva, vaksin hpv, imunisasi hpv, suntik hpv, pernah periksa sebelumnya, deteksi dini, belum pernah iva",
            "skor": 10,
            "jawaban_cadangan": "Belum pernah sama sekali, Bu, ini pertama kalinya saya periksa begini."
          }
        ]
      },
      "stase2": {
        "header": {
          "nama_stase": "Pos 2: Deteksi Faktor Risiko",
          "kode_amplop": "AMP-RSK-C2",
          "durasi_menit": 5,
          "petunjuk_soal": "Identifikasi faktor risiko dan temuan penyebab keputihan serta status skrining kesehatan reproduksi pada Ny. C."
        },
        "faktor_risiko": [
          {
            "id": "fkr-case_c-1",
            "nama_jawaban": "Keputihan berbau amis dan gatal",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_c-2",
            "nama_jawaban": "Kebiasaan menggunakan sabun/pembersih kewanitaan beraroma",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_c-3",
            "nama_jawaban": "Belum pernah melakukan skrining IVA/Pap smear",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_c-4",
            "nama_jawaban": "Belum mendapatkan vaksinasi HPV",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_c-5",
            "nama_jawaban": "Tidak disertai perdarahan di luar haid",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_c-6",
            "nama_jawaban": "Siklus menstruasi teratur",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          },
          {
            "id": "fkr-case_c-7",
            "nama_jawaban": "Pernikahan pertama",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          },
          {
            "id": "fkr-case_c-8",
            "nama_jawaban": "Tidak pernah mengalami keguguran",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          },
          {
            "id": "fkr-case_c-9",
            "nama_jawaban": "Menggunakan pil KB kombinasi",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          },
          {
            "id": "fkr-case_c-10",
            "nama_jawaban": "Tidak memiliki riwayat penyakit tertentu",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          },
          {
            "id": "fkr-case_c-11",
            "nama_jawaban": "Baru selesai haid minggu lalu",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          }
        ]
      },
      "stase3": {
        "header": {
          "nama_stase": "Pos 3: Prosedur IVA",
          "kode_amplop": "AMP-SOP-C3",
          "durasi_menit": 6,
          "petunjuk_soal": "Susun urutan langkah standar pemeriksaan IVA secara teratur, aseptik, dan sesuai standar pelayanan kebidanan."
        },
        "langkah_prosedur": [
          {
            "id": "prc-case_c-1",
            "nama_langkah": "Bidan mencuci tangan dan menggunakan APD (alat pelindung diri)",
            "skor": 10,
            "order": 1
          },
          {
            "id": "prc-case_c-2",
            "nama_langkah": "Menjelaskan tindakan dan meminta persetujuan (informed consent) pasien",
            "skor": 10,
            "order": 2
          },
          {
            "id": "prc-case_c-3",
            "nama_langkah": "Mempersiapkan alat dan memposisikan pasien pada posisi litotomi",
            "skor": 10,
            "order": 3
          },
          {
            "id": "prc-case_c-4",
            "nama_langkah": "Melakukan vulva hygiene",
            "skor": 10,
            "order": 4
          },
          {
            "id": "prc-case_c-5",
            "nama_langkah": "Memasang spekulum dengan benar",
            "skor": 10,
            "order": 5
          },
          {
            "id": "prc-case_c-6",
            "nama_langkah": "Melakukan inspeksi visual pada portio",
            "skor": 10,
            "order": 6
          },
          {
            "id": "prc-case_c-7",
            "nama_langkah": "Mengaplikasikan asam asetat 3–5% ke seluruh permukaan porsio",
            "skor": 10,
            "order": 7
          },
          {
            "id": "prc-case_c-8",
            "nama_langkah": "Mengamati perubahan pada serviks selama 1–2 menit",
            "skor": 10,
            "order": 8
          },
          {
            "id": "prc-case_c-9",
            "nama_langkah": "Membersihkan porsio, melepaskan spekulum, dan merapikan pasien",
            "skor": 10,
            "order": 9
          },
          {
            "id": "prc-case_c-10",
            "nama_langkah": "Melakukan pemeriksaan tanpa meminta persetujuan (informed consent) pasien",
            "skor": 0,
            "order": 99
          },
          {
            "id": "prc-case_c-11",
            "nama_langkah": "Mengoleskan asam asetat sebelum memasang spekulum",
            "skor": 0,
            "order": 99
          },
          {
            "id": "prc-case_c-12",
            "nama_langkah": "Mengulang pemberian asam asetat terus-menerus meski tidak ada perubahan",
            "skor": 0,
            "order": 99
          },
          {
            "id": "prc-case_c-13",
            "nama_langkah": "Langsung meresepkan antibiotik tanpa melakukan pemeriksaan inspekulo",
            "skor": 0,
            "order": 99
          }
        ]
      },
      "stase4": {
        "header": {
          "nama_stase": "Pos 4: Interpretasi Visual",
          "kode_amplop": "AMP-ITP-C4",
          "durasi_menit": 5,
          "petunjuk_soal": "Perhatikan temuan inspeksi serviks pasca asam asetat (serviks licin merah muda tanpa plak putih aceto-white, terdapat sekret vagina berlebih), lalu tentukan kesimpulan klinis yang tepat."
        },
        "images": [
          {
            "id": "img-case_c-1",
            "url": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80",
            "nama": "Foto Serviks Ny. C",
            "keterangan": "Perhatikan temuan inspeksi serviks pasca asam asetat (serviks licin merah muda tanpa plak putih aceto-white, terdapat sekret vagina berlebih), lalu tentukan kesimpulan klinis yang tepat."
          }
        ],
        "pilihan_jawaban": [
          {
            "id": "opt-case_c-1",
            "label": "IVA negatif — tidak ditemukan area putih (aceto-white) pada serviks.",
            "is_correct": true,
            "skor": 25
          },
          {
            "id": "opt-case_c-2",
            "label": "IVA positif dengan lesi tidak luas",
            "is_correct": false,
            "skor": 0
          },
          {
            "id": "opt-case_c-3",
            "label": "IVA positif dengan lesi luas/mencurigakan keganasan",
            "is_correct": false,
            "skor": 0
          },
          {
            "id": "opt-case_c-4",
            "label": "Karena hasil IVA negatif, keputihan tidak perlu ditangani",
            "is_correct": false,
            "skor": 0
          },
          {
            "id": "opt-case_c-5",
            "label": "Keputihan abnormal pasti menandakan kanker serviks stadium awal",
            "is_correct": false,
            "skor": 0
          }
        ]
      },
      "stase5": {
        "header": {
          "nama_stase": "Pos 5: Asuhan Kebidanan & Konseling Interaktif",
          "kode_amplop": "AMP-ASH-C5",
          "durasi_menit": 8,
          "petunjuk_soal": "Sampaikan asuhan kebidanan kepada Ny. C: jelaskan hasil IVA negatif (bebas lesi pra-kanker), edukasi penyebab infeksi/servisitis akibat kebiasaan sabun pembersih kewanitaan, berikan terapi pengobatan keputihan, dan jadwalkan skrining ulang 3–5 tahun lagi."
        },
        "ai_system_prompt": "Kamu adalah Ny. C, usia 29 tahun, dengan status obstetri G2P2A0.\nKeluhan awalmu: Keputihan banyak, berbau amis, dan gatal, tanpa disertai perdarahan.\nKamu baru saja selesai diperiksa IVA oleh Bidan dan sedang berkonsultasi di Pos 5 untuk mendengarkan penjelasan hasil pemeriksaan, konseling, dan rencana tindak lanjut.\nKarakteristik kepribadian & emosi:\n- Merasa cemas terhadap hasil pemeriksaan namun sangat menghargai dan kooperatif terhadap saran bidan.\n- Berbahasa Indonesia yang sopan dan santun.\n- Ajukan pertanyaan klarifikasi jika Bidan menjelaskan tindakan medis (seperti rujukan SpOG atau krioterapi).",
        "triggers": [
          {
            "id": "trg-ai-ash-c-1",
            "konteks": "Menjelaskan hasil pemeriksaan IVA (negatif) kepada pasien dengan bahasa sederhana.",
            "keyword": "menjelaskan, hasil, pemeriksaan, negatif, pasien",
            "skor": 17,
            "jawaban_cadangan": "Terima kasih penjelasannya Bu Bidan, jadi kondisi serviks saya seperti itu ya... Saya sempat khawatir sekali. Bagaimana langkah selanjutnya Bu?"
          },
          {
            "id": "trg-ai-ash-c-2",
            "konteks": "Menjelaskan bahwa keputihannya kemungkinan besar disebabkan infeksi/iritasi, bukan kanker serviks.",
            "keyword": "menjelaskan, bahwa, keputihannya, kemungkinan, besar",
            "skor": 17,
            "jawaban_cadangan": "Baik Bu Bidan, terima kasih atas penjelasan dan dukungannya. Saya memahami terkait \"Menjelaskan bahwa keputihannya kemungkinan besar disebabkan infeksi/iritasi, bukan kanker serviks.\" dan bersedia mengikuti panduan Bu Bidan."
          },
          {
            "id": "trg-ai-ash-c-3",
            "konteks": "Memberikan edukasi untuk menghindari sabun pembersih kewanitaan beraroma yang dapat mengganggu keseimbangan flora vagina.",
            "keyword": "memberikan, edukasi, menghindari, sabun, pembersih",
            "skor": 17,
            "jawaban_cadangan": "Baik Bu Bidan, terima kasih atas penjelasan dan dukungannya. Saya memahami terkait \"Memberikan edukasi untuk menghindari sabun pembersih kewanitaan beraroma yang dapat mengganggu keseimbangan flora vagina.\" dan bersedia mengikuti panduan Bu Bidan."
          },
          {
            "id": "trg-ai-ash-c-4",
            "konteks": "Melakukan kolaborasi/rujukan untuk pemeriksaan dan tata laksana keputihan sesuai indikasi.",
            "keyword": "melakukan, kolaborasirujukan, pemeriksaan, tata, laksana",
            "skor": 17,
            "jawaban_cadangan": "Baik Bu Bidan, saya mengerti pentingnya rujukan ini demi penanganan dokter spesialis SpOG yang lebih pasti. Saya dan keluarga akan segera mengurus rujukan ke rumah sakit."
          },
          {
            "id": "trg-ai-ash-c-5",
            "konteks": "Mengingatkan dan menjadwalkan pasien untuk IVA ulang sesuai jadwal skrining rutin berikutnya.",
            "keyword": "mengingatkan, menjadwalkan, pasien, ulang, sesuai",
            "skor": 17,
            "jawaban_cadangan": "Baik Bu Bidan, terima kasih atas penjelasan dan dukungannya. Saya memahami terkait \"Mengingatkan dan menjadwalkan pasien untuk IVA ulang sesuai jadwal skrining rutin berikutnya.\" dan bersedia mengikuti panduan Bu Bidan."
          },
          {
            "id": "trg-ai-ash-c-6",
            "konteks": "Mendokumentasikan hasil pemeriksaan, edukasi, dan rencana tindak lanjut.",
            "keyword": "mendokumentasikan, hasil, pemeriksaan, edukasi, rencana",
            "skor": 17,
            "jawaban_cadangan": "Baik Bu Bidan, terima kasih atas penjelasan dan dukungannya. Saya memahami terkait \"Mendokumentasikan hasil pemeriksaan, edukasi, dan rencana tindak lanjut.\" dan bersedia mengikuti panduan Bu Bidan."
          }
        ]
      }
    },
    "has_perekam_nilai": true,
    "created_at": "2026-08-31"
  },
  {
    "id": "KSS-004",
    "nama": "Ny. D (52 tahun (pascamenopause ± 3 tahun)) — LARASATI JOURNEY — CASE D",
    "deskripsi": "Temuan Klinis Massa Menyerupai Kembang Kol pada Serviks — Kecurigaan Kuat Karsinoma Serviks Invasif",
    "teks_perkenalan": "Selamat datang di Midwife Clinic. Hari ini Anda bertugas sebagai Bidan. Seorang wanita pascamenopause (Ny. D, 52 tahun) datang dengan keluhan perdarahan jalan lahir dan nyeri panggul.",
    "atribut": [
      {
        "id": "attr-KSS-004-1",
        "key": "Status Obstetri",
        "value": "G6P5A1"
      },
      {
        "id": "attr-KSS-004-2",
        "key": "Keluhan Utama",
        "value": "Perdarahan pervaginam di luar masa haid, keputihan berbau busuk bercampur darah, nyeri panggul, penurunan berat badan"
      },
      {
        "id": "attr-KSS-004-3",
        "key": "Alasan Kedatangan",
        "value": "Datang karena keluhan perdarahan dari jalan lahir meski sudah menopause"
      },
      {
        "id": "attr-KSS-004-4",
        "key": "Riwayat Kontrasepsi",
        "value": "Dahulu menggunakan KB suntik, sudah lama berhenti sejak menopause"
      },
      {
        "id": "attr-KSS-004-5",
        "key": "Riwayat Skrining",
        "value": "Tidak pernah sama sekali melakukan IVA maupun Pap smear seumur hidup"
      },
      {
        "id": "attr-KSS-004-6",
        "key": "Riwayat Vaksinasi HPV",
        "value": "Tidak pernah mendapatkan vaksinasi HPV"
      }
    ],
    "pasien_ids": [
      "PSN-004"
    ],
    "soal_text": "Laksanakan 5 stase sirkuit klinis kebidanan untuk Ny. D: Anamnesis, Deteksi Faktor Risiko, Prosedur IVA, Interpretasi Temuan, dan Asuhan Kebidanan Interaktif.",
    "stase_data": {
      "stase1": {
        "header": {
          "nama_stase": "Pos 1: Anamnesis Pasien",
          "kode_amplop": "AMP-ANM-D1",
          "durasi_menit": 7,
          "petunjuk_soal": "Lakukan anamnesis mendalam kepada Ny. D untuk mengidentifikasi tanda-tanda bahaya (red flags) keganasan reproduksi pascamenopause."
        },
        "ai_system_prompt": "Kamu adalah Ny. D, berusia 52 tahun (pascamenopause ± 3 tahun), dengan status obstetri G6P5A1.\nKeluhan: Perdarahan pervaginam di luar masa haid, keputihan berbau busuk bercampur darah, nyeri panggul, penurunan berat badan.\nJawablah pertanyaan Bidan secara sopan, santun, dan komunikatif.",
        "triggers": [
          {
            "id": "trg-anm-case_d-1",
            "konteks": "Anamnesis Kategori 1: Riwayat keluhan",
            "keyword": "keluhan, keluhannya apa, kenapa datang, alasan datang, apa yang dirasakan, keputihan, berbau, bercampur darah, keluar darah, ada keluhan apa, sakit apa, keluhan utama, durasi",
            "skor": 10,
            "jawaban_cadangan": "Ini lho, Bu Bidan, saya keluar darah dari kemaluan padahal saya udah nggak haid dari 3 tahun lalu. Keputihannya juga bau banget, kadang campur darah. Perut bagian bawah juga nyeri terus."
          },
          {
            "id": "trg-anm-case_d-2",
            "konteks": "Anamnesis Kategori 2: Riwayat menstruasi",
            "keyword": "haid, menstruasi, hpht, siklus haid, kapan terakhir haid, teratur, mens, datang bulan, berapa hari haid, siklusnya, darah haid",
            "skor": 10,
            "jawaban_cadangan": "Sudah sekitar 3 tahun ini saya nggak haid lagi, Bu, udah menopause."
          },
          {
            "id": "trg-anm-case_d-3",
            "konteks": "Anamnesis Kategori 3: Riwayat perkawinan/menikah",
            "keyword": "menikah, perkawinan, nikah, usia menikah, umur berapa menikah, pernikahan pertama, berapa kali menikah, bersuami, status pernikahan",
            "skor": 10,
            "jawaban_cadangan": "Saya menikah umur 16 tahun, Bu Bidan, udah lama banget."
          },
          {
            "id": "trg-anm-case_d-4",
            "konteks": "Anamnesis Kategori 4: Riwayat hubungan seksual",
            "keyword": "hubungan seksual, hubungan intim, berhubungan, bersenggama, setelah berhubungan, keluar darah setelah berhubungan, perdarahan kontak, nyeri senggama, dispareunia, aktif seksual",
            "skor": 10,
            "jawaban_cadangan": "Sudah jarang, Bu, tapi kalau berhubungan suka keluar darah."
          },
          {
            "id": "trg-anm-case_d-5",
            "konteks": "Anamnesis Kategori 5: Riwayat obstetri/paritas",
            "keyword": "hamil, melahirkan, anak, paritas, persalinan, keguguran, gpa, gravida, berapa anak, berapa kali melahirkan, pernah keguguran, riwayat persalinan",
            "skor": 10,
            "jawaban_cadangan": "Anak saya enam, lahir lima, satu keguguran, Bu."
          },
          {
            "id": "trg-anm-case_d-6",
            "konteks": "Anamnesis Kategori 6: Riwayat kontrasepsi",
            "keyword": "kb, kontrasepsi, spiral, iud, pil kb, suntik kb, implan, susuk, kondom, pakai kb apa, alat kontrasepsi, sudah berapa lama kb, metode kb",
            "skor": 10,
            "jawaban_cadangan": "Dulu saya suntik KB, tapi udah lama berhenti sejak menopause."
          },
          {
            "id": "trg-anm-case_d-7",
            "konteks": "Anamnesis Kategori 7: Riwayat penyakit",
            "keyword": "penyakit, riwayat penyakit, pernah sakit apa, darah tinggi, hipertensi, diabetes, kencing manis, kanker, tumor, riwayat keluarga, minum obat, alergi, pms, infeksi menular, pengobatan",
            "skor": 10,
            "jawaban_cadangan": "Nggak ada penyakit khusus, Bu, cuma badan makin lemas belakangan ini, nenek buyut saya meninggal karena kanker"
          },
          {
            "id": "trg-anm-case_d-8",
            "konteks": "Anamnesis Kategori 8: Riwayat pemenuhan kebutuhan sehari-hari",
            "keyword": "kebiasaan, pola hidup, makan, minum, olahraga, sabun kewanitaan, pembersih kewanitaan, cebok, douching, merokok, aktivitas sehari-hari, pola makan, higienitas",
            "skor": 10,
            "jawaban_cadangan": "Nafsu makan menurun, Bu, berat badan juga turun tanpa saya diet, BAK BAB saya normal, saya udah jarang olahraga"
          },
          {
            "id": "trg-anm-case_d-9",
            "konteks": "Anamnesis Kategori 9: Riwayat skrining kanker serviks dan imunisasi HPV",
            "keyword": "skrining, iva, pap smear, periksa iva, tes iva, vaksin hpv, imunisasi hpv, suntik hpv, pernah periksa sebelumnya, deteksi dini, belum pernah iva",
            "skor": 10,
            "jawaban_cadangan": "Belum pernah sama sekali seumur hidup saya, Bu Bidan."
          }
        ]
      },
      "stase2": {
        "header": {
          "nama_stase": "Pos 2: Deteksi Faktor Risiko",
          "kode_amplop": "AMP-RSK-D2",
          "durasi_menit": 5,
          "petunjuk_soal": "Identifikasi faktor risiko tinggi dan gejala klinis red flags keganasan karsinoma serviks pada Ny. D."
        },
        "faktor_risiko": [
          {
            "id": "fkr-case_d-1",
            "nama_jawaban": "Usia 52 tahun",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_d-2",
            "nama_jawaban": "Menikah pada usia 16 tahun",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_d-3",
            "nama_jawaban": "G6P5A1",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_d-4",
            "nama_jawaban": "Perdarahan pervaginam pascamenopause, perdarahan setelah berhubungan",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_d-5",
            "nama_jawaban": "Keputihan berbau busuk bercampur darah",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_d-6",
            "nama_jawaban": "Tidak pernah melakukan skrining IVA/Pap smear seumur hidup",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_d-7",
            "nama_jawaban": "Penurunan berat badan dan nafsu makan tanpa sebab jelas",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_d-8",
            "nama_jawaban": "Riwayat menggunakan KB suntik di masa lalu",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          },
          {
            "id": "fkr-case_d-9",
            "nama_jawaban": "Sudah menopause sejak 3 tahun lalu",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          },
          {
            "id": "fkr-case_d-10",
            "nama_jawaban": "Riwayat satu kali keguguran",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          },
          {
            "id": "fkr-case_d-11",
            "nama_jawaban": "Tidak memiliki riwayat penyakit tertentu selain keluhan saat ini",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          },
          {
            "id": "fkr-case_d-12",
            "nama_jawaban": "Sudah jarang berhubungan seksual",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          },
          {
            "id": "fkr-case_d-13",
            "nama_jawaban": "Belum pernah mendapatkan vaksinasi HPV",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          }
        ]
      },
      "stase3": {
        "header": {
          "nama_stase": "Pos 3: Prosedur IVA",
          "kode_amplop": "AMP-SOP-D3",
          "durasi_menit": 6,
          "petunjuk_soal": "Lakukan pemeriksaan inspekulo secara ekstra hati-hati. Hentikan tindakan manipulatif dan jangan memaksakan aplikasi asam asetat saat teridentifikasi massa yang mudah berdarah."
        },
        "langkah_prosedur": [
          {
            "id": "prc-case_d-1",
            "nama_langkah": "Bidan mencuci tangan dan menggunakan APD (alat pelindung diri)",
            "skor": 10,
            "order": 1
          },
          {
            "id": "prc-case_d-2",
            "nama_langkah": "Menjelaskan tindakan dan meminta persetujuan (informed consent) pasien",
            "skor": 10,
            "order": 2
          },
          {
            "id": "prc-case_d-3",
            "nama_langkah": "Memposisikan pasien pada posisi litotomi dengan nyaman",
            "skor": 10,
            "order": 3
          },
          {
            "id": "prc-case_d-4",
            "nama_langkah": "Melakukan vulva hygiene dengan lembut",
            "skor": 10,
            "order": 4
          },
          {
            "id": "prc-case_d-5",
            "nama_langkah": "Memasang spekulum dengan hati-hati untuk menghindari perlukaan",
            "skor": 10,
            "order": 5
          },
          {
            "id": "prc-case_d-6",
            "nama_langkah": "Melakukan inspeksi visual pada portio tanpa perlu pemberian asam asetat",
            "skor": 10,
            "order": 6
          },
          {
            "id": "prc-case_d-7",
            "nama_langkah": "Menghentikan manipulasi lebih lanjut begitu ditemukan massa rapuh menyerupai kembang kol yang mudah berdarah",
            "skor": 10,
            "order": 7
          },
          {
            "id": "prc-case_d-8",
            "nama_langkah": "Tetap mengoleskan asam asetat berulang-ulang untuk memastikan hasil IVA",
            "skor": 0,
            "order": 99
          },
          {
            "id": "prc-case_d-9",
            "nama_langkah": "Melakukan pengambilan sampel jaringan (biopsi) sendiri tanpa kewenangan yang sesuai",
            "skor": 0,
            "order": 99
          },
          {
            "id": "prc-case_d-10",
            "nama_langkah": "Menekan atau menggosok massa yang ditemukan untuk melihat reaksinya",
            "skor": 0,
            "order": 99
          },
          {
            "id": "prc-case_d-11",
            "nama_langkah": "Langsung menyatakan pasien pasti kanker stadium akhir tanpa pemeriksaan lanjutan",
            "skor": 0,
            "order": 99
          },
          {
            "id": "prc-case_d-12",
            "nama_langkah": "Menunda rujukan dan menyarankan pasien kontrol ulang bulan depan",
            "skor": 0,
            "order": 99
          }
        ]
      },
      "stase4": {
        "header": {
          "nama_stase": "Pos 4: Interpretasi Visual",
          "kode_amplop": "AMP-ITP-D4",
          "durasi_menit": 5,
          "petunjuk_soal": "Evaluasi gambaran klinis serviks (tampak massa eksofitik menyerupai kembang kol, rapuh, nekrotik, dan mudah berdarah saat tersentuh) dan tentukan interpretasi diagnosis yang tepat."
        },
        "images": [
          {
            "id": "img-case_d-1",
            "url": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80",
            "nama": "Foto Serviks Ny. D",
            "keterangan": "Evaluasi gambaran klinis serviks (tampak massa eksofitik menyerupai kembang kol, rapuh, nekrotik, dan mudah berdarah saat tersentuh) dan tentukan interpretasi diagnosis yang tepat."
          }
        ],
        "pilihan_jawaban": [
          {
            "id": "opt-case_d-1",
            "label": "IVA positif, curiga kanker servikas",
            "is_correct": true,
            "skor": 25
          },
          {
            "id": "opt-case_d-2",
            "label": "IVA negatif",
            "is_correct": false,
            "skor": 0
          },
          {
            "id": "opt-case_d-3",
            "label": "IVA positif dengan lesi tidak luas",
            "is_correct": false,
            "skor": 0
          },
          {
            "id": "opt-case_d-4",
            "label": "IVA positif dengan lesi luas namun belum tentu keganasan, cukup dipantau",
            "is_correct": false,
            "skor": 0
          },
          {
            "id": "opt-case_d-5",
            "label": "Sudah pasti kanker serviks stadium akhir tanpa perlu pemeriksaan lanjutan",
            "is_correct": false,
            "skor": 0
          },
          {
            "id": "opt-case_d-6",
            "label": "Bisa ditunda dan dijadwalkan kontrol ulang dalam 1 tahun",
            "is_correct": false,
            "skor": 0
          }
        ]
      },
      "stase5": {
        "header": {
          "nama_stase": "Pos 5: Asuhan Kebidanan & Konseling Interaktif",
          "kode_amplop": "AMP-ASH-D5",
          "durasi_menit": 8,
          "petunjuk_soal": "Berikan asuhan kebidanan darurat dan pendampingan suportif: tenangkan pasien, jelaskan temuan benjolan abnormal yang memerlukan penanganan dokter spesialis SpOG Onkologi segera, buatkan surat rujukan CITO, dan beri instruksi penanganan bila terjadi perdarahan."
        },
        "ai_system_prompt": "Kamu adalah Ny. D, usia 52 tahun (pascamenopause ± 3 tahun), dengan status obstetri G6P5A1.\nKeluhan awalmu: Perdarahan pervaginam di luar masa haid, keputihan berbau busuk bercampur darah, nyeri panggul, penurunan berat badan.\nKamu baru saja selesai diperiksa IVA oleh Bidan dan sedang berkonsultasi di Pos 5 untuk mendengarkan penjelasan hasil pemeriksaan, konseling, dan rencana tindak lanjut.\nKarakteristik kepribadian & emosi:\n- Merasa cemas terhadap hasil pemeriksaan namun sangat menghargai dan kooperatif terhadap saran bidan.\n- Berbahasa Indonesia yang sopan dan santun.\n- Ajukan pertanyaan klarifikasi jika Bidan menjelaskan tindakan medis (seperti rujukan SpOG atau krioterapi).",
        "triggers": [
          {
            "id": "trg-ai-ash-d-1",
            "konteks": "Tetap tenang dan menjaga kenyamanan serta keselamatan pasien selama pemeriksaan.",
            "keyword": "tetap, tenang, menjaga, kenyamanan, keselamatan",
            "skor": 14,
            "jawaban_cadangan": "Terima kasih penjelasannya Bu Bidan, jadi kondisi serviks saya seperti itu ya... Saya sempat khawatir sekali. Bagaimana langkah selanjutnya Bu?"
          },
          {
            "id": "trg-ai-ash-d-2",
            "konteks": "Menjelaskan kepada pasien bahwa ditemukan kelainan pada leher rahim yang perlu pemeriksaan lebih lanjut segera.",
            "keyword": "menjelaskan, pasien, bahwa, ditemukan, kelainan",
            "skor": 14,
            "jawaban_cadangan": "Baik Bu Bidan, terima kasih atas penjelasan dan dukungannya. Saya memahami terkait \"Menjelaskan kepada pasien bahwa ditemukan kelainan pada leher rahim yang perlu pemeriksaan lebih lanjut segera.\" dan bersedia mengikuti panduan Bu Bidan."
          },
          {
            "id": "trg-ai-ash-d-3",
            "konteks": "Tidak memastikan diagnosis kanker secara sepihak, namun menyampaikan bahwa temuan ini serius dan perlu ditindaklanjuti cepat.",
            "keyword": "tidak, memastikan, diagnosis, kanker, sepihak",
            "skor": 14,
            "jawaban_cadangan": "Baik Bu Bidan, terima kasih atas penjelasan dan dukungannya. Saya memahami terkait \"Tidak memastikan diagnosis kanker secara sepihak, namun menyampaikan bahwa temuan ini serius dan perlu ditindaklanjuti cepat.\" dan bersedia mengikuti panduan Bu Bidan."
          },
          {
            "id": "trg-ai-ash-d-4",
            "konteks": "Memberikan dukungan emosional dan kesempatan pasien menyampaikan kekhawatirannya.",
            "keyword": "memberikan, dukungan, emosional, kesempatan, pasien",
            "skor": 14,
            "jawaban_cadangan": "Baik Bu Bidan, terima kasih atas penjelasan dan dukungannya. Saya memahami terkait \"Memberikan dukungan emosional dan kesempatan pasien menyampaikan kekhawatirannya.\" dan bersedia mengikuti panduan Bu Bidan."
          },
          {
            "id": "trg-ai-ash-d-5",
            "konteks": "Melakukan kolaborasi dengan dokter untuk rencana rujukan cito.",
            "keyword": "melakukan, kolaborasi, dokter, rencana, rujukan",
            "skor": 14,
            "jawaban_cadangan": "Baik Bu Bidan, saya mengerti pentingnya rujukan ini demi penanganan dokter spesialis SpOG yang lebih pasti. Saya dan keluarga akan segera mengurus rujukan ke rumah sakit."
          },
          {
            "id": "trg-ai-ash-d-6",
            "konteks": "Merujuk pasien SEGERA (cito) ke SpOG/fasilitas onkologi untuk biopsi dan tata laksana lanjut.",
            "keyword": "merujuk, pasien, segera, cito, spogfasilitas",
            "skor": 14,
            "jawaban_cadangan": "Baik Bu Bidan, saya mengerti pentingnya rujukan ini demi penanganan dokter spesialis SpOG yang lebih pasti. Saya dan keluarga akan segera mengurus rujukan ke rumah sakit."
          },
          {
            "id": "trg-ai-ash-d-7",
            "konteks": "Mendokumentasikan hasil pemeriksaan, edukasi, kolaborasi, dan rujukan secara lengkap.",
            "keyword": "mendokumentasikan, hasil, pemeriksaan, edukasi, kolaborasi",
            "skor": 14,
            "jawaban_cadangan": "Baik Bu Bidan, saya mengerti pentingnya rujukan ini demi penanganan dokter spesialis SpOG yang lebih pasti. Saya dan keluarga akan segera mengurus rujukan ke rumah sakit."
          }
        ]
      }
    },
    "has_perekam_nilai": true,
    "created_at": "2026-08-31"
  },
  {
    "id": "KSS-005",
    "nama": "Ny. E (33 tahun) — LARASATI JOURNEY — CASE E",
    "deskripsi": "Pemeriksaan IVA Rutin Tanpa Keluhan dengan Hasil Negatif (Kasus Skrining Normal)",
    "teks_perkenalan": "Selamat datang di Midwife Clinic. Hari ini Anda bertugas sebagai Bidan. Seorang wanita usia subur (Ny. E, 33 tahun) datang untuk mengikuti program skrining IVA gratis secara sukarela.",
    "atribut": [
      {
        "id": "attr-KSS-005-1",
        "key": "Status Obstetri",
        "value": "G1P1A0"
      },
      {
        "id": "attr-KSS-005-2",
        "key": "Keluhan Utama",
        "value": "Tidak ada keluhan (asimtomatik)"
      },
      {
        "id": "attr-KSS-005-3",
        "key": "Alasan Kedatangan",
        "value": "Mengikuti program skrining IVA gratis di Posyandu/Puskesmas, tanpa keluhan"
      },
      {
        "id": "attr-KSS-005-4",
        "key": "Riwayat Kontrasepsi",
        "value": "Menggunakan kondom"
      },
      {
        "id": "attr-KSS-005-5",
        "key": "Riwayat Skrining",
        "value": "Belum pernah melakukan IVA maupun Pap smear sebelumnya"
      },
      {
        "id": "attr-KSS-005-6",
        "key": "Riwayat Vaksinasi HPV",
        "value": "Sudah pernah mendapatkan vaksinasi HPV saat remaja"
      }
    ],
    "pasien_ids": [
      "PSN-005"
    ],
    "soal_text": "Laksanakan 5 stase sirkuit klinis kebidanan untuk Ny. E: Anamnesis, Deteksi Faktor Risiko, Prosedur IVA, Interpretasi Temuan, dan Asuhan Kebidanan Interaktif.",
    "stase_data": {
      "stase1": {
        "header": {
          "nama_stase": "Pos 1: Anamnesis Pasien",
          "kode_amplop": "AMP-ANM-E1",
          "durasi_menit": 7,
          "petunjuk_soal": "Lakukan anamnesis skrining rutin secara lengkap, ramah, dan profesional pada pasien asimtomatik (tanpa keluhan)."
        },
        "ai_system_prompt": "Kamu adalah Ny. E, berusia 33 tahun, dengan status obstetri G1P1A0.\nKeluhan: Tidak ada keluhan (asimtomatik).\nJawablah pertanyaan Bidan secara sopan, santun, dan komunikatif.",
        "triggers": [
          {
            "id": "trg-anm-case_e-1",
            "konteks": "Anamnesis Kategori 1: Riwayat keluhan",
            "keyword": "keluhan, keluhannya apa, kenapa datang, alasan datang, apa yang dirasakan, keputihan, berbau, bercampur darah, keluar darah, ada keluhan apa, sakit apa, keluhan utama, durasi",
            "skor": 10,
            "jawaban_cadangan": "Nggak ada keluhan apa-apa sih, Bu Bidan, saya cuma ikut program periksa IVA gratis di sini."
          },
          {
            "id": "trg-anm-case_e-2",
            "konteks": "Anamnesis Kategori 2: Riwayat menstruasi",
            "keyword": "haid, menstruasi, hpht, siklus haid, kapan terakhir haid, teratur, mens, datang bulan, berapa hari haid, siklusnya, darah haid",
            "skor": 10,
            "jawaban_cadangan": "Baru selesai haid, siklus saya lancar, sekitar 28 hari."
          },
          {
            "id": "trg-anm-case_e-3",
            "konteks": "Anamnesis Kategori 3: Riwayat perkawinan/menikah",
            "keyword": "menikah, perkawinan, nikah, usia menikah, umur berapa menikah, pernikahan pertama, berapa kali menikah, bersuami, status pernikahan",
            "skor": 10,
            "jawaban_cadangan": "Umur 26 tahun, Bu, ini pernikahan pertama saya."
          },
          {
            "id": "trg-anm-case_e-4",
            "konteks": "Anamnesis Kategori 4: Riwayat hubungan seksual",
            "keyword": "hubungan seksual, hubungan intim, berhubungan, bersenggama, setelah berhubungan, keluar darah setelah berhubungan, perdarahan kontak, nyeri senggama, dispareunia, aktif seksual",
            "skor": 10,
            "jawaban_cadangan": "Terakhir berhubungan sekitar 1 minggu yang lalu, tidak ada keluhan saat berhubungan ."
          },
          {
            "id": "trg-anm-case_e-5",
            "konteks": "Anamnesis Kategori 5: Riwayat obstetri/paritas (G1P1A0)",
            "keyword": "hamil, melahirkan, anak, paritas, persalinan, keguguran, gpa, gravida, berapa anak, berapa kali melahirkan, pernah keguguran, riwayat persalinan",
            "skor": 10,
            "jawaban_cadangan": "Satu, Bu, nggak pernah keguguran."
          },
          {
            "id": "trg-anm-case_e-6",
            "konteks": "Anamnesis Kategori 6: Riwayat kontrasepsi",
            "keyword": "kb, kontrasepsi, spiral, iud, pil kb, suntik kb, implan, susuk, kondom, pakai kb apa, alat kontrasepsi, sudah berapa lama kb, metode kb",
            "skor": 10,
            "jawaban_cadangan": "Saya sama suami pakai kondom, Bu."
          },
          {
            "id": "trg-anm-case_e-7",
            "konteks": "Anamnesis Kategori 7: Riwayat penyakit",
            "keyword": "penyakit, riwayat penyakit, pernah sakit apa, darah tinggi, hipertensi, diabetes, kencing manis, kanker, tumor, riwayat keluarga, minum obat, alergi, pms, infeksi menular, pengobatan",
            "skor": 10,
            "jawaban_cadangan": "Nggak ada, Bu, saya sehat, keluarga juga sehat"
          },
          {
            "id": "trg-anm-case_e-8",
            "konteks": "Anamnesis Kategori 8: Riwayat pemenuhan kebutuhan sehari-hari",
            "keyword": "kebiasaan, pola hidup, makan, minum, olahraga, sabun kewanitaan, pembersih kewanitaan, cebok, douching, merokok, aktivitas sehari-hari, pola makan, higienitas",
            "skor": 10,
            "jawaban_cadangan": "Saya cukup rajin olahraga, makan juga saya jaga, Bu."
          },
          {
            "id": "trg-anm-case_e-9",
            "konteks": "Anamnesis Kategori 9: Riwayat skrining kanker serviks dan imunisasi HPV",
            "keyword": "skrining, iva, pap smear, periksa iva, tes iva, vaksin hpv, imunisasi hpv, suntik hpv, pernah periksa sebelumnya, deteksi dini, belum pernah iva",
            "skor": 10,
            "jawaban_cadangan": "IVA belum pernah, tapi kalau vaksin HPV saya udah pernah waktu SMA dulu, Bu."
          }
        ]
      },
      "stase2": {
        "header": {
          "nama_stase": "Pos 2: Deteksi Faktor Risiko",
          "kode_amplop": "AMP-RSK-E2",
          "durasi_menit": 5,
          "petunjuk_soal": "Identifikasi data dasar dan indikasi skrining kesehatan reproduksi berkala pada Ny. E."
        },
        "faktor_risiko": [
          {
            "id": "fkr-case_e-1",
            "nama_jawaban": "Belum pernah melakukan skrining IVA sebelumnya (kunjungan skrining pertama)",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_e-2",
            "nama_jawaban": "Usia 33 tahun",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_e-3",
            "nama_jawaban": "aktif berhubungan seksual",
            "syarat_id": "tanpa_syarat",
            "skor": 15
          },
          {
            "id": "fkr-case_e-4",
            "nama_jawaban": "Menikah usia 26 tahun",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          },
          {
            "id": "fkr-case_e-5",
            "nama_jawaban": "Menggunakan KB kondom",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          },
          {
            "id": "fkr-case_e-6",
            "nama_jawaban": "Tidak memiliki riwayat penyakit tertentu",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          },
          {
            "id": "fkr-case_e-7",
            "nama_jawaban": "Rutin berolahraga dan menjaga pola makan",
            "syarat_id": "tanpa_syarat",
            "skor": 0
          }
        ]
      },
      "stase3": {
        "header": {
          "nama_stase": "Pos 3: Prosedur IVA",
          "kode_amplop": "AMP-SOP-E3",
          "durasi_menit": 6,
          "petunjuk_soal": "Susun langkah-langkah Prosedur IVA secara runtut, higienis, dan sesuai standar kompetensi bidan."
        },
        "langkah_prosedur": [
          {
            "id": "prc-case_e-1",
            "nama_langkah": "Bidan mencuci tangan dan menggunakan APD (alat pelindung diri)",
            "skor": 10,
            "order": 1
          },
          {
            "id": "prc-case_e-2",
            "nama_langkah": "Menjelaskan tindakan dan meminta persetujuan (informed consent) pasien",
            "skor": 10,
            "order": 2
          },
          {
            "id": "prc-case_e-3",
            "nama_langkah": "Mempersiapkan alat dan memposisikan pasien pada posisi litotomi",
            "skor": 10,
            "order": 3
          },
          {
            "id": "prc-case_e-4",
            "nama_langkah": "Melakukan vulva hygiene",
            "skor": 10,
            "order": 4
          },
          {
            "id": "prc-case_e-5",
            "nama_langkah": "Memasang spekulum dengan benar",
            "skor": 10,
            "order": 5
          },
          {
            "id": "prc-case_e-6",
            "nama_langkah": "Melakukan inspeksi visual pada portio",
            "skor": 10,
            "order": 6
          },
          {
            "id": "prc-case_e-7",
            "nama_langkah": "Mengaplikasikan asam asetat 3–5% ke seluruh permukaan porsio",
            "skor": 10,
            "order": 7
          },
          {
            "id": "prc-case_e-8",
            "nama_langkah": "Mengamati perubahan pada serviks selama 1–2 menit",
            "skor": 10,
            "order": 8
          },
          {
            "id": "prc-case_e-9",
            "nama_langkah": "Membersihkan porsio, melepaskan spekulum, dan merapikan pasien",
            "skor": 10,
            "order": 9
          },
          {
            "id": "prc-case_e-10",
            "nama_langkah": "Melakukan pemeriksaan tanpa meminta persetujuan (informed consent) pasien",
            "skor": 0,
            "order": 99
          },
          {
            "id": "prc-case_e-11",
            "nama_langkah": "Mengoleskan asam asetat sebelum memasang spekulum",
            "skor": 0,
            "order": 99
          },
          {
            "id": "prc-case_e-12",
            "nama_langkah": "Melewatkan anamnesis karena pasien dianggap tidak punya keluhan",
            "skor": 0,
            "order": 99
          },
          {
            "id": "prc-case_e-13",
            "nama_langkah": "Langsung menyatakan pasien pasti sehat tanpa melakukan inspeksi visual",
            "skor": 0,
            "order": 99
          }
        ]
      },
      "stase4": {
        "header": {
          "nama_stase": "Pos 4: Interpretasi Visual",
          "kode_amplop": "AMP-ITP-E4",
          "durasi_menit": 5,
          "petunjuk_soal": "Amati tampilan serviks pasca aplikasi asam asetat 3–5% (serviks licin, merah muda merata, tidak terdapat plak asetowhite), lalu tetapkan kesimpulan hasil skrining."
        },
        "images": [
          {
            "id": "img-case_e-1",
            "url": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80",
            "nama": "Foto Serviks Ny. E",
            "keterangan": "Amati tampilan serviks pasca aplikasi asam asetat 3–5% (serviks licin, merah muda merata, tidak terdapat plak asetowhite), lalu tetapkan kesimpulan hasil skrining."
          }
        ],
        "pilihan_jawaban": [
          {
            "id": "opt-case_e-1",
            "label": "IVA negatif",
            "is_correct": true,
            "skor": 25
          },
          {
            "id": "opt-case_e-2",
            "label": "IVA positif dengan lesi tidak luas",
            "is_correct": false,
            "skor": 0
          },
          {
            "id": "opt-case_e-3",
            "label": "IVA positif dengan lesi luas/mencurigakan keganasan",
            "is_correct": false,
            "skor": 0
          },
          {
            "id": "opt-case_e-4",
            "label": "Karena hasil negatif, pasien tidak perlu skrining lagi seumur hidup",
            "is_correct": false,
            "skor": 0
          },
          {
            "id": "opt-case_e-5",
            "label": "Vaksinasi HPV yang sudah didapat menjamin pasien tidak akan pernah terkena kanker serviks",
            "is_correct": false,
            "skor": 0
          },
          {
            "id": "opt-case_e-6",
            "label": "Perlu dirujuk ke SpOG karena termasuk kelompok risiko tinggi",
            "is_correct": false,
            "skor": 0
          }
        ]
      },
      "stase5": {
        "header": {
          "nama_stase": "Pos 5: Asuhan Kebidanan & Konseling Interaktif",
          "kode_amplop": "AMP-ASH-E5",
          "durasi_menit": 8,
          "petunjuk_soal": "Berikan apresiasi atas kesadaran pasien melakukan deteksi dini, sampaikan hasil IVA negatif normal, berikan edukasi pencegahan kanker serviks, edukasi imunisasi HPV, dan anjurkan jadwal skrining ulang 3–5 tahun lagi."
        },
        "ai_system_prompt": "Kamu adalah Ny. E, usia 33 tahun, dengan status obstetri G1P1A0.\nKeluhan awalmu: Tidak ada keluhan (asimtomatik).\nKamu baru saja selesai diperiksa IVA oleh Bidan dan sedang berkonsultasi di Pos 5 untuk mendengarkan penjelasan hasil pemeriksaan, konseling, dan rencana tindak lanjut.\nKarakteristik kepribadian & emosi:\n- Merasa cemas terhadap hasil pemeriksaan namun sangat menghargai dan kooperatif terhadap saran bidan.\n- Berbahasa Indonesia yang sopan dan santun.\n- Ajukan pertanyaan klarifikasi jika Bidan menjelaskan tindakan medis (seperti rujukan SpOG atau krioterapi).",
        "triggers": [
          {
            "id": "trg-ai-ash-e-1",
            "konteks": "Menjelaskan hasil pemeriksaan IVA (negatif) kepada pasien dengan bahasa sederhana.",
            "keyword": "menjelaskan, hasil, pemeriksaan, negatif, pasien",
            "skor": 17,
            "jawaban_cadangan": "Terima kasih penjelasannya Bu Bidan, jadi kondisi serviks saya seperti itu ya... Saya sempat khawatir sekali. Bagaimana langkah selanjutnya Bu?"
          },
          {
            "id": "trg-ai-ash-e-2",
            "konteks": "Memberikan apresiasi dan motivasi karena pasien bersedia mengikuti skrining meski tanpa keluhan.",
            "keyword": "memberikan, apresiasi, motivasi, karena, pasien",
            "skor": 17,
            "jawaban_cadangan": "Baik Bu Bidan, terima kasih atas penjelasan dan dukungannya. Saya memahami terkait \"Memberikan apresiasi dan motivasi karena pasien bersedia mengikuti skrining meski tanpa keluhan.\" dan bersedia mengikuti panduan Bu Bidan."
          },
          {
            "id": "trg-ai-ash-e-3",
            "konteks": "Menjelaskan bahwa hasil negatif bukan berarti bebas risiko seumur hidup, sehingga skrining tetap perlu diulang secara berkala.",
            "keyword": "menjelaskan, bahwa, hasil, negatif, bukan",
            "skor": 17,
            "jawaban_cadangan": "Baik Bu Bidan, terima kasih atas penjelasan dan dukungannya. Saya memahami terkait \"Menjelaskan bahwa hasil negatif bukan berarti bebas risiko seumur hidup, sehingga skrining tetap perlu diulang secara berkala.\" dan bersedia mengikuti panduan Bu Bidan."
          },
          {
            "id": "trg-ai-ash-e-4",
            "konteks": "Memberikan edukasi pola hidup sehat untuk mempertahankan kondisi kesehatan reproduksi.",
            "keyword": "memberikan, edukasi, pola, hidup, sehat",
            "skor": 17,
            "jawaban_cadangan": "Baik Bu Bidan, terima kasih atas penjelasan dan dukungannya. Saya memahami terkait \"Memberikan edukasi pola hidup sehat untuk mempertahankan kondisi kesehatan reproduksi.\" dan bersedia mengikuti panduan Bu Bidan."
          },
          {
            "id": "trg-ai-ash-e-5",
            "konteks": "Menjadwalkan atau menganjurkan waktu IVA ulang berikutnya sesuai pedoman program skrining.",
            "keyword": "menjadwalkan, atau, menganjurkan, waktu, ulang",
            "skor": 17,
            "jawaban_cadangan": "Baik Bu Bidan, terima kasih atas penjelasan dan dukungannya. Saya memahami terkait \"Menjadwalkan atau menganjurkan waktu IVA ulang berikutnya sesuai pedoman program skrining.\" dan bersedia mengikuti panduan Bu Bidan."
          },
          {
            "id": "trg-ai-ash-e-6",
            "konteks": "Mendokumentasikan hasil pemeriksaan dan edukasi yang diberikan.",
            "keyword": "mendokumentasikan, hasil, pemeriksaan, edukasi, diberikan",
            "skor": 17,
            "jawaban_cadangan": "Baik Bu Bidan, terima kasih atas penjelasan dan dukungannya. Saya memahami terkait \"Mendokumentasikan hasil pemeriksaan dan edukasi yang diberikan.\" dan bersedia mengikuti panduan Bu Bidan."
          }
        ]
      }
    },
    "has_perekam_nilai": true,
    "created_at": "2026-08-31"
  }
];
