import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, MoreHorizontal, Pencil, Play, Trash2, Users, XCircle } from "lucide-react";

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
import type { Kasus } from "./data";

export const getKasusColumns = (
  onEdit: (kasus: Kasus) => void,
  onDelete: (kasus: Kasus) => void,
): ColumnDef<DataTableFeatures, Kasus>[] => [
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
      id: "no",
      header: "No",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-muted-foreground">
          {row.index + 1}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "nama",
      header: "Nama Kasus",
      cell: ({ row }) => {
        const kasus = row.original;
        return (
          <div className="flex flex-col gap-0.5 max-w-sm">
            <span className="font-medium text-foreground leading-snug">
              {kasus.nama}
            </span>
            <span className="text-[11px] text-muted-foreground truncate" title={kasus.deskripsi}>
              {kasus.deskripsi || "-"}
            </span>
          </div>
        );
      },
    },
    {
      id: "simulasi",
      header: "Simulasi Ujian",
      cell: ({ row }) => {
        const kasus = row.original;
        return (
          <Link
            target="blank"
            to="/lomba"
            search={{ kasusId: kasus.id }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary shadow-2xs hover:bg-primary hover:text-primary-foreground transition-all active:scale-95 whitespace-nowrap"
            title={`Mulai Simulasi Ujian Kasus: ${kasus.nama}`}
          >
            <Play className="size-3 fill-current" />
            <span>Simulasi Ujian</span>
          </Link>
        );
      },
      enableSorting: false,
    },
    {
      id: "pasien_count",
      header: "Pasien Terkait",
      cell: ({ row }) => {
        const count = row.original.pasien_ids?.length || 0;
        return (
          <Badge variant="outline" className="gap-1 text-xs font-normal">
            <Users className="size-3 text-muted-foreground" />
            <span>{count} Pasien</span>
          </Badge>
        );
      },
    },
    {
      accessorKey: "has_perekam_nilai",
      header: "Perekam Nilai",
      cell: ({ row }) => {
        const hasRecorder = row.original.has_perekam_nilai;
        return hasRecorder ? (
          <Badge
            variant="outline"
            className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium"
          >
            <CheckCircle2 className="size-3 text-emerald-500" />
            <span>Ya (Aktif)</span>
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="gap-1 border-border/80 bg-muted/30 text-muted-foreground text-xs font-normal"
          >
            <XCircle className="size-3 text-muted-foreground" />
            <span>Tidak</span>
          </Badge>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Tanggal Dibuat",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.created_at}</span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => {
        const kasus = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    aria-label={`Buka aksi untuk ${kasus.nama}`}
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
                  <DropdownMenuItem
                    render={
                      <Link
                        to="/lomba"
                        search={{ kasusId: kasus.id }}
                        className="flex items-center w-full"
                      />
                    }
                  >
                    <Play className="size-4 mr-2 text-primary" /> Simulasi Ujian
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(kasus)}>
                    <Pencil className="size-4 mr-2" /> Ubah
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(kasus)}
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
