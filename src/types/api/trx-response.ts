/**
 * TrxResponse API Types
 * Ref: docs/api/trx-response.json
 * Endpoint: /v1/trx_response
 */

export interface TrxResponsePosItem {
  casequest_id: number;
  casequest_order: number;
  pos_order: number;
  casequest_name: string;
  pos_name: string;
  casequest_method_id: number;
  method_name: string;
  is_completed: boolean;
  status_text: string;
  score: number;
}

export interface TrxResponseItem {
  response_id: number;
  response_contest_id: number;
  response_contestteam_id: number;
  response_is_submited: number;
  response_total_score: string;
  response_case_id: number;
  response_patient_id: number;
  contestteam_name: string;
  contest_name: string | null;
  case_name: string;
  patient_id: number;
  numb?: number;
  pos?: TrxResponsePosItem[];
  pos_completed?: TrxResponsePosItem[];
  pos_completed_orders?: number[];
  pos_completed_names?: string[];
  pos_completed_count?: number;
  pos_total_count?: number;
  pos_progress?: string;
  pos_progress_text?: string;
  calculated_total_score?: number;
}

export interface TrxResponsePayload {
  contest_id: number | string;
  contestteam_id: number | string;
  case_id: number | string;
  patient_id: number | string;
}

export interface TrxResponseStoreResult {
  status: boolean;
  message: string;
  response_id?: number;
  data?: {
    response_id?: number;
  };
}
