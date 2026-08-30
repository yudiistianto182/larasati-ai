import * as React from "react";
import {
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";
import { Check, Copy, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { dataTableFeatures } from "@/lib/data-table-features";

import { fallbackAdminUsers, adminRoles, type AdminUserRow } from "./data";
import { getAdminUsersColumns } from "./users-columns";
import { AdminUsersTable } from "./users-table";

export function AdminUsers() {
  // Local list state
  const [users, setUsers] = React.useState<AdminUserRow[]>(fallbackAdminUsers);

  // Dialog open states
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<AdminUserRow | null>(null);
  const [deletingUser, setDeletingUser] = React.useState<AdminUserRow | null>(null);
  const [viewingPasswordUser, setViewingPasswordUser] = React.useState<AdminUserRow | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Add User Form States
  const [addUsername, setAddUsername] = React.useState("");
  const [addFullname, setAddFullname] = React.useState("");
  const [addEmail, setAddEmail] = React.useState("");
  const [addPassword, setAddPassword] = React.useState("");
  const [addRoleId, setAddRoleId] = React.useState<number>(adminRoles[0].role_id);

  // Edit User Form States
  const [editFullname, setEditFullname] = React.useState("");
  const [editEmail, setEditEmail] = React.useState("");
  const [editPassword, setEditPassword] = React.useState("");
  const [editRoleId, setEditRoleId] = React.useState<number>(adminRoles[0].role_id);

  const generateRandomPassword = React.useCallback(() => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pass = "";
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  }, []);

  // TanStack table states
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "user_identity", desc: false }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const handleEditTrigger = React.useCallback((user: AdminUserRow) => {
    setEditingUser(user);
    setEditFullname(user.user_fullname);
    setEditEmail(user.user_email);
    setEditRoleId(user.user_role_id);
    setEditPassword(user.user_password || "");
  }, []);

  const handleDeleteTrigger = React.useCallback((user: AdminUserRow) => {
    setDeletingUser(user);
  }, []);

  const handleViewPasswordTrigger = React.useCallback((user: AdminUserRow) => {
    setViewingPasswordUser(user);
    setCopied(false);
  }, []);

  const columns = React.useMemo(
    () => getAdminUsersColumns(handleEditTrigger, handleDeleteTrigger, handleViewPasswordTrigger),
    [handleEditTrigger, handleDeleteTrigger, handleViewPasswordTrigger]
  );

  const table = useTable({
    features: dataTableFeatures,
    data: users,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    getRowId: (row) => String(row.user_id),
    autoResetPageIndex: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
  });

  const searchQuery = (table.getColumn("user_identity")?.getFilterValue() as string | undefined) ?? "";

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUsername.trim() || !addFullname.trim() || !addEmail.trim() || !addPassword.trim()) return;

    const matchedRole = adminRoles.find((r) => r.role_id === addRoleId);
    const nextId = users.length > 0 ? Math.max(...users.map((u) => u.user_id)) + 1 : 1;

    const newUser: AdminUserRow = {
      user_id: nextId,
      user_name: addUsername.trim(),
      user_fullname: addFullname.trim(),
      user_email: addEmail.trim(),
      user_password: addPassword.trim(),
      user_role_id: addRoleId,
      role_name: matchedRole ? matchedRole.role_name : "User",
      user_is_banned: 0,
      numb: nextId,
    };

    setUsers((prev) => [...prev, newUser]);
    setIsAddOpen(false);

    // Reset Form
    setAddUsername("");
    setAddFullname("");
    setAddEmail("");
    setAddPassword("");
    setAddRoleId(adminRoles[0].role_id);
  };

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editFullname.trim() || !editEmail.trim() || !editPassword.trim()) return;

    const matchedRole = adminRoles.find((r) => r.role_id === editRoleId);

    setUsers((prev) =>
      prev.map((user) =>
        user.user_id === editingUser.user_id
          ? {
            ...user,
            user_fullname: editFullname.trim(),
            user_email: editEmail.trim(),
            user_password: editPassword.trim(),
            user_role_id: editRoleId,
            role_name: matchedRole ? matchedRole.role_name : user.role_name,
          }
          : user
      )
    );
    setEditingUser(null);
  };

  const confirmDeleteUser = () => {
    if (!deletingUser) return;
    setUsers((prev) => prev.filter((user) => user.user_id !== deletingUser.user_id));
    setDeletingUser(null);
  };

  // Convert roles mapping to options formatted for Select items attribute
  const roleSelectItems = React.useMemo(
    () => adminRoles.map((r) => ({ value: String(r.role_id), label: r.role_name })),
    []
  );

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <Card>
        <CardHeader className="border-b has-data-[slot=card-action]:grid-cols-1 md:has-data-[slot=card-action]:grid-cols-[1fr_auto]">
          <CardTitle className="text-xl leading-none">Users</CardTitle>
          <CardDescription className="max-w-sm leading-snug">
            Manage your organization members and their access.
          </CardDescription>
          <CardAction className="col-start-1 row-start-auto flex w-full flex-wrap justify-start gap-2 justify-self-stretch md:col-start-2 md:row-span-2 md:row-start-1 md:w-auto md:flex-nowrap md:justify-end md:justify-self-end">
            <InputGroup className="h-7 w-full md:w-64">
              <InputGroupAddon align="inline-start">
                <Search className="size-3.5" />
              </InputGroupAddon>
              <InputGroupInput
                className="h-7"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(event) => {
                  table.getColumn("user_identity")?.setFilterValue(event.target.value || undefined);
                  table.setPageIndex(0);
                }}
              />
            </InputGroup>
            <Button size="sm" onClick={() => setIsAddOpen(true)}>
              <Plus /> Tambah User
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-0">
          <AdminUsersTable table={table} />
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah User</DialogTitle>
            <DialogDescription>Create a new user account for the midwife system.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddUserSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="add-username">Username</Label>
              <Input
                id="add-username"
                placeholder="e.g. janesmith"
                value={addUsername}
                onChange={(e) => setAddUsername(e.target.value)}
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="add-fullname">Full Name</Label>
              <Input
                id="add-fullname"
                placeholder="e.g. Jane Smith"
                value={addFullname}
                onChange={(e) => setAddFullname(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                placeholder="e.g. jane.smith@gmail.com"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="add-role">Role</Label>
              <Select
                items={roleSelectItems}
                value={String(addRoleId)}
                onValueChange={(val) => setAddRoleId(Number(val))}
              >
                <SelectTrigger id="add-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="bottom">
                  <SelectGroup>
                    {adminRoles.map((role) => (
                      <SelectItem key={role.role_id} value={String(role.role_id)}>
                        {role.role_name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="add-password">Password</Label>
              <div className="flex gap-2">
                <Input
                  id="add-password"
                  placeholder="Input or generate password"
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddPassword(generateRandomPassword())}
                >
                  Acak
                </Button>
              </div>
            </div>

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddOpen(false);
                  setAddUsername("");
                  setAddFullname("");
                  setAddEmail("");
                  setAddPassword("");
                  setAddRoleId(adminRoles[0].role_id);
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={!addUsername.trim() || !addFullname.trim() || !addEmail.trim() || !addPassword.trim()}
              >
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={editingUser !== null} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah User</DialogTitle>
            <DialogDescription>Modify user account details and role permissions.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditUserSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input id="edit-username" value={editingUser?.user_name || ""} disabled />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-fullname">Full Name</Label>
              <Input
                id="edit-fullname"
                placeholder="e.g. Jane Smith"
                value={editFullname}
                onChange={(e) => setEditFullname(e.target.value)}
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="e.g. jane.smith@gmail.com"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                items={roleSelectItems}
                value={String(editRoleId)}
                onValueChange={(val) => setEditRoleId(Number(val))}
              >
                <SelectTrigger id="edit-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="bottom">
                  <SelectGroup>
                    {adminRoles.map((role) => (
                      <SelectItem key={role.role_id} value={String(role.role_id)}>
                        {role.role_name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-password">Password</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-password"
                  placeholder="Input or generate password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditPassword(generateRandomPassword())}
                >
                  Acak
                </Button>
              </div>
            </div>

            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                Batal
              </Button>
              <Button type="submit" disabled={!editFullname.trim() || !editEmail.trim() || !editPassword.trim()}>
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={deletingUser !== null} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus User</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus user <strong>{deletingUser?.user_name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDeletingUser(null)}>
              Batal
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDeleteUser}>
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Password Modal */}
      <Dialog open={viewingPasswordUser !== null} onOpenChange={(open) => !open && setViewingPasswordUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Password</DialogTitle>
            <DialogDescription>
              Plain text password untuk user <strong>{viewingPasswordUser?.user_name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-4">
            <div className="flex items-center justify-between rounded-md border bg-muted/30 p-3">
              <span className="font-mono text-base select-all tracking-wider text-foreground">
                {viewingPasswordUser?.user_password || "(tidak ada password)"}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => {
                  if (viewingPasswordUser?.user_password) {
                    navigator.clipboard.writeText(viewingPasswordUser.user_password);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }
                }}
              >
                {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
              </Button>
            </div>
            {copied && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Sudah dicopy!
              </span>
            )}
          </div>

          <DialogFooter>
            <Button type="button" onClick={() => setViewingPasswordUser(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
