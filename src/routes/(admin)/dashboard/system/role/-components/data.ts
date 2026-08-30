export interface RoleRow {
  role_id: number;
  role_name: string;
}

// Fallback dummy data. When backend integration is ready, this can be swapped or disabled.
export const fallbackRoles: RoleRow[] = [
  { role_id: 1, role_name: "Super Admin" },
  { role_id: 2, role_name: "Midwife Coordinator" },
  { role_id: 3, role_name: "Field Midwife" },
  { role_id: 4, role_name: "Staff Administrasi" },
];
