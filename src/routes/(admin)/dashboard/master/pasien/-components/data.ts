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

