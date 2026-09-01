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
    nama: "Ny. Ani",
    tanggal_lahir: "1981-05-14",
    umur: 45,
    jenis_kelamin: "Perempuan",
    latar_belakang: "Pasien multipara (G5P4A0) usia 45 tahun dengan keluhan keputihan abnormal kronis dan perdarahan kontak pasca senggama.",
    atribut: [
      { id: "attr-1-1", key: "Status Obstetri", value: "G5P4A0" },
      { id: "attr-1-2", key: "Riwayat Kontrasepsi", value: "IUD 8 Tahun" },
      { id: "attr-1-3", key: "Status Skrining", value: "Belum Pernah IVA/Pap Smear" },
      { id: "attr-1-4", key: "Status Vaksinasi", value: "Belum Vaksin HPV" },
    ],
    created_at: "2026-08-10",
  },
  {
    id: "PSN-002",
    nama: "Ny. B",
    tanggal_lahir: "1988-08-20",
    umur: 38,
    jenis_kelamin: "Perempuan",
    latar_belakang: "Pasien multipara usia 38 tahun dengan keputihan berbau dan gatal, dianjurkan kader Posyandu untuk pemeriksaan IVA.",
    atribut: [
      { id: "attr-2-1", key: "Status Obstetri", value: "G4P4A0" },
      { id: "attr-2-2", key: "Riwayat Kontrasepsi", value: "IUD 3 Tahun" },
      { id: "attr-2-3", key: "Status Skrining", value: "Belum Pernah IVA" },
      { id: "attr-2-4", key: "Status Vaksinasi", value: "Belum Vaksin HPV" },
    ],
    created_at: "2026-08-12",
  },
  {
    id: "PSN-003",
    nama: "Ny. C",
    tanggal_lahir: "1997-03-15",
    umur: 29,
    jenis_kelamin: "Perempuan",
    latar_belakang: "Pasien usia 29 tahun dengan keluhan keputihan banyak berbau amis dan gatal akibat kebiasaan sabun pembersih kewanitaan.",
    atribut: [
      { id: "attr-3-1", key: "Status Obstetri", value: "G2P2A0" },
      { id: "attr-3-2", key: "Riwayat Kontrasepsi", value: "Kondom" },
      { id: "attr-3-3", key: "Status Skrining", value: "Kunjungan Pertama" },
      { id: "attr-3-4", key: "Status Vaksinasi", value: "Belum Vaksin HPV" },
    ],
    created_at: "2026-08-15",
  },
  {
    id: "PSN-004",
    nama: "Ny. D",
    tanggal_lahir: "1974-11-05",
    umur: 52,
    jenis_kelamin: "Perempuan",
    latar_belakang: "Wanita pascamenopause 52 tahun dengan perdarahan jalan lahir berulang, keputihan busuk bercampur darah, dan nyeri panggul.",
    atribut: [
      { id: "attr-4-1", key: "Status Obstetri", value: "G6P5A1" },
      { id: "attr-4-2", key: "Status Menopause", value: "Menopause ± 3 Tahun" },
      { id: "attr-4-3", key: "Status Skrining", value: "Belum Pernah Skrining" },
      { id: "attr-4-4", key: "Status Klinis", value: "Curiga Ca Serviks Invasif" },
    ],
    created_at: "2026-08-18",
  },
  {
    id: "PSN-005",
    nama: "Ny. E",
    tanggal_lahir: "1993-06-22",
    umur: 33,
    jenis_kelamin: "Perempuan",
    latar_belakang: "Pasien usia subur 33 tahun asimtomatik yang mengikuti program skrining massal pencegahan kanker serviks.",
    atribut: [
      { id: "attr-5-1", key: "Status Obstetri", value: "G1P1A0" },
      { id: "attr-5-2", key: "Riwayat Kontrasepsi", value: "Pil KB" },
      { id: "attr-5-3", key: "Status Skrining", value: "Skrining Rutin Pertama" },
      { id: "attr-5-4", key: "Status Vaksinasi", value: "Belum Vaksin HPV" },
    ],
    created_at: "2026-08-20",
  },
];
