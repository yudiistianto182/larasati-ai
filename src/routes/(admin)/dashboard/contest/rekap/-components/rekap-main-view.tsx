import * as React from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Eye,
  FileCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RekapHeader } from "./rekap-header";
import { RekapOverviewCards } from "./rekap-overview-cards";
import { DetailJawabanKelompokModal } from "./detail-jawaban-kelompok-modal";
import { KunciJawabanReferenceSection } from "./kunci-jawaban-reference-section";
import { type KelompokRekapData, REKAP_KELOMPOK_LIST } from "./rekap-data";

interface RekapMainViewProps {
  contestId?: string;
}

export function RekapMainView({ contestId }: RekapMainViewProps) {
  const [activeTab, setActiveTab] = React.useState<string>("rekap");
  const [selectedKelompokForModal, setSelectedKelompokForModal] =
    React.useState<KelompokRekapData | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);

  const kelompokList = REKAP_KELOMPOK_LIST;

  const handleOpenModal = (kelompok: KelompokRekapData) => {
    setSelectedKelompokForModal(kelompok);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* 1. Header with Breadcrumb, Actions, and Title */}
      <RekapHeader />

      {/* 2. Modal Dialog Besar Jawaban Kelompok */}
      <DetailJawabanKelompokModal
        kelompok={selectedKelompokForModal}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />

      {/* 3. Main Tabbed Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col gap-6">
        <div className="flex items-center justify-between border-b pb-3 gap-2 flex-wrap">
          <TabsList className="h-10 bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="rekap" className="text-xs gap-1.5 px-3.5 rounded-lg data-[state=active]:shadow-xs">
              <Users className="size-3.5" />
              <span>Rekap Nilai Seluruh Kelompok</span>
            </TabsTrigger>

            <TabsTrigger value="kunci-jawaban" className="text-xs gap-1.5 px-3.5 rounded-lg data-[state=active]:shadow-xs text-primary font-semibold">
              <BookOpen className="size-3.5" />
              <span>Kunci Jawaban & Rubrik Standar</span>
            </TabsTrigger>
          </TabsList>

          <div className="text-xs text-muted-foreground font-mono hidden md:flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            <span>2 Kelompok Selesai Diuji &bull; Klik Baris untuk Buka Dialog Jawaban</span>
          </div>
        </div>

        {/* Tab 1: Rekap Nilai & Kartu Kelompok */}
        <TabsContent value="rekap" className="m-0 flex flex-col gap-8">
          {/* Quick Metrics & Matrix Table with Modal Triggers */}
          <RekapOverviewCards onOpenKelompokModal={handleOpenModal} />

          {/* Direct Cards for 2 Groups */}
          <div className="flex flex-col gap-4 border-t pt-8">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
                  Akses Cepat Jawaban Tiap Kelompok
                </Badge>
              </div>
              <h2 className="text-xl font-serif font-black text-foreground">
                Pilih Kelompok untuk Membuka Dialog Jawaban Lengkap
              </h2>
              <p className="text-xs text-muted-foreground">
                Klik kartu kelompok di bawah ini untuk memunculkan dialog modal besar yang merinci seluruh transkrip, kartu faktor risiko, urutan langkah SOP, dan pilihan diagnosis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {kelompokList.map((kel) => (
                <Card
                  key={kel.id}
                  onClick={() => handleOpenModal(kel)}
                  className="shadow-xs cursor-pointer hover:border-primary/60 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            kel.rank === 1
                              ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 font-bold text-xs"
                              : "bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/40 font-bold text-xs"
                          }
                        >
                          {kel.rank === 1 ? "🥇 Juara 1" : "🥈 Juara 2"}
                        </Badge>
                        <Badge variant="outline" className="text-xs font-mono">
                          {kel.status}
                        </Badge>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-baseline gap-1 font-mono">
                          <span className="text-2xl font-black text-primary">
                            {kel.totalAkumulasi}
                          </span>
                          <span className="text-xs text-muted-foreground font-semibold">/500 Poin</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Rata-rata: {kel.rataRataSkor.toFixed(1)} / 100
                        </span>
                      </div>
                    </div>

                    <CardTitle className="text-lg font-serif font-bold text-foreground group-hover:text-primary transition-colors mt-2">
                      {kel.nama}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-1">
                      {kel.kasusNama}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 flex flex-col gap-4">
                    {/* Mini Pos Scores Bar */}
                    <div className="grid grid-cols-5 gap-1.5 text-center">
                      <div className="rounded-lg bg-muted/40 p-1.5 flex flex-col">
                        <span className="text-[9px] text-muted-foreground font-mono">Pos 1</span>
                        <span className="text-xs font-mono font-bold text-foreground">{kel.stase1.totalSkor}</span>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-1.5 flex flex-col">
                        <span className="text-[9px] text-muted-foreground font-mono">Pos 2</span>
                        <span className="text-xs font-mono font-bold text-foreground">{kel.stase2.totalSkor}</span>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-1.5 flex flex-col">
                        <span className="text-[9px] text-muted-foreground font-mono">Pos 3</span>
                        <span className="text-xs font-mono font-bold text-foreground">{kel.stase3.totalSkor}</span>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-1.5 flex flex-col">
                        <span className="text-[9px] text-muted-foreground font-mono">Pos 4</span>
                        <span className="text-xs font-mono font-bold text-foreground">{kel.stase4.totalSkor}</span>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-1.5 flex flex-col">
                        <span className="text-[9px] text-muted-foreground font-mono">Pos 5</span>
                        <span className="text-xs font-mono font-bold text-foreground">{kel.stase5.totalSkor}</span>
                      </div>
                    </div>

                    {/* Team Members List */}
                    <div className="text-[11px] text-muted-foreground line-clamp-1">
                      Anggota: {kel.anggota.map((a) => a.nama).join(", ")}
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(kel);
                      }}
                      className="w-full gap-1.5 font-semibold text-xs rounded-xl shadow-xs"
                    >
                      <Eye className="size-3.5" />
                      <span>Buka Dialog Jawaban 5 Pos Lengkap</span>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Answer Key Reference Section at Bottom */}
          <div className="border-t pt-8">
            <KunciJawabanReferenceSection />
          </div>
        </TabsContent>

        {/* Tab 2: Kunci Jawaban Standar */}
        <TabsContent value="kunci-jawaban" className="m-0 flex flex-col gap-6">
          <KunciJawabanReferenceSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
