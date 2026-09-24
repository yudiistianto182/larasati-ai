/**
 * Auth Module API Types
 * Ref: docs/api/auth.json
 */

export interface LoginPayload {
  user_name: string;
  user_password: string;
}

export interface AuthUserData {
  user_id: number;
  user_name: string;
  user_email: string;
  role_id: number;
  role_name: string;
}

export interface AuthTokenData {
  type: string;
  token: string;
  expires_at: string;
  expires_at_text: string;
}

export interface ContestTeamContestInfo {
  contest_id: number;
  contest_name: string;
  contest_desc: string | null;
  contest_periode_id: number;
  periode_name: string;
  periode_desc: string | null;
  contest_datestart: string;
  contest_datestart_text: string;
  contest_dateend: string;
  contest_dateend_text: string;
  is_open: boolean;
  status: string;
}

export interface ContestTeamCaseInfo {
  case_id: number;
  case_name: string;
  case_desc: string;
  case_introduction: string;
}

export interface ContestTeamInfo {
  contestteam_id: number;
  contestteam_name: string;
  is_leader: boolean;
  contest: ContestTeamContestInfo;
  case: ContestTeamCaseInfo;
}

export interface ScorerInfo {
  contestscorer_id: number;
  contest_id: number;
  contest_name: string;
  contest_desc: string | null;
  contest_periode_id: number;
  periode_name: string;
  periode_desc: string | null;
  contest_datestart: string;
  contest_datestart_text: string;
  contest_dateend: string;
  contest_dateend_text: string;
  is_open: boolean;
  status: string;
}

export interface LoginResponseData {
  user: AuthUserData;
  token: AuthTokenData;
  contest_team: ContestTeamInfo[];
  scorer: ScorerInfo[];
}

export interface ProfileResponseData {
  user: AuthUserData;
  contest_team: ContestTeamInfo[];
  scorer: ScorerInfo[];
}
