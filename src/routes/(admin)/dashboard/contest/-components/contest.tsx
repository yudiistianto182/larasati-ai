import * as React from "react";
import {
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dataTableFeatures } from "@/lib/data-table-features";
import { type Contest, useContestStore } from "@/stores/contest-store";
import { useKasusStore } from "@/stores/kasus-store";
import { getContestColumns } from "./contest-columns";
import { ContestTable } from "./contest-table";

export function Contest() {
  const navigate = useNavigate();
  const { contests, deleteContest } = useContestStore();
  const { kasusList } = useKasusStore();

  const [deletingContest, setDeletingContest] = React.useState<Contest | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedPeriode, setSelectedPeriode] = React.useState<string>("all");

  // TanStack table states
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "status", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const handleEdit = React.useCallback(
    (contest: Contest) => {
      navigate({
        to: "/dashboard/contest/tambah",
        search: { contestId: contest.id },
      });
    },
    [navigate],
  );

  const handleDeleteTrigger = React.useCallback((contest: Contest) => {
    setDeletingContest(contest);
  }, []);

  const handleConfirmDelete = () => {
    if (deletingContest) {
      deleteContest(deletingContest.id);
      setDeletingContest(null);
    }
  };

  const columns = React.useMemo(
    () => getContestColumns(handleEdit, handleDeleteTrigger),
    [handleEdit, handleDeleteTrigger],
  );

  // Filtered data by search & periode
  const filteredData = React.useMemo(() => {
    return contests.filter((c) => {
      const matchSearch =
        c.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPeriode =
        selectedPeriode === "all" || String(c.periode_id) === selectedPeriode;
      return matchSearch && matchPeriode;
    });
  }, [contests, searchQuery, selectedPeriode]);

  const table = useTable({
    features: dataTableFeatures,
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
  });

  // Calculate Metrics
  const totalLomba = contests.length;
  const activeLomba = contests.filter((c) => c.status === "Sedang Berlangsung").length;
  const totalPeserta = contests.reduce(
    (acc, c) =>
      acc + (c.kelompok_list?.reduce((kAcc, k) => kAcc + (k.mahasiswa_ids?.length || 0), 0) || 0),
    0,
  );
  const totalKasusUsed = contests.reduce((acc, c) => acc + (c.kasus_ids?.length || 0), 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Manajemen Lomba
        </h1>
        <p className="text-xs text-muted-foreground">
          Kelola agenda sirkuit kompetisi klinis kebidanan, jadwal periode, pembagian kelompok mahasiswa, dan penautan skenario kasus.
        </p>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        {/* Card 1: Total Lomba */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <Trophy className="size-4" />
              </div>
            </CardTitle>
            <CardDescription>Total Agenda Lomba</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{totalLomba}</div>
              <Badge>
                Kompetisi
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">Agenda sirkuit terdaftar</p>
          </CardContent>
        </Card>

        {/* Card 2: Lomba Aktif */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <Clock className="size-4" />
              </div>
            </CardTitle>
            <CardDescription>Sedang Berlangsung</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{activeLomba}</div>
              <Badge variant="secondary">
                Sesi Aktif
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">Lomba berjalan saat ini</p>
          </CardContent>
        </Card>

        {/* Card 3: Total Mahasiswa */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <Users className="size-4" />
              </div>
            </CardTitle>
            <CardDescription>Total Mahasiswa Terdaftar</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{totalPeserta}</div>
              <Badge variant="outline">
                Peserta
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">Mahasiswa peserta sirkuit</p>
          </CardContent>
        </Card>

        {/* Card 4: Total Kasus Digunakan */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <CheckCircle2 className="size-4" />
              </div>
            </CardTitle>
            <CardDescription>Kasus Ditautkan</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{totalKasusUsed}</div>
              <Badge>
                Skenario
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">Keterkaitan skenario kasus</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-border/80 shadow-2xs">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3.5 border-b">
          <div>
            <CardTitle className="text-sm font-bold">Daftar Lomba</CardTitle>
            <CardDescription className="text-xs">
              Seluruh agenda kompetisi klinis dan distribusi kelompok peserta.
            </CardDescription>
          </div>

          <CardAction className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <InputGroup className="w-48 sm:w-56">
              <InputGroupAddon>
                <Search className="size-3.5 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                className="h-7 text-xs"
                placeholder="Cari nama lomba..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>

            {/* Periode Filter */}
            <Select value={selectedPeriode} onValueChange={(val) => val && setSelectedPeriode(val)}>
              <SelectTrigger className="h-7 w-32 text-xs">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectGroup>
                  <SelectItem value="all">Semua Periode</SelectItem>
                  <SelectItem value="1">Periode 2024</SelectItem>
                  <SelectItem value="2">Periode 2025</SelectItem>
                  <SelectItem value="3">Periode 2026</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Tambah Lomba Button */}
            <Button
              nativeButton={false}
              size="sm"
              className="h-7 text-xs gap-1.5"
              render={<Link to="/dashboard/contest/tambah" />}
            >
              <Plus className="size-3.5" />
              <span>Tambah Lomba</span>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 p-4">
          <ContestTable table={table} />
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deletingContest !== null}
        onOpenChange={(open) => !open && setDeletingContest(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-4.5" />
              <span>Hapus Kontes Lomba</span>
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Apakah Anda yakin ingin menghapus agenda lomba{" "}
              <strong>&ldquo;{deletingContest?.nama}&rdquo;</strong>? Seluruh data pembagian kelompok dan penautan kasus dalam lomba ini akan dihapus.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeletingContest(null)}
              className="h-8 text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              className="h-8 text-xs"
            >
              Hapus Lomba
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
