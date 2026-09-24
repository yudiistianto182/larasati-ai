export interface PatientAttribute {
  id: string;
  key: string;
  value: string;
}

export interface Pasien {
  id: string;
  nama: string;
  umur: number;
  jenis_kelamin: "Perempuan" | "Laki-laki";
  latar_belakang: string;
  atribut: PatientAttribute[];
  created_at: string;
}
