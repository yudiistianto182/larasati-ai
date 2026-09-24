/**
 * DataContestTeam API Types
 * Ref: docs/api/data-contest-team.json
 */

export interface DataContestTeamItem {
  contestteam_id: number;
  contestteam_name: string;
  contestteam_contest_id: number;
  contestteam_contestcase_id: number | null;
  numb?: number;
}

export interface ContestTeamMemberItem {
  contestteammember_id: number;
  contestteammember_contestteam_id: number;
  contestteammember_user_id: number;
  contestteammember_is_leader: number;
  user_id: number;
  user_name: string;
  user_fullname: string;
  user_role_id: number;
  user_is_banned: number;
  user_email: string;
}

export interface DataContestTeamDetail extends DataContestTeamItem {
  member: ContestTeamMemberItem[];
}

export interface DataContestTeamPayload {
  name: string;
  contest_id: string | number;
  member: { user_id: string | number; is_leader?: string | number }[];
  case_id?: string | number;
  contestcase_id?: string | number;
}
