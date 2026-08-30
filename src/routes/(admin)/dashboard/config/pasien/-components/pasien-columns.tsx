import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import type { Pasien } from "./data";

export const getPasienColumns = (
  onEdit: (pasien: Pasien) => void,
  onDelete: (pasien: Pasien) => void,
  onViewDetail: (pasien: Pasien) => void,
): ColumnDef<DataTableFeatures, Pasien>[] => [
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
    accessorKey: "nama",
    header: "Nama Pasien",
    cell: ({ row }) => {
      const pasien = row.original;
      return (
        <div className="flex flex-col gap-0.5">
          <span
            className="font-medium text-foreground hover:text-primary cursor-pointer transition-colors"
            onClick={() => onViewDetail(pasien)}
          >
            {pasien.nama}
          </span>
          <span className="text-[11px] text-muted-foreground">{pasien.id}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "umur",
    header: "Umur",
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.umur} th</span>
    ),
  },
  {
    accessorKey: "jenis_kelamin",
    header: "Jenis Kelamin",
    cell: ({ row }) => {
      const gender = row.original.jenis_kelamin;
      return (
        <Badge
          variant={gender === "Perempuan" ? "secondary" : "outline"}
          className="text-xs font-normal"
        >
          {gender}
        </Badge>
      );
    },
    filterFn: "equalsString",
  },
  {
    accessorKey: "latar_belakang",
    header: "Latar Belakang",
    cell: ({ row }) => {
      const latar = row.original.latar_belakang;
      return (
        <p className="max-w-xs truncate text-xs text-muted-foreground" title={latar}>
          {latar || "-"}
        </p>
      );
    },
  },
  {
    id: "atribut",
    header: "Atribut Dinamis",
    cell: ({ row }) => {
      const attributes = row.original.atribut;
      if (!attributes || attributes.length === 0) {
        return <span className="text-xs text-muted-foreground italic">-</span>;
      }

      const displayAttrs = attributes.slice(0, 2);
      const remainingCount = attributes.length - 2;

      return (
        <div className="flex flex-wrap items-center gap-1 max-w-sm">
          {displayAttrs.map((attr) => (
            <span
              key={attr.id}
              className="inline-flex items-center gap-1 rounded bg-muted/60 px-1.5 py-0.5 text-[11px] text-foreground border border-border/50"
            >
              <span className="text-muted-foreground">{attr.key}:</span>
              <span className="font-medium">{attr.value || "-"}</span>
            </span>
          ))}
          {remainingCount > 0 && (
            <Badge
              variant="outline"
              className="cursor-pointer text-[10px] px-1 py-0 hover:bg-accent"
              onClick={() => onViewDetail(row.original)}
              title="Klik untuk melihat seluruh atribut"
            >
              +{remainingCount} lainnya
            </Badge>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => {
      const pasien = row.original;
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  aria-label={`Buka aksi untuk ${pasien.nama}`}
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
                <DropdownMenuItem onClick={() => onViewDetail(pasien)}>
                  <Eye className="size-4 mr-2" /> Detail
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(pasien)}>
                  <Pencil className="size-4 mr-2" /> Ubah
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(pasien)}
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
