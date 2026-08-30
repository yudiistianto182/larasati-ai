export interface ContestPeriodeOption {
  periode_id: number;
  periode_name: string;
}

export interface ContestRow {
  contest_id: number;
  contest_name: string;
  contest_periode_id: number;
  contest_datestart: string;
  contest_dateend: string;
  contest_desc: string;
}

export const fallbackContestPeriodes: ContestPeriodeOption[] = [
  { periode_id: 1, periode_name: "Periode 2024" },
  { periode_id: 2, periode_name: "Periode 2025" },
  { periode_id: 3, periode_name: "Periode 2026" },
];

export const fallbackContests: ContestRow[] = [
  {
    contest_id: 1,
    contest_name: "Olimpiade Asuhan Kebidanan Nasional 2026",
    contest_periode_id: 3,
    contest_datestart: "2026-03-01T08:00:00Z",
    contest_dateend: "2026-03-05T17:00:00Z",
    contest_desc: "Kompetisi sirkuit stase klinis kebidanan terintegrasi AI & SOP IVA.",
  },
  {
    contest_id: 2,
    contest_name: "Simulasi Uji Kompetensi Bidan",
    contest_periode_id: 3,
    contest_datestart: "2026-03-10T08:00:00Z",
    contest_dateend: "2026-03-12T17:00:00Z",
    contest_desc: "Latihan intensif skenario asuhan kebidanan stase terpadu.",
  },
];
