import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";
import { CheckCircle2, FileText, Plus, Search, Users } from "lucide-react";

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
import { dataTableFeatures } from "@/lib/data-table-features";
import { useKasusStore } from "@/stores/kasus-store";

import type { Kasus } from "./data";
import { getKasusColumns } from "./kasus-columns";
import { KasusTable } from "./kasus-table";

export function KasusComponent() {
  const navigate = useNavigate();
  const { kasusList, deleteKasus } = useKasusStore();

  const [deletingKasus, setDeletingKasus] = React.useState<Kasus | null>(null);

  // TanStack table states
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "nama", desc: false }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const handleEditTrigger = React.useCallback((kasus: Kasus) => {
    // Navigate directly to the 4-step wizard form pre-populated with this case data
    navigate({
      to: "/dashboard/master/kasus/tambah",
      search: { kasusId: kasus.id },
    });
  }, [navigate]);

  const handleDeleteTrigger = React.useCallback((kasus: Kasus) => {
    setDeletingKasus(kasus);
  }, []);

  const columns = React.useMemo(
    () => getKasusColumns(handleEditTrigger, handleDeleteTrigger),
    [handleEditTrigger, handleDeleteTrigger],
  );

  const table = useTable({
    features: dataTableFeatures,
    data: kasusList,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    autoResetPageIndex: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
  });

  const searchQuery = (table.getColumn("nama")?.getFilterValue() as string | undefined) ?? "";

  const confirmDelete = () => {
    if (!deletingKasus) return;
    deleteKasus(deletingKasus.id);
    setDeletingKasus(null);
  };

  // Metrics
  const totalKasus = kasusList.length;
  const withRecorderCount = kasusList.filter((k) => k.has_perekam_nilai).length;
  const totalPatientLinks = kasusList.reduce((acc, k) => acc + (k.pasien_ids?.length || 0), 0);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-3 dark:*:data-[slot=card]:bg-card">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <FileText className="size-4" />
              </div>
            </CardTitle>
            <CardDescription>Total Skenario Kasus</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{totalKasus}</div>
              <Badge>
                Aktif
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">Skenario sirkuit OSCE terdaftar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <CheckCircle2 className="size-4" />
              </div>
            </CardTitle>
            <CardDescription>Dengan Perekam Nilai</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{withRecorderCount}</div>
              <Badge variant="outline">
                Pos 6 Audio
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">Fitur perekaman suara aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <Users className="size-4" />
              </div>
            </CardTitle>
            <CardDescription>Total Pasien Terkait</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{totalPatientLinks}</div>
              <Badge variant="secondary">
                Subjek
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">Keterlibatan pasien virtual</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="border-b has-data-[slot=card-action]:grid-cols-1 md:has-data-[slot=card-action]:grid-cols-[1fr_auto]">
          <div>
            <CardTitle className="text-xl leading-none">Master Kasus</CardTitle>
            <CardDescription className="max-w-md mt-1 leading-snug">
              Daftar master skenario kasus klinis kebidanan, keterlibatan pasien, dan status penilaian.
            </CardDescription>
          </div>

          <CardAction className="col-start-1 row-start-auto flex w-full flex-wrap justify-start gap-2 justify-self-stretch md:col-start-2 md:row-span-2 md:row-start-1 md:w-auto md:flex-nowrap md:justify-end md:justify-self-end">
            <InputGroup className="h-7 w-full md:w-64">
              <InputGroupAddon align="inline-start">
                <Search className="size-3.5" />
              </InputGroupAddon>
              <InputGroupInput
                className="h-7 text-xs"
                placeholder="Cari nama kasus..."
                value={searchQuery}
                onChange={(event) => {
                  table.getColumn("nama")?.setFilterValue(event.target.value || undefined);
                  table.setPageIndex(0);
                }}
              />
            </InputGroup>

            <Button nativeButton={false} size="sm" className="h-7 text-xs" render={<Link to="/dashboard/master/kasus/tambah" />}>
              <Plus className="size-3.5" /> Tambah Kasus
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 px-0 pt-0">
          <KasusTable table={table} />
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={deletingKasus !== null} onOpenChange={(open) => !open && setDeletingKasus(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Kasus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kasus <strong>{deletingKasus?.nama}</strong> (ID: {deletingKasus?.id})?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingKasus(null)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
            >
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
