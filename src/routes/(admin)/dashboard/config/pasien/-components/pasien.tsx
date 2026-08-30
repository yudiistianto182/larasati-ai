import * as React from "react";
import {
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";
import { Filter, HeartPulse, Plus, Search, Tag, UserCheck, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

import { fallbackPasien, type Pasien } from "./data";
import { getPasienColumns } from "./pasien-columns";
import { PasienDeleteDialog } from "./pasien-delete-dialog";
import { PasienDetailDialog } from "./pasien-detail-dialog";
import { PasienFormDialog } from "./pasien-form-dialog";
import { PasienTable } from "./pasien-table";

export function PasienComponent() {
  // Pasien list state
  const [pasienList, setPasienList] = React.useState<Pasien[]>(fallbackPasien);

  // Dialog states
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [editingPasien, setEditingPasien] = React.useState<Pasien | null>(null);
  const [deletingPasien, setDeletingPasien] = React.useState<Pasien | null>(null);
  const [viewingPasien, setViewingPasien] = React.useState<Pasien | null>(null);

  // Filter state
  const [genderFilter, setGenderFilter] = React.useState<string>("all");

  // TanStack table states
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "nama", desc: false }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const handleEditTrigger = React.useCallback((pasien: Pasien) => {
    setEditingPasien(pasien);
  }, []);

  const handleDeleteTrigger = React.useCallback((pasien: Pasien) => {
    setDeletingPasien(pasien);
  }, []);

  const handleViewDetailTrigger = React.useCallback((pasien: Pasien) => {
    setViewingPasien(pasien);
  }, []);

  const columns = React.useMemo(
    () => getPasienColumns(handleEditTrigger, handleDeleteTrigger, handleViewDetailTrigger),
    [handleEditTrigger, handleDeleteTrigger, handleViewDetailTrigger],
  );

  const table = useTable({
    features: dataTableFeatures,
    data: pasienList,
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

  // Handle Add Pasien
  const handleAddPasien = (formData: Omit<Pasien, "id" | "created_at">) => {
    const nextNum =
      pasienList.length > 0
        ? Math.max(
            ...pasienList.map((p) => {
              const num = parseInt(p.id.replace("PSN-", ""), 10);
              return isNaN(num) ? 0 : num;
            }),
          ) + 1
        : 1;

    const newId = `PSN-${String(nextNum).padStart(3, "0")}`;
    const today = new Date().toISOString().split("T")[0];

    const newPasien: Pasien = {
      ...formData,
      id: newId,
      created_at: today,
    };

    setPasienList((prev) => [newPasien, ...prev]);
  };

  // Handle Edit Pasien
  const handleEditPasien = (formData: Omit<Pasien, "id" | "created_at">) => {
    if (!editingPasien) return;

    setPasienList((prev) =>
      prev.map((p) =>
        p.id === editingPasien.id
          ? {
              ...p,
              ...formData,
            }
          : p,
      ),
    );

    // If detail modal is currently showing the edited patient, sync it
    if (viewingPasien && viewingPasien.id === editingPasien.id) {
      setViewingPasien({
        ...viewingPasien,
        ...formData,
      });
    }

    setEditingPasien(null);
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = () => {
    if (!deletingPasien) return;
    setPasienList((prev) => prev.filter((p) => p.id !== deletingPasien.id));
    if (viewingPasien && viewingPasien.id === deletingPasien.id) {
      setViewingPasien(null);
    }
    setDeletingPasien(null);
  };

  // Handle Gender Filter Change
  const handleGenderFilterChange = (val: string) => {
    setGenderFilter(val);
    if (val === "all") {
      table.getColumn("jenis_kelamin")?.setFilterValue(undefined);
    } else {
      table.getColumn("jenis_kelamin")?.setFilterValue(val);
    }
    table.setPageIndex(0);
  };

  // Stats calculation
  const totalPasien = pasienList.length;
  const femaleCount = pasienList.filter((p) => p.jenis_kelamin === "Perempuan").length;
  const maleCount = pasienList.filter((p) => p.jenis_kelamin === "Laki-laki").length;
  const totalAttributes = pasienList.reduce((acc, p) => acc + (p.atribut?.length || 0), 0);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex items-center gap-3 rounded-xl border bg-card p-3.5 shadow-xs">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="size-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Total Pasien</span>
            <span className="text-lg font-bold text-foreground">{totalPasien}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border bg-card p-3.5 shadow-xs">
          <div className="flex size-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
            <HeartPulse className="size-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Perempuan</span>
            <span className="text-lg font-bold text-foreground">{femaleCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border bg-card p-3.5 shadow-xs">
          <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <UserCheck className="size-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Laki-laki</span>
            <span className="text-lg font-bold text-foreground">{maleCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border bg-card p-3.5 shadow-xs">
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <Tag className="size-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Total Atribut</span>
            <span className="text-lg font-bold text-foreground">{totalAttributes}</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="border-b has-data-[slot=card-action]:grid-cols-1 md:has-data-[slot=card-action]:grid-cols-[1fr_auto]">
          <div>
            <CardTitle className="text-xl leading-none">Manajemen Pasien</CardTitle>
            <CardDescription className="max-w-md mt-1 leading-snug">
              Kelola data master pasien dengan dukungan atribut fleksibel dan dinamis (key-value).
            </CardDescription>
          </div>

          <CardAction className="col-start-1 row-start-auto flex w-full flex-wrap justify-start gap-2 justify-self-stretch md:col-start-2 md:row-span-2 md:row-start-1 md:w-auto md:flex-nowrap md:justify-end md:justify-self-end">
            <InputGroup className="h-7 w-full md:w-56">
              <InputGroupAddon align="inline-start">
                <Search className="size-3.5" />
              </InputGroupAddon>
              <InputGroupInput
                className="h-7 text-xs"
                placeholder="Cari nama pasien..."
                value={searchQuery}
                onChange={(event) => {
                  table.getColumn("nama")?.setFilterValue(event.target.value || undefined);
                  table.setPageIndex(0);
                }}
              />
            </InputGroup>

            <Select value={genderFilter} onValueChange={handleGenderFilterChange}>
              <SelectTrigger size="sm" className="h-7 w-36 text-xs">
                <Filter className="size-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Semua Gender" />
              </SelectTrigger>
              <SelectContent side="bottom">
                <SelectGroup>
                  <SelectItem value="all">Semua Gender</SelectItem>
                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                  <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button size="sm" className="h-7 text-xs" onClick={() => setIsAddOpen(true)}>
              <Plus className="size-3.5" /> Tambah Pasien
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 px-0 pt-0">
          <PasienTable table={table} />
        </CardContent>
      </Card>

      {/* Add Pasien Dialog */}
      <PasienFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSubmit={handleAddPasien}
      />

      {/* Edit Pasien Dialog */}
      <PasienFormDialog
        open={editingPasien !== null}
        onOpenChange={(open) => !open && setEditingPasien(null)}
        initialData={editingPasien}
        onSubmit={handleEditPasien}
      />

      {/* Delete Confirmation Dialog */}
      <PasienDeleteDialog
        pasien={deletingPasien}
        onOpenChange={(open) => !open && setDeletingPasien(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Patient Detail Modal */}
      <PasienDetailDialog
        pasien={viewingPasien}
        open={viewingPasien !== null}
        onOpenChange={(open) => !open && setViewingPasien(null)}
        onEdit={(pasien) => {
          setEditingPasien(pasien);
        }}
      />
    </div>
  );
}
