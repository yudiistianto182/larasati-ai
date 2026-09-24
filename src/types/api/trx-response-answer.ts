/**
 * TrxResponseAnswer API Types
 * Ref: docs/api/trx-response-answer.json
 * Endpoint: /v1/trx_response_answer
 */

// 1. Chat Turn (POST /v1/trx_response_answer/chat)
export interface TrxChatPayload {
  response_id: number | string;
  casequest_id: number | string;
  sender: 2; // 1: AI/Pasien | 2: Peserta / Bidan
  text: string;
}

export interface TrxChatMessageItem {
  responseia_id: number | null;
  responseia_response_id?: number | string;
  responseia_casequest_id?: number | string;
  responseia_sender: number; // 1: Pasien, 2: Bidan
  sender?: string;
  responseia_text: string;
  insert_timestamp?: string;
  chat_time?: string;
}

export interface TrxChatResponseData {
  participant_chat: TrxChatMessageItem;
  ai_reply: TrxChatMessageItem;
  matched_trigger?: unknown;
  is_trigger_matched?: boolean;
}

export interface TrxOrderAnswerItem {
  casequestos_id: string | number;
  order: number;
}

// 2. Submit Answers (POST /v1/trx_response_answer)
export interface TrxStoreAnswerPayload {
  response_id: number | string;
  casequest_id: number | string;
  answers?: (string | number | TrxOrderAnswerItem)[];
  casequestcioption_id?: number | string;
  responseanswer_submited?: number | string;
  duration?: number | string;
}

export interface TrxStoreAnswerResponseData {
  response_id?: string | number;
  casequest_id?: string | number;
  responseanswer_response_id?: string | number;
  responseanswer_casequest_id?: string | number;
  responseanswer_submited?: number;
  responseanswer_score?: number;
  total_answers?: number;
  total_score?: number;
  answers?: unknown[];
}

export interface TrxStoreRecordResponseData {
  response_id: string | number;
  casequest_id: string | number;
  file: string;
  size: number;
  duration: number;
}

// 3. Detail TrxResponseAnswer (GET /v1/trx_response_answer/:id)
export interface TrxAnswerChatRuleDetail {
  methodruledetail_id: number;
  methodruledetail_methodrule_id: number;
  methodruledetail_text: string;
  methodruledetail_order: number;
}

export interface TrxAnswerChatRule {
  methodrule_id: number;
  methodrule_method_id: number;
  methodrule_text: string;
  methodrule_order: number;
  detail: TrxAnswerChatRuleDetail[];
}

export interface TrxAnswerTriggerItem {
  responseiatrigger_id: number;
  responseiatrigger_casequest_id: number;
  responseiatrigger_trigger_id: number;
  responseiatrigger_score: string;
  responseiatrigger_response_id: number;
  casequestiatrigger_name: string;
  casequestiatrigger_key: string;
}

export interface TrxAnswerChatsWrapper {
  chats: TrxChatMessageItem[];
  triggers?: TrxAnswerTriggerItem[];
}

export interface TrxAnswerMcItem {
  casequestmc_id: string | number;
  casequestmc_name: string;
  score: number;
}

export interface TrxAnswerOsItem {
  casequestos_id: string | number;
  casequestos_name: string;
  correct_order: number;
  user_order: number;
  is_correct: boolean;
  score: number;
}

export interface TrxAnswerRecordItem {
  responserecord_id: number;
  responserecord_response_id: number;
  responserecord_size: number;
  responserecord_duration: number;
  responserecord_file: string;
  responserecord_casequest_id: number;
  responserecord_score: string;
}

export interface TrxAnswerPosItem {
  casequest_id: number;
  casequest_name: string;
  casequest_method_id: number;
  method_name: string;
  casequest_order: number;
  casequest_limit_time: number;
  rule?: TrxAnswerChatRule[];
  answers?: TrxAnswerChatsWrapper | TrxAnswerMcItem[] | TrxAnswerOsItem[] | TrxAnswerRecordItem[] | any;
  total_score?: number;
  os?: any[];
  ci?: any[];
  ci_option?: any[];
  mc?: any[];
  record?: number;
  is_active_record?: number;
  record_detail?: any;
}

export interface TrxResponseAnswerDetail {
  response_id: number;
  response_contest_id: number;
  response_contestteam_id: number;
  response_case_id: number;
  response_patient_id: number;
  response_total_score: string;
  response_is_submited: number;
  patient_name: string;
  patient_birthdate: string;
  patient_gender: string;
  case_name: string;
  case_desc: string;
  contestteam_name: string;
  calculated_total_score: number;
  pos: TrxAnswerPosItem[];
}
