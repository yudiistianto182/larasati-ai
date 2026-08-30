import * as React from "react";
import {
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";
import { Calendar, CheckCircle2, Clock, Plus, Search } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { dataTableFeatures } from "@/lib/data-table-features";

import { fallbackPeriodes, type PeriodeRow } from "./data";
import { getPeriodeColumns } from "./periode-columns";
import { PeriodeTable } from "./periode-table";

export function Periode() {
  // Periodes list state (seeded with dummy fallback data)
  const [periodes, setPeriodes] = React.useState<PeriodeRow[]>(fallbackPeriodes);

  // Dialog and form states
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newPeriodeName, setNewPeriodeName] = React.useState("");

  // Edit states
  const [editingPeriode, setEditingPeriode] = React.useState<PeriodeRow | null>(null);
  const [editPeriodeName, setEditPeriodeName] = React.useState("");

  // Delete confirmation states
  const [deletingPeriode, setDeletingPeriode] = React.useState<PeriodeRow | null>(null);

  // TanStack table states
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "periode_name", desc: false }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const handleEditTrigger = React.useCallback((periode: PeriodeRow) => {
    setEditingPeriode(periode);
    setEditPeriodeName(periode.periode_name);
  }, []);

  const handleDeleteTrigger = React.useCallback((periode: PeriodeRow) => {
    setDeletingPeriode(periode);
  }, []);

  const columns = React.useMemo(
    () => getPeriodeColumns(handleEditTrigger, handleDeleteTrigger),
    [handleEditTrigger, handleDeleteTrigger],
  );

  const table = useTable({
    features: dataTableFeatures,
    data: periodes,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    getRowId: (row) => String(row.periode_id),
    autoResetPageIndex: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
  });

  const searchQuery = (table.getColumn("periode_name")?.getFilterValue() as string | undefined) ?? "";

  const handleAddPeriode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriodeName.trim()) return;

    const nextId = periodes.length > 0 ? Math.max(...periodes.map((r) => r.periode_id)) + 1 : 1;
    const newPeriode: PeriodeRow = {
      periode_id: nextId,
      periode_name: newPeriodeName.trim(),
    };

    setPeriodes((prev) => [newPeriode, ...prev]);
    setNewPeriodeName("");
    setIsDialogOpen(false);
  };

  const handleEditPeriodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPeriode || !editPeriodeName.trim()) return;

    setPeriodes((prev) =>
      prev.map((p) =>
        p.periode_id === editingPeriode.periode_id
          ? { ...p, periode_name: editPeriodeName.trim() }
          : p,
      ),
    );
    setEditingPeriode(null);
    setEditPeriodeName("");
  };

  const confirmDeletePeriode = () => {
    if (!deletingPeriode) return;
    setPeriodes((prev) => prev.filter((p) => p.periode_id !== deletingPeriode.periode_id));
    setDeletingPeriode(null);
  };

  // Stats calculation
  const totalPeriode = periodes.length;

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-3 dark:*:data-[slot=card]:bg-card">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <Calendar className="size-4" />
              </div>
            </CardTitle>
            <CardDescription>Total Periode</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{totalPeriode}</div>
              <Badge>
                Terdaftar
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">Kalender pelaksanaan terkonfigurasi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <Clock className="size-4" />
              </div>
            </CardTitle>
            <CardDescription>Periode Aktif</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">
                {totalPeriode > 0 ? "1" : "0"}
              </div>
              <Badge variant="secondary">
                Berjalan
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">Sedang dalam masa operasional</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <CheckCircle2 className="size-4" />
              </div>
            </CardTitle>
            <CardDescription>Status Jadwal</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">100%</div>
              <Badge variant="outline">
                Tersinkron
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">Jadwal lomba terhubung dengan baik</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="border-b has-data-[slot=card-action]:grid-cols-1 md:has-data-[slot=card-action]:grid-cols-[1fr_auto]">
          <div>
            <CardTitle className="text-xl leading-none">Master Periode</CardTitle>
            <CardDescription className="max-w-md mt-1 leading-snug">
              Kelola dan atur periode pelaksanaan sistem serta batasan waktu operasional.
            </CardDescription>
          </div>

          <CardAction className="col-start-1 row-start-auto flex w-full flex-wrap justify-start gap-2 justify-self-stretch md:col-start-2 md:row-span-2 md:row-start-1 md:w-auto md:flex-nowrap md:justify-end md:justify-self-end">
            <InputGroup className="h-7 w-full md:w-64">
              <InputGroupAddon align="inline-start">
                <Search className="size-3.5" />
              </InputGroupAddon>
              <InputGroupInput
                className="h-7 text-xs"
                placeholder="Cari nama periode..."
                value={searchQuery}
                onChange={(event) => {
                  table.getColumn("periode_name")?.setFilterValue(event.target.value || undefined);
                  table.setPageIndex(0);
                }}
              />
            </InputGroup>

            <Button size="sm" className="h-7 text-xs" onClick={() => setIsDialogOpen(true)}>
              <Plus className="size-3.5" /> Tambah Periode
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 px-0 pt-0">
          <PeriodeTable table={table} />
        </CardContent>
      </Card>

      {/* Add Periode Dialog Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Periode Baru</DialogTitle>
            <DialogDescription>
              Masukkan nama periode baru yang ingin ditambahkan ke dalam sistem.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddPeriode} className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="periode-name">
                Nama Periode <span className="text-destructive">*</span>
              </Label>
              <Input
                id="periode-name"
                placeholder="Contoh: Periode 2027"
                value={newPeriodeName}
                onChange={(e) => setNewPeriodeName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <DialogFooter className="mt-2 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setNewPeriodeName("");
                }}
              >
                Batal
              </Button>
              <Button type="submit" disabled={!newPeriodeName.trim()}>
                Tambah Periode
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Periode Dialog Modal */}
      <Dialog open={editingPeriode !== null} onOpenChange={(open) => !open && setEditingPeriode(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah Nama Periode</DialogTitle>
            <DialogDescription>
              Perbarui nama periode yang dipilih.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditPeriodeSubmit} className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-periode-name">
                Nama Periode <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-periode-name"
                value={editPeriodeName}
                onChange={(e) => setEditPeriodeName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <DialogFooter className="mt-2 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingPeriode(null);
                  setEditPeriodeName("");
                }}
              >
                Batal
              </Button>
              <Button type="submit" disabled={!editPeriodeName.trim()}>
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Periode Confirmation Dialog Modal */}
      <Dialog open={deletingPeriode !== null} onOpenChange={(open) => !open && setDeletingPeriode(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Periode</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus periode <strong>{deletingPeriode?.periode_name}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingPeriode(null)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeletePeriode}
            >
              Ya, Hapus Periode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
