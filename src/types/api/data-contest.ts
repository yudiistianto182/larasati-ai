/**
 * DataContest API Types
 * Ref: docs/api/data-contest.json
 */

export interface DataContestItem {
  contest_id: number;
  contest_name: string;
  contest_periode_id: number;
  contest_datestart: string;
  contest_dateend: string;
  contest_desc: string;
  contest_datestart_text?: string;
  contest_dateend_text?: string;
  numb?: number;
}

export interface ContestScorerItem {
  contestscorer_id: number;
  user_fullname: string;
}

export interface DataContestDetail extends DataContestItem {
  insert_user_id: number | null;
  insert_timestamp: string | null;
  update_user_id: number | null;
  update_timestamp: string | null;
  scorer: ContestScorerItem[];
}

export interface DataContestPayload {
  name: string;
  periode_id: string | number;
  datestart: string;
  dateend: string;
  desc: string;
  scorer?: { user_id: string | number }[];
  case?: { case_id: string | number }[];
}
