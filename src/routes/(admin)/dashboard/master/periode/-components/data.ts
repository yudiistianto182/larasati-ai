export interface PeriodeRow {
  periode_id: number;
  periode_name: string;
}

// Fallback dummy data. When backend integration is ready, this can be swapped or disabled.
export const fallbackPeriodes: PeriodeRow[] = [
  { periode_id: 1, periode_name: "Periode 2024" },
  { periode_id: 2, periode_name: "Periode 2025" },
  { periode_id: 3, periode_name: "Periode 2026" },
];
