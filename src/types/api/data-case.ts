/**
 * DataCase Module API Types (Bank Kasus & 5 Stase Quests)
 * Ref: docs/api/data-case.json
 */

import type { DataPatientItem } from "./data-patient";

export interface CaseAttributeItem {
  caseattribute_id?: number;
  caseattribute_case_id?: number;
  caseattribute_name: string;
  caseattribute_value: string;
}

export interface CaseTriggerItem {
  casequestiatrigger_id?: number;
  casequestiatrigger_name: string;
  casequestiatrigger_key: string;
  casequestiatrigger_response: string;
  casequestiatrigger_score: string | number;
  casequestiatrigger_casequest_id?: number;
}

export interface CaseQuestItem {
  casequest_id: number;
  casequest_case_id: number;
  casequest_name: string;
  casequest_method_id: number;
  casequest_order: number;
  casequest_limit_time: number;
  method_name?: string;
  personality?: string;
  casequestia_initmsg?: string;
  trigger?: CaseTriggerItem[];
  mc?: any[];
  os?: any[];
  ci?: any[];
  ci_option?: any[];
  casequestrecord_is_active?: number;
}

export interface CasePatientWrapper {
  casepatient_id: number;
  casepatient_case_id: number;
  casepatient_patient_id: number;
  patient: DataPatientItem;
}

export interface DataCaseItem {
  case_id: number;
  case_name: string;
  case_desc: string;
  case_introduction: string;
  numb?: number;
}

export interface DataCaseDetail {
  case_id: number;
  case_name: string;
  case_desc: string;
  case_introduction: string;
  insert_user_id?: number | null;
  insert_timestamp?: string | null;
  attribute: CaseAttributeItem[];
  quest: CaseQuestItem[];
  patient: CasePatientWrapper[];
}

export interface DataCasePayload {
  case_name: string;
  case_desc: string;
  case_introduction: string;
  attribute?: {
    caseattribute_name: string;
    caseattribute_value: string;
  }[];
  patient_ids?: number[];
}
