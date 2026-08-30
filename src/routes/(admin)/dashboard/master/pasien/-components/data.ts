export interface PatientAttribute {
  id: string;
  key: string;
  value: string;
}

export interface Pasien {
  id: string;
  nama: string;
  tanggal_lahir: string; // YYYY-MM-DD
  umur?: number;
  jenis_kelamin: "Perempuan" | "Laki-laki";
  latar_belakang: string;
  atribut: PatientAttribute[];
  created_at: string;
}

export function calculateAge(tanggalLahir?: string): number {
  if (!tanggalLahir) return 0;
  const birthDate = new Date(tanggalLahir);
  if (isNaN(birthDate.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(age, 0);
}

export const fallbackPasien: Pasien[] = [
  {
    id: "PSN-001",
    nama: "Siti Rahmawati",
    tanggal_lahir: "1998-04-12",
    umur: 28,
    jenis_kelamin: "Perempuan",
    latar_belakang: "Ibu hamil anak kedua, riwayat persalinan pertama normal di bidan. Tidak ada riwayat hipertensi.",
    atribut: [
      { id: "attr-1-1", key: "Golongan Darah", value: "O+" },
      { id: "attr-1-2", key: "Usia Kehamilan", value: "28 Minggu (Trimester 3)" },
      { id: "attr-1-3", key: "Tekanan Darah", value: "115/75 mmHg" },
      { id: "attr-1-4", key: "Kontak Darurat", value: "081234567890 (Suami - Budi)" },
    ],
    created_at: "2026-08-10",
  },
  {
    id: "PSN-002",
    nama: "Dewi Lestari",
    tanggal_lahir: "1994-08-25",
    umur: 32,
    jenis_kelamin: "Perempuan",
    latar_belakang: "Kehamilan pertama (primigravida). Memiliki riwayat alergi obat antibiotik golongan penisilin.",
    atribut: [
      { id: "attr-2-1", key: "Golongan Darah", value: "A+" },
      { id: "attr-2-2", key: "Riwayat Alergi", value: "Penisilin" },
      { id: "attr-2-3", key: "Tinggi Badan", value: "158 cm" },
      { id: "attr-2-4", key: "Berat Badan", value: "62 kg" },
    ],
    created_at: "2026-08-12",
  },
  {
    id: "PSN-003",
    nama: "Ahmad Rizky Pratama",
    tanggal_lahir: "2022-03-10",
    umur: 4,
    jenis_kelamin: "Laki-laki",
    latar_belakang: "Balita pemeriksaan tumbuh kembang rutin dan pemantauan status gizi posyandu.",
    atribut: [
      { id: "attr-3-1", key: "Nama Ibu", value: "Nurul Hidayah" },
      { id: "attr-3-2", key: "Status Imunisasi", value: "Lengkap Sesuai Usia" },
      { id: "attr-3-3", key: "Berat Badan", value: "15.4 kg" },
      { id: "attr-3-4", key: "Tinggi Badan", value: "102 cm" },
    ],
    created_at: "2026-08-15",
  },
  {
    id: "PSN-004",
    nama: "Anisa Wardani",
    tanggal_lahir: "2002-01-19",
    umur: 24,
    jenis_kelamin: "Perempuan",
    latar_belakang: "Pemeriksaan pra-konsepsi dan perencanaan kehamilan sehat bersama pasangan.",
    atribut: [
      { id: "attr-4-1", key: "Golongan Darah", value: "B+" },
      { id: "attr-4-2", key: "Hb Terakhir", value: "12.8 g/dL" },
      { id: "attr-4-3", key: "Status TT", value: "TT 2" },
    ],
    created_at: "2026-08-18",
  },
  {
    id: "PSN-005",
    nama: "Bambang Sudiro",
    tanggal_lahir: "1981-11-05",
    umur: 45,
    jenis_kelamin: "Laki-laki",
    latar_belakang: "Pemeriksaan kesehatan umum keluarga dan konsultasi pola makan sehat pencegahan diabetes.",
    atribut: [
      { id: "attr-5-1", key: "Tekanan Darah", value: "130/85 mmHg" },
      { id: "attr-5-2", key: "Gula Darah Sewaktu", value: "110 mg/dL" },
      { id: "attr-5-3", key: "Merokok", value: "Tidak" },
    ],
    created_at: "2026-08-20",
  },
  {
    id: "PSN-006",
    nama: "Rina Kusuma",
    tanggal_lahir: "1997-06-30",
    umur: 29,
    jenis_kelamin: "Perempuan",
    latar_belakang: "Pasca persalinan 2 minggu (nifas), kontrol jahitan perineum dan edukasi ASI eksklusif.",
    atribut: [
      { id: "attr-6-1", key: "Hari Ke Nifas", value: "Hari ke-14" },
      { id: "attr-6-2", key: "Produksi ASI", value: "Lancar" },
      { id: "attr-6-3", key: "Metode KB Pilihan", value: "IUD Pasca Plasenta" },
    ],
    created_at: "2026-08-22",
  },
];
