import * as React from "react";
import {
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";
import { Link, useNavigate } from "@tanstack/react-router";
import {
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
import { contestService, periodeService } from "@/services/api";
import type { DataContestItem } from "@/types/api";
import { getContestColumns } from "./contest-columns";
import { ContestTable } from "./contest-table";

export function Contest() {
  const navigate = useNavigate();

  // API data state
  const [apiContests, setApiContests] = React.useState<DataContestItem[]>([]);
  const [deletingContest, setDeletingContest] = React.useState<DataContestItem | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedPeriode, setSelectedPeriode] = React.useState<string>("all");
  const [periodes, setPeriodes] = React.useState<{ periode_id: number; periode_name: string }[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const hasFetchedRef = React.useRef(false);

  React.useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [contestRes, periodeRes] = await Promise.all([
          contestService.getAll(),
          periodeService.getAll(),
        ]);

        if (Array.isArray(contestRes.data)) {
          setApiContests(contestRes.data);
        }

        const periodeList = Array.isArray(periodeRes.data)
          ? periodeRes.data
          : (periodeRes.data && typeof periodeRes.data === "object" && "data" in periodeRes.data && Array.isArray((periodeRes.data as any).data))
            ? (periodeRes.data as any).data
            : [];

        if (periodeList.length > 0) {
          setPeriodes(
            periodeList.map((p: any) => ({
              periode_id: p.periode_id,
              periode_name: p.periode_name,
            }))
          );
        }
      } catch (err) {
        console.warn("[Contest] Gagal memuat data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

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
    (contest: DataContestItem) => {
      navigate({
        to: "/dashboard/contest/tambah",
        search: { contestId: String(contest.contest_id) },
      });
    },
    [navigate],
  );

  const handleDeleteTrigger = React.useCallback((contest: DataContestItem) => {
    setDeletingContest(contest);
  }, []);

  const handleConfirmDelete = async () => {
    if (deletingContest) {
      try {
        await contestService.delete(deletingContest.contest_id);
      } catch (err) {
        console.warn("[Contest] Gagal hapus:", err);
      }
      setApiContests((prev) => prev.filter((c) => c.contest_id !== deletingContest.contest_id));
      setDeletingContest(null);
    }
  };

  const columns = React.useMemo(
    () => getContestColumns(handleEdit, handleDeleteTrigger),
    [handleEdit, handleDeleteTrigger],
  );

  // Filtered data by search & periode
  const filteredData = React.useMemo(() => {
    return apiContests.filter((c) => {
      const matchSearch =
        c.contest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contest_desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPeriode =
        selectedPeriode === "all" || String(c.contest_periode_id) === selectedPeriode;
      return matchSearch && matchPeriode;
    });
  }, [apiContests, searchQuery, selectedPeriode]);

  // Derive status from dates
  const deriveStatus = (c: DataContestItem): "Akan Datang" | "Sedang Berlangsung" | "Selesai" => {
    const now = new Date();
    const start = new Date(c.contest_datestart);
    const end = new Date(c.contest_dateend);
    if (now < start) return "Akan Datang";
    if (now > end) return "Selesai";
    return "Sedang Berlangsung";
  };

  const table = useTable({
    features: dataTableFeatures,
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    getRowId: (row) => String(row.contest_id),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
  });

  // Calculate Metrics
  const totalLomba = apiContests.length;
  const activeLomba = apiContests.filter((c) => deriveStatus(c) === "Sedang Berlangsung").length;
  const totalPeserta = 0; // Tidak tersedia di list API
  const totalKasusUsed = 0; // Tidak tersedia di list API

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
              <SelectTrigger className="h-7 w-36 text-xs">
                <SelectValue placeholder="Pilih Periode">
                  {(val) => {
                    if (!val || val === "all") return "Semua Periode";
                    const found = periodes.find((p) => String(p.periode_id) === String(val));
                    return found ? found.periode_name : `Periode ${val}`;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectGroup>
                  <SelectItem value="all">Semua Periode</SelectItem>
                  {periodes.map((p) => (
                    <SelectItem key={p.periode_id} value={String(p.periode_id)}>
                      {p.periode_name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Tambah Lomba Button */}
            <Button
              nativeButton={false}
              size="sm"
              className="h-7 text-xs gap-1.5"
              render={<Link to="/dashboard/contest/tambah" search={{ contestId: undefined }} />}
            >
              <Plus className="size-3.5" />
              <span>Tambah Lomba</span>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 p-4">
          <ContestTable table={table} isLoading={isLoading} />
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
              <strong>&ldquo;{deletingContest?.contest_name}&rdquo;</strong>? Seluruh data pembagian kelompok dan penautan kasus dalam lomba ini akan dihapus.
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
