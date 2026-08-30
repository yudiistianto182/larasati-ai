import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { PeriodeRow } from "./data";

export const getPeriodeColumns = (
  onEdit: (periode: PeriodeRow) => void,
  onDelete: (periode: PeriodeRow) => void,
): ColumnDef<DataTableFeatures, PeriodeRow>[] => [
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
    accessorKey: "periode_id",
    header: "ID",
    cell: ({ row }) => (
      <span className="text-xs font-mono text-muted-foreground">
        PRD-{String(row.original.periode_id).padStart(3, "0")}
      </span>
    ),
  },
  {
    accessorKey: "periode_name",
    header: "Nama Periode",
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.periode_name}</span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => {
      const periode = row.original;
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  aria-label={`Buka aksi untuk ${periode.periode_name}`}
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
                <DropdownMenuItem onClick={() => onEdit(periode)}>
                  <Pencil className="size-4 mr-2" /> Ubah
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(periode)}
              >
                <Trash2 className="size-4 mr-2" /> Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    enableHiding: false,
    enableSorting: false,
  },
];
