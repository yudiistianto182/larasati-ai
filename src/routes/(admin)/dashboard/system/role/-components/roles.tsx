import * as React from "react";
import {
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { dataTableFeatures } from "@/lib/data-table-features";

import { fallbackRoles, type RoleRow } from "./data";
import { getRolesColumns } from "./roles-columns";
import { RolesTable } from "./roles-table";

export function Roles() {
  // Roles list state (seeded with dummy fallback data)
  const [roles, setRoles] = React.useState<RoleRow[]>(fallbackRoles);

  // Dialog and form states
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newRoleName, setNewRoleName] = React.useState("");

  // Edit states
  const [editingRole, setEditingRole] = React.useState<RoleRow | null>(null);
  const [editRoleName, setEditRoleName] = React.useState("");

  // Delete confirmation states
  const [deletingRole, setDeletingRole] = React.useState<RoleRow | null>(null);

  // TanStack table states
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "role_name", desc: false }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const handleEditTrigger = React.useCallback((role: RoleRow) => {
    setEditingRole(role);
    setEditRoleName(role.role_name);
  }, []);

  const handleDeleteTrigger = React.useCallback((role: RoleRow) => {
    setDeletingRole(role);
  }, []);

  const columns = React.useMemo(
    () => getRolesColumns(handleEditTrigger, handleDeleteTrigger),
    [handleEditTrigger, handleDeleteTrigger]
  );

  const table = useTable({
    features: dataTableFeatures,
    data: roles,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    getRowId: (row) => String(row.role_id),
    autoResetPageIndex: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
  });

  const searchQuery = (table.getColumn("role_name")?.getFilterValue() as string | undefined) ?? "";

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const nextId = roles.length > 0 ? Math.max(...roles.map((r) => r.role_id)) + 1 : 1;
    const newRole: RoleRow = {
      role_id: nextId,
      role_name: newRoleName.trim(),
    };

    setRoles((prev) => [...prev, newRole]);
    setNewRoleName("");
    setIsDialogOpen(false);
  };

  const handleEditRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole || !editRoleName.trim()) return;

    setRoles((prev) =>
      prev.map((role) =>
        role.role_id === editingRole.role_id
          ? { ...role, role_name: editRoleName.trim() }
          : role
      )
    );
    setEditingRole(null);
    setEditRoleName("");
  };

  const confirmDeleteRole = () => {
    if (!deletingRole) return;
    setRoles((prev) => prev.filter((role) => role.role_id !== deletingRole.role_id));
    setDeletingRole(null);
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <Card>
        <CardHeader className="border-b has-data-[slot=card-action]:grid-cols-1 md:has-data-[slot=card-action]:grid-cols-[1fr_auto]">
          <CardTitle className="text-xl leading-none">Roles</CardTitle>
          <CardDescription className="max-w-sm leading-snug">
            Manage system access levels, permissions, and midwife roles.
          </CardDescription>
          <CardAction className="col-start-1 row-start-auto flex w-full flex-wrap justify-start gap-2 justify-self-stretch md:col-start-2 md:row-span-2 md:row-start-1 md:w-auto md:flex-nowrap md:justify-end md:justify-self-end">
            <InputGroup className="h-7 w-full md:w-64">
              <InputGroupAddon align="inline-start">
                <Search className="size-3.5" />
              </InputGroupAddon>
              <InputGroupInput
                className="h-7"
                placeholder="Search roles..."
                value={searchQuery}
                onChange={(event) => {
                  table.getColumn("role_name")?.setFilterValue(event.target.value || undefined);
                  table.setPageIndex(0);
                }}
              />
            </InputGroup>
            <Button size="sm" onClick={() => setIsDialogOpen(true)}>
              <Plus /> Tambah Role
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-0">
          <RolesTable table={table} />
        </CardContent>
      </Card>

      {/* Add Role Dialog Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Role</DialogTitle>
            <DialogDescription>
              Input the name of the new role you want to add to the system.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddRole} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                placeholder="e.g. Senior Midwife"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                autoFocus
              />
            </div>

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setNewRoleName("");
                }}
              >
                Batal
              </Button>
              <Button type="submit" disabled={!newRoleName.trim()}>
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog Modal */}
      <Dialog open={editingRole !== null} onOpenChange={(open) => !open && setEditingRole(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah Nama Role</DialogTitle>
            <DialogDescription>
              Ubah nama role untuk data ini.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditRoleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-role-name">Role Name</Label>
              <Input
                id="edit-role-name"
                value={editRoleName}
                onChange={(e) => setEditRoleName(e.target.value)}
                autoFocus
              />
            </div>

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingRole(null);
                  setEditRoleName("");
                }}
              >
                Batal
              </Button>
              <Button type="submit" disabled={!editRoleName.trim()}>
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Role Confirmation Dialog Modal */}
      <Dialog open={deletingRole !== null} onOpenChange={(open) => !open && setDeletingRole(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Role</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus role <strong>{deletingRole?.role_name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingRole(null)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteRole}
            >
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
