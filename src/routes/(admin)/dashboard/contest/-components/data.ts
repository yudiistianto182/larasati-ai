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
  contest_datestart_text?: string;
  contest_dateend_text?: string;
  scorer?: { contestscorer_id: number; user_fullname: string }[];
}
