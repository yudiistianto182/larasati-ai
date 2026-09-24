import * as React from "react";
import {
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";
import { Filter, HeartPulse, Plus, Search, Tag, UserCheck, Users } from "lucide-react";

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

import { type Pasien } from "./data";
import { getPasienColumns } from "./pasien-columns";
import { PasienDeleteDialog } from "./pasien-delete-dialog";
import { PasienDetailDialog } from "./pasien-detail-dialog";
import { PasienFormDialog } from "./pasien-form-dialog";
import { PasienTable } from "./pasien-table";
import { patientService } from "@/services/api";

export function PasienComponent() {
  // Pasien list state (purely from API, no fallback data)
  const [pasienList, setPasienList] = React.useState<Pasien[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const hasFetchedRef = React.useRef(false);

  const fetchPatients = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await patientService.getAll();
      const rawList = Array.isArray(res.data)
        ? res.data
        : (res.data && typeof res.data === "object" && "data" in res.data && Array.isArray((res.data as any).data))
        ? (res.data as any).data
        : [];

      setPasienList(
        rawList.map((p: any) => ({
          id: `PSN-${p.patient_id}`,
          nama: p.patient_name || "Pasien",
          tanggal_lahir: p.patient_birthdate ? p.patient_birthdate.split("T")[0] : "1990-01-01",
          umur: undefined,
          jenis_kelamin: p.patient_gender === "Laki-laki" ? "Laki-laki" : "Perempuan",
          latar_belakang: p.patient_desc || "-",
          atribut: Array.isArray(p.patient_attribute)
            ? p.patient_attribute.map((a: any, idx: number) => ({
                id: `attr-${p.patient_id}-${idx}`,
                key: a.key || a.attribute_name || "Atribut",
                value: a.value || a.attribute_value || "-",
              }))
            : [],
          created_at: p.created_at ? p.created_at.split("T")[0] : "2026-08-10",
        }))
      );
    } catch (e) {
      console.error("[Pasien] Gagal memuat data pasien:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    fetchPatients();
  }, [fetchPatients]);

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

  // Handle URL query parameters if present (e.g. ?action=create)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("action") === "create") {
        setIsAddOpen(true);
      }
    }
  }, []);

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
  const handleAddPasien = async (formData: Omit<Pasien, "id" | "created_at">) => {
    try {
      await patientService.create({
        patient_name: formData.nama,
        patient_birthdate: formData.tanggal_lahir,
        patient_gender: formData.jenis_kelamin,
        attribute: formData.atribut.map((a) => ({
          patientattribute_name: a.key,
          patientattribute_value: a.value,
        })),
      });
      await fetchPatients();
    } catch (err) {
      console.error("[Pasien] Gagal menambahkan pasien:", err);
    }
  };

  // Handle Edit Pasien
  const handleEditPasien = async (formData: Omit<Pasien, "id" | "created_at">) => {
    if (!editingPasien) return;
    const patientId = editingPasien.id.replace("PSN-", "");

    try {
      await patientService.update(patientId, {
        patient_name: formData.nama,
        patient_birthdate: formData.tanggal_lahir,
        patient_gender: formData.jenis_kelamin,
        attribute: formData.atribut.map((a) => ({
          patientattribute_name: a.key,
          patientattribute_value: a.value,
        })),
      });
      await fetchPatients();
    } catch (err) {
      console.error("[Pasien] Gagal mengupdate pasien:", err);
    }

    if (viewingPasien && viewingPasien.id === editingPasien.id) {
      setViewingPasien({
        ...viewingPasien,
        ...formData,
      });
    }

    setEditingPasien(null);
  };

  // Handle Delete Pasien
  const handleConfirmDelete = async () => {
    if (!deletingPasien) return;
    const patientId = deletingPasien.id.replace("PSN-", "");

    try {
      await patientService.delete(patientId);
      await fetchPatients();
    } catch (err) {
      console.error("[Pasien] Gagal menghapus pasien:", err);
    }

    if (viewingPasien && viewingPasien.id === deletingPasien.id) {
      setViewingPasien(null);
    }
    setDeletingPasien(null);
  };

  // Filter Gender Handler
  const handleGenderFilterChange = (val: string) => {
    setGenderFilter(val);
    if (val === "all") {
      table.getColumn("jenis_kelamin")?.setFilterValue(undefined);
    } else {
      table.getColumn("jenis_kelamin")?.setFilterValue(val);
    }
  };

  // Summary Metrics
  const totalPasien = pasienList.length;
  const totalPerempuan = pasienList.filter((p) => p.jenis_kelamin === "Perempuan").length;
  const totalLakiLaki = pasienList.filter((p) => p.jenis_kelamin === "Laki-laki").length;
  const totalAtribut = pasienList.reduce((acc, p) => acc + (p.atribut?.length || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <Users className="size-4" />
              </div>
            </CardTitle>
            <CardDescription>Total Subjek Pasien</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{totalPasien}</div>
              <Badge>
                Terdaftar
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">Katalog subjek virtual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <UserCheck className="size-4" />
              </div>
            </CardTitle>
            <CardDescription>Pasien Perempuan</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{totalPerempuan}</div>
              <Badge variant="secondary">
                KIA / Kebidanan
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">Subjek pemeriksaan klinis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <HeartPulse className="size-4" />
              </div>
            </CardTitle>
            <CardDescription>Pasien Laki-laki</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{totalLakiLaki}</div>
              <Badge variant="outline">
                Pasien Umum
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">Subjek non-kebidanan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <Tag className="size-4" />
              </div>
            </CardTitle>
            <CardDescription>Total Atribut Dinamis</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{totalAtribut}</div>
              <Badge>
                Atribut
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">Parameter khusus terpasang</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="flex flex-1 flex-col">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Master Data Subjek Pasien</CardTitle>
            <CardDescription>
              Katalog profil pasien dan konfigurasi atribut dinamis fleksibel untuk kasus kebidanan.
            </CardDescription>
          </div>

          <CardAction>
            <Button
              onClick={() => setIsAddOpen(true)}
              className="gap-1.5 shadow-2xs font-semibold"
            >
              <Plus className="size-4" />
              <span>Tambah Pasien</span>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-4">
          {/* Search & Gender Filter Controls */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <InputGroup className="h-9 w-full sm:w-80">
              <InputGroupAddon align="inline-start">
                <Search className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Cari nama atau ID pasien..."
                value={searchQuery}
                onChange={(e) => table.getColumn("nama")?.setFilterValue(e.target.value)}
                className="text-xs"
              />
            </InputGroup>

            <div className="flex items-center gap-2.5">
              <Select
                value={genderFilter}
                onValueChange={(val) => {
                  if (val) handleGenderFilterChange(val);
                }}
              >
                <SelectTrigger className="h-9 w-40 text-xs">
                  <Filter className="size-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Semua Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Semua Gender</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* TanStack Table */}
          <PasienTable table={table} isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* Add / Edit Dialog Form */}
      <PasienFormDialog
        open={isAddOpen || Boolean(editingPasien)}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingPasien(null);
          }
        }}
        initialData={editingPasien}
        onSubmit={(data) => {
          if (editingPasien) {
            handleEditPasien(data);
          } else {
            handleAddPasien(data);
          }
        }}
      />

      {/* View Detail Modal Dialog */}
      <PasienDetailDialog
        open={Boolean(viewingPasien)}
        onOpenChange={(open) => {
          if (!open) setViewingPasien(null);
        }}
        pasien={viewingPasien}
        onEdit={(p) => {
          setViewingPasien(null);
          setEditingPasien(p);
        }}
      />

      {/* Delete Confirmation Modal Dialog */}
      <PasienDeleteDialog
        open={Boolean(deletingPasien)}
        onOpenChange={(open) => {
          if (!open) setDeletingPasien(null);
        }}
        pasien={deletingPasien}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
