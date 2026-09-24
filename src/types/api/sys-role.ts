/**
 * SysRole Module API Types
 * Ref: docs/api/sys-role.json
 */

export interface SysRoleItem {
  id: number;
  text: string;
}

export type KnownSysRole =
  | "Root"
  | "Administrator"
  | "Reporter"
  | "Juri"
  | "Peserta";
