/**
 * RefMethod Module API Types (Master Pos & Metode Stase OSCE)
 * Ref: docs/api/ref-method.json
 */

export interface RefMethodItem {
  method_id: number;
  method_name: string;
  numb?: number;
}

export interface RefMethodRuleDetail {
  methodruledetail_id?: number;
  methodruledetail_methodrule_id?: number;
  methodruledetail_text: string;
  methodruledetail_order: number;
}

export interface RefMethodRule {
  methodrule_id?: number;
  methodrule_method_id?: number;
  methodrule_text: string;
  methodrule_order: number;
  detail: RefMethodRuleDetail[];
}

export interface RefMethodDetail {
  method_id: number;
  method_name: string;
  rule: RefMethodRule[];
}

export interface RefMethodUpdatePayload {
  method_name: string;
  rule: {
    methodrule_text: string;
    methodrule_order: number;
    detail: {
      methodruledetail_text: string;
      methodruledetail_order: number;
    }[];
  }[];
}
