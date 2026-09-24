import * as React from "react";
import { format } from "date-fns";
import { Calendar, Edit, Info } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DateRangePicker } from "@/components/date-range-picker";
import { type ContestRow } from "../../-components/data";
import { contestService, periodeService } from "@/services/api";

interface ContestInfoPanelProps {
  contest: ContestRow;
  onUpdate: (updatedContest: ContestRow) => void;
}

export function ContestInfoPanel({ contest, onUpdate }: ContestInfoPanelProps) {
  const [isUpdateOpen, setIsUpdateOpen] = React.useState(false);

  // Form states
  const [name, setName] = React.useState(contest.contest_name);
  const [desc, setDesc] = React.useState(contest.contest_desc);
  const [periodeId, setPeriodeId] = React.useState(contest.contest_periode_id);
  const [dates, setDates] = React.useState<DateRange | undefined>({
    from: new Date(contest.contest_datestart),
    to: new Date(contest.contest_dateend),
  });
  const [isSaving, setIsSaving] = React.useState(false);

  // Load full detail from API (for scorer list)
  const [scorerList, setScorerList] = React.useState<{ contestscorer_id: number; user_fullname: string }[]>(
    contest.scorer || [],
  );
  const hasFetchedRef = React.useRef(false);

  React.useEffect(() => {
    if (hasFetchedRef.current || !contest.contest_id) return;
    hasFetchedRef.current = true;

    contestService.getDetail(contest.contest_id).then((res) => {
      if (res.status && res.data?.scorer) {
        setScorerList(res.data.scorer);
      }
    }).catch(() => {});
  }, [contest.contest_id]);

  const [periodes, setPeriodes] = React.useState<{ periode_id: number; periode_name: string }[]>([]);

  React.useEffect(() => {
    periodeService.getAll().then((res) => {
      if (res.status && res.data) {
        setPeriodes(res.data.map((p) => ({ periode_id: Number(p.periode_id), periode_name: p.periode_name })));
      }
    }).catch(() => {});
  }, []);

  // Track parent changes
  React.useEffect(() => {
    setName(contest.contest_name);
    setDesc(contest.contest_desc);
    setPeriodeId(contest.contest_periode_id);
    setDates({
      from: new Date(contest.contest_datestart),
      to: new Date(contest.contest_dateend),
    });
  }, [contest]);

  const activePeriod = periodes.find((p) => p.periode_id === contest.contest_periode_id);
  const periodLabel = activePeriod ? activePeriod.periode_name : `Periode ${contest.contest_periode_id}`;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !desc.trim() || !dates?.from || !dates?.to) return;

    setIsSaving(true);
    try {
      await contestService.update(contest.contest_id, {
        name: name.trim(),
        desc: desc.trim(),
        periode_id: periodeId,
        datestart: format(dates.from, "yyyy-MM-dd"),
        dateend: format(dates.to, "yyyy-MM-dd"),
      });
    } catch {
      // Gagal update API, tetap update lokal agar tidak stuck
    } finally {
      setIsSaving(false);
    }

    const updated: ContestRow = {
      ...contest,
      contest_name: name.trim(),
      contest_desc: desc.trim(),
      contest_periode_id: periodeId,
      contest_datestart: dates.from.toISOString(),
      contest_dateend: dates.to.toISOString(),
    };

    onUpdate(updated);
    setIsUpdateOpen(false);
  };

  const periodSelectItems = React.useMemo(
    () => periodes.map((p) => ({ value: String(p.periode_id), label: p.periode_name })),
    [periodes],
  );

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="size-4.5 text-primary" />
            Detail Kontes
          </CardTitle>
          <CardDescription>Informasi umum dan jadwal kontes.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nama Kontes</span>
            <span className="text-base font-bold text-foreground">{contest.contest_name}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deskripsi Lomba</span>
            <span className="text-sm text-foreground leading-relaxed">{contest.contest_desc}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Periode Aktif</span>
            <span className="text-sm font-medium text-foreground">{periodLabel}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jadwal Pelaksanaan</span>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Calendar className="size-4 text-muted-foreground" />
              <span>
                {format(new Date(contest.contest_datestart), "d MMM yyyy")}
                {" - "}
                {format(new Date(contest.contest_dateend), "d MMM yyyy")}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => setIsUpdateOpen(true)}
          >
            <Edit className="size-3.5" /> Update Informasi
          </Button>

          {/* Daftar Juri */}
          {scorerList.length > 0 && (
            <div className="flex flex-col gap-1.5 border-t pt-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Daftar Juri</span>
              <div className="flex flex-col gap-1">
                {scorerList.map((s) => (
                  <span key={s.contestscorer_id} className="text-sm text-foreground">
                    {s.user_fullname}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Persistent Update Info Dialog Modal */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Informasi Kontes</DialogTitle>
            <DialogDescription>Perbarui nama, deskripsi, periode, atau jadwal pelaksanaan kontes ini.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-info-name">Nama Kontes</Label>
              <Input
                id="edit-info-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-info-desc">Deskripsi</Label>
              <Input
                id="edit-info-desc"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-info-periode">Periode</Label>
              <Select
                items={periodSelectItems}
                value={String(periodeId)}
                onValueChange={(val) => {
                  if (val) setPeriodeId(Number(val));
                }}
              >
                <SelectTrigger id="edit-info-periode" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="bottom">
                  <SelectGroup>
                    {periodes.map((p) => (
                      <SelectItem key={p.periode_id} value={String(p.periode_id)}>
                        {p.periode_name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Jadwal Kontes (Start & End Date)</Label>
              <DateRangePicker value={dates} onChange={setDates} />
            </div>

            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => setIsUpdateOpen(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !name.trim() || !desc.trim() || !dates?.from || !dates?.to}
              >
                {isSaving ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
