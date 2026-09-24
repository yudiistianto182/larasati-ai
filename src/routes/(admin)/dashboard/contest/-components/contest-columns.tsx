import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  MoreHorizontal,
  Pencil,
  Play,
  Trash2,
  Trophy,
  Tv,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { DataContestItem } from "@/types/api";

function formatPrettyDate(dateString?: string) {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return format(d, "dd MMM yyyy");
  } catch {
    return dateString;
  }
}

function deriveStatus(c: DataContestItem): "Akan Datang" | "Sedang Berlangsung" | "Selesai" {
  const now = new Date();
  const start = new Date(c.contest_datestart);
  const end = new Date(c.contest_dateend);
  if (now < start) return "Akan Datang";
  if (now > end) return "Selesai";
  return "Sedang Berlangsung";
}

export function getContestColumns(
  onEdit: (contest: DataContestItem) => void,
  onDelete: (contest: DataContestItem) => void,
): ColumnDef<DataTableFeatures, DataContestItem>[] {
  return [
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
      accessorKey: "contest_name",
      header: "Nama Lomba",
      cell: ({ row }) => {
        const contest = row.original;
        return (
          <div className="flex flex-col gap-0.5 max-w-sm">
            <span className="font-semibold text-foreground text-xs sm:text-sm leading-snug">
              {contest.contest_name}
            </span>
            {contest.contest_desc && (
              <span className="text-[11px] text-muted-foreground line-clamp-1 truncate" title={contest.contest_desc}>
                {contest.contest_desc}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "contest_periode_id",
      header: "Periode",
      cell: ({ row }) => {
        const contest = row.original;
        const label = contest.contest_periode_id ? `Periode ${contest.contest_periode_id}` : "-";
        return (
          <Badge variant="outline" className="font-medium text-xs">
            {label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "contest_datestart",
      header: "Jadwal Pelaksanaan",
      cell: ({ row }) => {
        const contest = row.original;
        const startPretty = contest.contest_datestart_text ?? formatPrettyDate(contest.contest_datestart);
        const endPretty = contest.contest_dateend_text ?? formatPrettyDate(contest.contest_dateend);

        return (
          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
            <Calendar className="size-3.5 text-primary shrink-0" />
            <span>
              {startPretty} s/d {endPretty}
            </span>
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = deriveStatus(row.original);
        if (status === "Sedang Berlangsung") {
          return (
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[11px] font-semibold gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sedang Berlangsung</span>
            </Badge>
          );
        }
        if (status === "Akan Datang") {
          return (
            <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/5 text-[11px] font-semibold gap-1">
              <Clock className="size-3" />
              <span>Akan Datang</span>
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="text-muted-foreground text-[11px] font-normal gap-1">
            <CheckCircle2 className="size-3" />
            <span>Selesai</span>
          </Badge>
        );
      },
      enableSorting: false,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => {
        const contest = row.original;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="size-7 rounded-md text-muted-foreground hover:text-foreground"
                  />
                }
              >
                <MoreHorizontal className="size-3.5" />
                <span className="sr-only">Buka menu</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 text-xs">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-emerald-600 dark:text-emerald-400 font-semibold"
                    render={
                      <Link
                        to="/dashboard/contest/rekap"
                        search={{ contestId: String(contest.contest_id) }}
                        className="flex items-center w-full"
                      />
                    }
                  >
                    <ClipboardCheck className="size-3.5 mr-2" />
                    <span>Rekap Penilaian</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-amber-600 dark:text-amber-400 font-semibold"
                    render={
                      <Link
                        to="/liveview"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center w-full"
                      />
                    }
                  >
                    <Tv className="size-3.5 mr-2" />
                    <span>Liveview Sirkuit</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="gap-2 cursor-pointer font-medium"
                    render={
                      <Link
                        to="/liveview"
                        search={{ mode: "podium", contestId: String(contest.contest_id), simulate: true }}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center w-full"
                      />
                    }
                  >
                    <Trophy className="size-3.5 mr-2 text-primary" />
                    <span>Simulasi Podium</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-primary focus:text-primary font-medium"
                    render={
                      <Link
                        to="/lomba"
                        search={{ lombaId: String(contest.contest_id) }}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center w-full"
                      />
                    }
                  >
                    <Play className="size-3.5 mr-2" />
                    <span>Simulasi Ujian</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => onEdit(contest)}
                    className="gap-2 cursor-pointer"
                  >
                    <Pencil className="size-3.5 mr-2 text-muted-foreground" />
                    <span>Ubah Lomba</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(contest)}
                    className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                  >
                    <Trash2 className="size-3.5 mr-2" />
                    <span>Hapus</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      enableSorting: false,
    },
  ];
}
