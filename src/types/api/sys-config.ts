/**
 * SysConfig Module API Types
 * Ref: docs/api/sys-config.json
 */

export type KnownSysConfigKey =
  | "GEMINI_API_KEY"
  | "SIMLI_API_KEY"
  | "ELEVENLABS_API_KEY";

export interface SysConfigDropdownItem {
  id: KnownSysConfigKey | string;
  text: string;
}

export interface SysConfigDetail {
  config_id: number;
  config_name: string;
  config_value: string;
}
