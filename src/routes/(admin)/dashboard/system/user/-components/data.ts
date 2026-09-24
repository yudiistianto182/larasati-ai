export interface AdminUserRow {
  user_id: number;
  user_name: string;
  user_password?: string;
  user_fullname: string;
  user_role_id: number;
  user_is_banned: number;
  user_email: string;
  role_name: string;
  numb: number;
}

export interface AdminRoleOption {
  role_id: number;
  role_name: string;
}

export const adminRoles: AdminRoleOption[] = [
  { role_id: 1, role_name: "Root" },
  { role_id: 2, role_name: "Administrator" },
  { role_id: 3, role_name: "Reporter" },
  { role_id: 4, role_name: "Juri" },
  { role_id: 5, role_name: "Peserta" },
];
