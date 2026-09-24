import { Link } from "@tanstack/react-router";
import { CheckCircle2, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { KelompokRekapData } from "@/routes/(admin)/dashboard/contest/rekap/-components/rekap-data";

interface RekapLombaTableProps {
  rekapList: KelompokRekapData[];
  contestId: string;
}

export function RekapLombaTable({ rekapList, contestId }: RekapLombaTableProps) {
  return (
    <Card className="shadow-xs overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-serif font-bold flex items-center gap-2">
              Rekapitulasi Nilai & Peringkat Kelompok
            </CardTitle>
            <CardDescription className="text-xs">
              Hasil akumulasi skor dari 5 pos sirkuit kebidanan, status kelulusan, dan catatan evaluasi
            </CardDescription>
          </div>
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5"
              nativeButton={false}
              render={
                <Link
                  to="/dashboard/contest/rekap"
                  search={{ contestId }}
                />
              }
            >
              <span>Buka Rekap Lengkap</span>
              <ChevronRight className="size-3.5" />
            </Button>
          </CardAction>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <Table className="text-xs">
          <TableHeader className="bg-muted/40 font-serif">
            <TableRow>
              <TableHead className="w-14 text-center">Rank</TableHead>
              <TableHead className="min-w-[160px]">Kelompok & Kasus</TableHead>
              <TableHead className="min-w-[150px]">Anggota Mahasiswa</TableHead>
              <TableHead className="text-center font-mono">Pos 1</TableHead>
              <TableHead className="text-center font-mono">Pos 2</TableHead>
              <TableHead className="text-center font-mono">Pos 3</TableHead>
              <TableHead className="text-center font-mono">Pos 4</TableHead>
              <TableHead className="text-center font-mono">Pos 5</TableHead>
              <TableHead className="text-right font-mono font-bold">Total Skor</TableHead>
              <TableHead className="text-center">Waktu</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rekapList.map((kel, idx) => {
              return (
                <TableRow key={kel.id} className="hover:bg-muted/30 transition-colors">
                  {/* Rank */}
                  <TableCell className="text-center font-mono font-bold">
                    {idx === 0 ? (
                      <Badge variant="default" className="text-[11px] px-2 py-0.5 font-mono">
                        #1
                      </Badge>
                    ) : idx === 1 ? (
                      <Badge variant="secondary" className="text-[11px] px-2 py-0.5 font-mono">
                        #2
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground font-mono">#{idx + 1}</span>
                    )}
                  </TableCell>

                  {/* Nama Kelompok & Kasus */}
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-foreground text-xs">{kel.nama}</span>
                      <span className="text-[11px] text-muted-foreground line-clamp-1 truncate max-w-[200px]" title={kel.kasusNama}>
                        {kel.kasusNama}
                      </span>
                    </div>
                  </TableCell>

                  {/* Anggota Tim */}
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium text-foreground">
                        {kel.anggota[0]?.nama || "Ketua Tim"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        +{kel.anggota.length - 1} Anggota Lainnya
                      </span>
                    </div>
                  </TableCell>

                  {/* Skor Pos 1..5 */}
                  <TableCell className="text-center font-mono font-medium">
                    {kel.stase1?.totalSkor ?? "-"}
                  </TableCell>
                  <TableCell className="text-center font-mono font-medium">
                    {kel.stase2?.totalSkor ?? "-"}
                  </TableCell>
                  <TableCell className="text-center font-mono font-medium">
                    {kel.stase3?.totalSkor ?? "-"}
                  </TableCell>
                  <TableCell className="text-center font-mono font-medium">
                    {kel.stase4?.totalSkor ?? "-"}
                  </TableCell>
                  <TableCell className="text-center font-mono font-medium">
                    {kel.stase5?.totalSkor ?? "-"}
                  </TableCell>

                  {/* Total Skor & Rata-rata */}
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-mono font-extrabold text-sm text-primary">
                        {kel.totalAkumulasi} / 500
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Avg: {kel.rataRataSkor}%
                      </span>
                    </div>
                  </TableCell>

                  {/* Waktu */}
                  <TableCell className="text-center font-mono text-[11px] text-muted-foreground">
                    ⏱️ {kel.waktuPengerjaan?.slice(0, 8)}
                  </TableCell>

                  {/* Status & Predikat */}
                  <TableCell className="text-center">
                    <Badge
                      className={
                        kel.status === "Lulus"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                          : "bg-destructive/10 text-destructive text-[10px]"
                      }
                    >
                      <CheckCircle2 className="size-2.5 mr-1" />
                      {kel.predikat || kel.status}
                    </Badge>
                  </TableCell>

                  {/* Aksi */}
                  <TableCell className="text-right">
                    <Button
                      size="xs"
                      variant="ghost"
                      className="text-xs text-primary hover:text-primary font-semibold"
                      nativeButton={false}
                      render={
                        <Link
                          to="/dashboard/contest/rekap"
                          search={{ contestId, kelompokId: kel.id }}
                        />
                      }
                    >
                      Detail &rarr;
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
