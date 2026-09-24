import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { KelompokRekapData } from "@/routes/(admin)/dashboard/contest/rekap/-components/rekap-data";

interface StasePerformanceChartProps {
  rekapList: KelompokRekapData[];
}

export function StasePerformanceChart({ rekapList }: StasePerformanceChartProps) {
  // Calculate average scores per stase
  const count = rekapList.length || 1;

  const staseScores = React.useMemo(() => {
    const s1 = rekapList.reduce((acc, r) => acc + (r.stase1?.totalSkor || 0), 0) / count;
    const s2 = rekapList.reduce((acc, r) => acc + (r.stase2?.totalSkor || 0), 0) / count;
    const s3 = rekapList.reduce((acc, r) => acc + (r.stase3?.totalSkor || 0), 0) / count;
    const s4 = rekapList.reduce((acc, r) => acc + (r.stase4?.totalSkor || 0), 0) / count;
    const s5 = rekapList.reduce((acc, r) => acc + (r.stase5?.totalSkor || 0), 0) / count;

    return [
      {
        stase: "Pos 1: Anamnesis",
        shortName: "Pos 1",
        label: "Anamnesis AI",
        average: Number(s1.toFixed(1)),
        color: "#3b82f6",
        maxScore: 100,
      },
      {
        stase: "Pos 2: Faktor Risiko",
        shortName: "Pos 2",
        label: "Faktor Risiko",
        average: Number(s2.toFixed(1)),
        color: "#f59e0b",
        maxScore: 100,
      },
      {
        stase: "Pos 3: Prosedur IVA",
        shortName: "Pos 3",
        label: "Prosedur IVA",
        average: Number(s3.toFixed(1)),
        color: "#a855f7",
        maxScore: 100,
      },
      {
        stase: "Pos 4: Interpretasi",
        shortName: "Pos 4",
        label: "Interpretasi Visual",
        average: Number(s4.toFixed(1)),
        color: "#10b981",
        maxScore: 100,
      },
      {
        stase: "Pos 5: Asuhan",
        shortName: "Pos 5",
        label: "Asuhan AI",
        average: Number(s5.toFixed(1)),
        color: "#f43f5e",
        maxScore: 100,
      },
    ];
  }, [rekapList, count]);

  const bestStase = [...staseScores].sort((a, b) => b.average - a.average)[0];

  return (
    <Card className="shadow-xs flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-serif font-bold flex items-center gap-2">
              Analisis Performa Stase OSCE
            </CardTitle>
            <CardDescription className="text-xs">
              Rata-rata perolehan nilai peserta di seluruh 5 pos sirkuit kebidanan
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
              Tertinggi: {bestStase?.label} ({bestStase?.average}%)
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={staseScores}
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
              <XAxis
                dataKey="shortName"
                stroke="currentColor"
                opacity={0.7}
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="currentColor"
                opacity={0.7}
                fontSize={11}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-border bg-card p-2.5 shadow-xl text-xs flex flex-col gap-1">
                        <span className="font-bold text-foreground">{data.stase}</span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-muted-foreground">Rata-rata:</span>
                          <span className="font-extrabold text-primary">{data.average} / 100</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          Passing Grade: 75 Poin
                        </span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={75}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{
                  value: "Passing Grade (75%)",
                  position: "top",
                  fill: "#10b981",
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
              <Bar dataKey="average" radius={[6, 6, 0, 0]}>
                {staseScores.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / Stase Quick Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 border-t border-border/50 text-[11px]">
          {staseScores.map((s) => (
            <div key={s.stase} className="flex flex-col gap-0.5">
              <span className="text-muted-foreground truncate">{s.label}</span>
              <span className="font-mono font-bold" style={{ color: s.color }}>
                {s.average} Poin
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
