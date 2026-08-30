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
  { role_id: 2, role_name: "Midwife Coordinator" },
  { role_id: 3, role_name: "Field Midwife" },
  { role_id: 4, role_name: "Staff Administrasi" },
];

export const fallbackAdminUsers: AdminUserRow[] = [
  {
    user_id: 1,
    user_name: "root",
    user_fullname: "Root Administrator",
    user_role_id: 1,
    user_is_banned: 0,
    user_email: "root@gmail.com",
    role_name: "Root",
    numb: 1,
    user_password: "rootPassword123",
  },
  {
    user_id: 2,
    user_name: "siti_midwife",
    user_fullname: "Siti Rahmawati",
    user_role_id: 2,
    user_is_banned: 0,
    user_email: "siti.rahma@gmail.com",
    role_name: "Midwife Coordinator",
    numb: 2,
    user_password: "midwifePassSiti",
  },
  {
    user_id: 3,
    user_name: "dewi_field",
    user_fullname: "Dewi Lestari",
    user_role_id: 3,
    user_is_banned: 0,
    user_email: "dewi.lestari@gmail.com",
    role_name: "Field Midwife",
    numb: 3,
    user_password: "dewiFieldSecure",
  },
];
