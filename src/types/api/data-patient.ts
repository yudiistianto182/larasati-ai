/**
 * DataPatient Module API Types
 * Ref: docs/api/data-patient.json
 */

export interface PatientAttributeItem {
  patientattribute_id?: number;
  patientattribute_patient_id?: number;
  patientattribute_name: string;
  patientattribute_value: string;
}

export interface DataPatientItem {
  patient_id: number;
  patient_name: string;
  patient_birthdate: string;
  patient_photo?: string | null;
  patient_photo_path?: string | null;
  patient_gender: "P" | "L" | string;
  patient_is_deleted?: number;
  patient_avatar_id?: string;
  patient_birthdate_text?: string;
  patient_age?: number;
  patient_gender_text?: string;
  attribute?: PatientAttributeItem[];
  numb?: number;
}

export interface DataPatientPayload {
  patient_name: string;
  patient_birthdate: string;
  patient_gender: "P" | "L" | string;
  patient_avatar_id?: string;
  attribute?: {
    patientattribute_name: string;
    patientattribute_value: string;
  }[];
}
