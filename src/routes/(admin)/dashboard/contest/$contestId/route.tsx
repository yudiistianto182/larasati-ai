import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fallbackContests, type ContestRow } from "../-components/data";
import { ContestStepsNav, type Step } from "./-components/contest-steps-nav";
import { ContestInfoPanel } from "./-components/contest-info-panel";
import { TeamSetupWizard } from "./-components/team-setup-wizard";

export const Route = createFileRoute("/(admin)/dashboard/contest/$contestId")({
  component: Page,
});

function Page() {
  const { contestId } = Route.useParams();

  // Scroll sentinel ref for sticky bar triggers
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = React.useState(false);

  // Dynamic steps list state
  const [stepsList, setStepsList] = React.useState<Step[]>([
    { id: 1, title: "Tim & Anggota" },
    { id: 2, title: "Aturan & Bobot" },
    { id: 3, title: "Publikasi Lomba" },
    { id: 4, title: "Finalisasi" },
  ]);

  // Wizard active step
  const [activeStep, setActiveStep] = React.useState<number>(1);

  // Add dynamic step modal states
  const [isAddStepOpen, setIsAddStepOpen] = React.useState(false);
  const [newStepTitle, setNewStepTitle] = React.useState("");
  const [newStepDuration, setNewStepDuration] = React.useState("");

  // Load contest record from mock fallback data
  const initialContest = React.useMemo(() => {
    const match = fallbackContests.find((c) => String(c.contest_id) === contestId);
    return (
      match ?? {
        contest_id: Number(contestId),
        contest_name: `Kontes ID ${contestId}`,
        contest_periode_id: 1,
        contest_datestart: new Date().toISOString(),
        contest_dateend: new Date().toISOString(),
        contest_desc: "Detail kontes tidak ditemukan.",
      }
    );
  }, [contestId]);

  const [contest, setContest] = React.useState<ContestRow>(initialContest);

  // Scroll detection using IntersectionObserver
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only trigger sticky bar if the sentinel has scrolled past the top viewport threshold
        const isPastTop = entry.boundingClientRect.top < 200;
        setIsSticky(!entry.isIntersecting && isPastTop);
      },
      { threshold: 0 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleAddStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepTitle.trim()) return;

    const nextId = stepsList.length + 1;
    const durationNum = newStepDuration.trim() ? Number(newStepDuration) : undefined;

    const newStep: Step = {
      id: nextId,
      title: newStepTitle.trim(),
      duration: durationNum,
    };

    setStepsList((prev) => [...prev, newStep]);
    setActiveStep(nextId);
    setIsAddStepOpen(false);
    setNewStepTitle("");
    setNewStepDuration("");
  };

  return (
    <div className="flex flex-col gap-8 pb-12 relative">

      {/* Floating Sticky Mini Contest Info Bar - pins below layout header */}
      {isSticky && (
        <div className="fixed top-12 left-0 md:left-[var(--sidebar-width,calc(var(--spacing)*68))] right-0 z-40 px-6 py-2.5 bg-background/95 backdrop-blur border-b flex items-center justify-between gap-4 shadow-sm animate-in fade-in-0 duration-150">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Kontes Aktif</span>
            <span className="text-sm font-bold text-foreground leading-tight">{contest.contest_name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-muted-foreground font-mono">
              {new Date(contest.contest_datestart).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - {new Date(contest.contest_dateend).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>
        </div>
      )}

      {/* Back button and page title header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-2">
          <Button nativeButton={false} variant="ghost" size="icon-sm" className="size-8" render={<Link to="/dashboard/contest" />}>
            <ChevronLeft className="size-4" />
          </Button>
          <div className="grid gap-0.5">
            <h1 className="text-xl font-bold text-foreground tracking-tight">Atur Kontes</h1>
            <p className="text-xs text-muted-foreground">Detail kontes, setup tim, aturan, dan publikasi.</p>
          </div>
        </div>
      </div>

      {/* Section 1: # Detail Kontes */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground tracking-tight"># Detail Kontes</h2>
        <ContestInfoPanel contest={contest} onUpdate={setContest} />
      </div>

      {/* Scroll detection sentinel - triggers when detail kontes is scrolled past */}
      <div ref={sentinelRef} className="h-px w-full" />

      {/* Section 2: # Tim Baru */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground tracking-tight"># Tim Baru</h2>
        <TeamSetupWizard contestId={contestId} />
      </div>

      {/* Section 3: # Aturan Lomba */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground tracking-tight"># Aturan Lomba</h2>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Regulasi Umum Kompetisi</CardTitle>
            <CardDescription>Tata tertib pelaksanaan contest lomba konsultasi online midwife.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed flex flex-col gap-2">
            <p>1. Setiap tim wajib terdiri dari midwife yang terdaftar aktif dalam sistem administrasi.</p>
            <p>2. Konsultasi dilakukan secara daring/online sesuai dengan jadwal start dan end date yang ditentukan.</p>
            <p>3. Penilaian didasarkan pada ketepatan diagnosa, kecepatan respon, dan empati pelayanan pasien.</p>
          </CardContent>
        </Card>
      </div>

      {/* Section 4: # Pengaturan Pos (wizard steps begin here) */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-foreground tracking-tight"># Pengaturan Pos</h2>
        
        {/* Steps navigation header with dynamic adder trigger */}
        <ContestStepsNav
          stepsList={stepsList}
          activeStep={activeStep}
          onStepChange={setActiveStep}
          onAddStepClick={() => setIsAddStepOpen(true)}
        />

        {/* Dynamic steps view */}
        <div className="flex flex-col gap-4">
          {activeStep === 1 && (
            <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
              <h3 className="text-sm font-semibold text-foreground">Step 1: Inisialisasi Pos & Validasi Data</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Konfigurasi pos pemeriksaan dan pembagian tugas awal juri. Langkah pertama ini memvalidasi kelengkapan berkas midwife.
              </p>
            </div>
          )}

          {activeStep === 2 && (
            <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
              <h3 className="text-sm font-semibold text-foreground">Step 2: Pengaturan Aturan & Bobot Pos</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Konfigurasi grading, bobot parameter konsultasi di setiap pos, dan kriteria penilaian juri untuk Lomba akan terintegrasi di step ini.
              </p>
            </div>
          )}

          {activeStep === 3 && (
            <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
              <h3 className="text-sm font-semibold text-foreground">Step 3: Publikasi Pos</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Konfigurasi pendaftaran peserta, pengumuman publik, serta sinkronisasi timeline event pos akan diaktifkan di step ini.
              </p>
            </div>
          )}

          {activeStep === 4 && (
            <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
              <h3 className="text-sm font-semibold text-foreground">Step 4: Finalisasi Pos</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Review data tim, jadwal pelaksanaan, aturan penilaian di setiap pos, kemudian klik launch untuk mengaktifkan kontes di server.
              </p>
            </div>
          )}

          {activeStep > 4 && (() => {
            const currentStep = stepsList.find((s) => s.id === activeStep);
            return (
              <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Pos Dinamis: {currentStep?.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Konfigurasi detail, jadwal alur, dan bobot penilaian dinamis untuk pos ini.
                  </p>
                </div>
                <div className="grid gap-2 border-t pt-4 text-xs text-foreground">
                  <div className="flex justify-between py-1 border-b border-muted/30">
                    <span className="text-muted-foreground">ID Pos</span>
                    <span className="font-mono font-bold">{currentStep?.id}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-muted/30">
                    <span className="text-muted-foreground">Nama Status Pos</span>
                    <span className="font-semibold">{currentStep?.title}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Durasi Pengerjaan</span>
                    <span className="font-semibold text-primary">{currentStep?.duration ? `${currentStep.duration} Menit` : "Tidak ditentukan"}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Add Dynamic Pos Dialog Modal */}
      <Dialog open={isAddStepOpen} onOpenChange={setIsAddStepOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Pos Baru</DialogTitle>
            <DialogDescription>Tambahkan pos ujian dinamis di akhir alur pelaksanaan lomba.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddStepSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="step-pos-title">Nama Status Pos</Label>
              <Input
                id="step-pos-title"
                placeholder="e.g. Pos 5: Imunisasi Bayi"
                value={newStepTitle}
                onChange={(e) => setNewStepTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="step-pos-duration">Durasi Pos (Menit)</Label>
              <Input
                id="step-pos-duration"
                type="number"
                placeholder="e.g. 45"
                value={newStepDuration}
                onChange={(e) => setNewStepDuration(e.target.value)}
              />
            </div>

            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddStepOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={!newStepTitle.trim()}>
                Tambah
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
