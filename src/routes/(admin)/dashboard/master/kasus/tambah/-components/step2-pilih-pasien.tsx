import * as React from "react";
import { Plus, Trash2, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { calculateAge, type Pasien } from "@/routes/(admin)/dashboard/master/pasien/-components/data";
import { patientService } from "@/services/api";
import { PasienPickerModal } from "./pasien-picker-modal";

interface Step2PilihPasienProps {
  selectedPasienIds: string[];
  onSelectedPasienIdsChange: (ids: string[]) => void;
}

// In-memory cache & in-flight promise deduplication to avoid double fetching
let cachedPatients: Pasien[] | null = null;
let patientFetchPromise: Promise<Pasien[]> | null = null;

async function fetchAllPatientsOnce(): Promise<Pasien[]> {
  if (cachedPatients) return cachedPatients;
  if (patientFetchPromise) return patientFetchPromise;

  patientFetchPromise = patientService
    .getAll()
    .then((res) => {
      const rawList = Array.isArray(res.data)
        ? res.data
        : res.data && typeof res.data === "object" && "data" in res.data && Array.isArray((res.data as any).data)
          ? (res.data as any).data
          : [];

      if (rawList.length > 0) {
        const mapped: Pasien[] = rawList.map((p: any) => {
          const rawAttrs = Array.isArray(p.attribute)
            ? p.attribute
            : Array.isArray(p.patient_attribute)
              ? p.patient_attribute
              : Array.isArray(p.attributes)
                ? p.attributes
                : Array.isArray(p.atribut)
                  ? p.atribut
                  : [];

          return {
            id: `PSN-${p.patient_id}`,
            nama: p.patient_name || "Pasien",
            tanggal_lahir: p.patient_birthdate ? p.patient_birthdate.split("T")[0] : "1990-01-01",
            umur: p.patient_age ?? calculateAge(p.patient_birthdate),
            jenis_kelamin: p.patient_gender === "Laki-laki" || p.patient_gender === "L" ? "Laki-laki" : "Perempuan",
            latar_belakang: p.patient_desc || "-",
            atribut: rawAttrs.map((a: any, idx: number) => ({
              id: String(a.patientattribute_id || a.id || `attr-${p.patient_id}-${idx}`),
              key: a.patientattribute_name || a.caseattribute_name || a.attribute_name || a.key || a.name || "Atribut",
              value: String(a.patientattribute_value ?? a.caseattribute_value ?? a.attribute_value ?? a.value ?? "-"),
            })),
            created_at: p.insert_timestamp ? p.insert_timestamp.split("T")[0] : "2026-08-10",
          };
        });
        cachedPatients = mapped;
        return mapped;
      }
      cachedPatients = [];
      return [];
    })
    .catch((err) => {
      console.error("[Step2PilihPasien] Gagal load master pasien:", err);
      cachedPatients = null;
      return [];
    })
    .finally(() => {
      patientFetchPromise = null;
    });

  return patientFetchPromise;
}

export function Step2PilihPasien({
  selectedPasienIds,
  onSelectedPasienIdsChange,
}: Step2PilihPasienProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [allPasien, setAllPasien] = React.useState<Pasien[]>(() => cachedPatients || []);
  const [isLoadingPasien, setIsLoadingPasien] = React.useState(!cachedPatients);

  React.useEffect(() => {
    let isMounted = true;

    fetchAllPatientsOnce()
      .then((data) => {
        if (!isMounted) return;
        setAllPasien(data);
      })
      .finally(() => {
        if (isMounted) setIsLoadingPasien(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedPasienList = React.useMemo(() => {
    return allPasien.filter((p) => {
      const pNum = String(p.id).replace(/[^0-9]/g, "");
      return selectedPasienIds.some((sId) => String(sId).replace(/[^0-9]/g, "") === pNum);
    });
  }, [allPasien, selectedPasienIds]);

  const handleRemovePasien = (id: string) => {
    const num = String(id).replace(/[^0-9]/g, "");
    onSelectedPasienIdsChange(selectedPasienIds.filter((pId) => String(pId).replace(/[^0-9]/g, "") !== num));
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 border-b pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">
            Step 2: Subjek Pasien Terkait Kasus
          </h3>
          <Badge variant="outline" className="text-xs">
            {selectedPasienIds.length} Pasien Dipilih
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Tentukan satu atau lebih pasien dari master config pasien yang menjadi fokus studi dalam kasus ini.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Selected Patients List */}
        {selectedPasienList.length > 0 && (
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold text-foreground">
              Daftar Pasien Terpilih ({selectedPasienList.length}):
            </span>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {selectedPasienList.map((pasien) => (
                <div
                  key={pasien.id}
                  className="flex flex-col justify-between rounded-xl border border-primary/30 bg-primary/5 p-3.5 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                        <User className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-foreground">
                          {pasien.nama}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {pasien.id} &bull; {pasien.umur} th &bull; {pasien.jenis_kelamin}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemovePasien(pasien.id)}
                      title="Hapus dari kasus"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>

                  {pasien.atribut && pasien.atribut.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1 border-t border-primary/10 pt-2">
                      {pasien.atribut.map((attr) => (
                        <span
                          key={attr.id}
                          className="rounded bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground border border-border/50"
                        >
                          <span className="font-medium">{attr.key}:</span> {attr.value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Large Dashed Box with Centered + Button to open modal */}
        <div
          onClick={() => setIsModalOpen(true)}
          className="group flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-border/80 bg-muted/10 p-6 text-center transition-all duration-200 hover:border-primary/60 hover:bg-primary/5 active:scale-[0.99]"
        >
          <div className="flex size-12 items-center justify-center rounded-full border border-border/80 bg-background shadow-xs transition-transform duration-200 group-hover:scale-110 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground text-primary">
            <Plus className="size-6 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {selectedPasienIds.length > 0 ? "+ Tambah / Kelola Pasien Kasus" : "+ Pilih Pasien Kasus"}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">
              Klik di sini untuk membuka katalog data pasien dan memilih dengan mudah
            </span>
          </div>
        </div>
      </div>

      {/* Modal Dialog Picker */}
      <PasienPickerModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedIds={selectedPasienIds}
        onConfirmSelection={onSelectedPasienIdsChange}
        pasienList={allPasien}
        isLoading={isLoadingPasien}
      />
    </div>
  );
}
