/**
 * SysUser Module API Types
 * Ref: docs/api/sys-user.json
 */

export interface SysUserItem {
  user_id: number;
  user_name: string;
  user_password?: string;
  user_fullname: string;
  user_role_id: number;
  user_is_banned: number;
  user_email: string;
  role_name: string;
  numb?: number;
}

export interface SysUserStorePayload {
  user_name: string;
  user_password?: string;
  user_fullname: string;
  user_email: string;
  user_role_id: number | string;
  user_is_banned?: number | string;
}

export interface SysUserUpdatePayload {
  user_name?: string;
  user_password?: string;
  user_fullname?: string;
  user_email?: string;
  user_role_id?: number | string;
  user_is_banned?: number | string;
}
