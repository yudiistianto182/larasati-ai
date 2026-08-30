import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { AdminUserRow } from "./data";

export const getAdminUsersColumns = (
  onEdit: (user: AdminUserRow) => void,
  onDelete: (user: AdminUserRow) => void,
  onViewPassword: (user: AdminUserRow) => void
): ColumnDef<DataTableFeatures, AdminUserRow>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "user_identity",
    header: "User",
    accessorFn: (row) => `${row.user_name} ${row.user_fullname}`,
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-bold text-sm text-foreground leading-tight">{row.original.user_name}</span>
        <span className="text-xs text-muted-foreground leading-normal">{row.original.user_fullname}</span>
      </div>
    ),
  },
  {
    accessorKey: "user_email",
    header: "Email",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.user_email}</span>,
  },
  {
    accessorKey: "user_password",
    header: "Password",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-muted-foreground text-xs">****</span>
        <Button
          size="icon-xs"
          variant="ghost"
          className="size-6 text-muted-foreground hover:text-foreground"
          onClick={() => onViewPassword(row.original)}
          aria-label="View password"
        >
          <Eye className="size-3.5" />
        </Button>
      </div>
    ),
  },
  {
    accessorKey: "role_name",
    header: "Role",
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.role_name}</span>,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                aria-label={`Open actions for ${row.original.user_name}`}
                className="size-8 rounded-md text-muted-foreground hover:bg-muted/50"
                size="icon-sm"
                variant="ghost"
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                Ubah
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(row.original)}
              >
                Hapus
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    enableHiding: false,
    enableSorting: false,
  },
];
