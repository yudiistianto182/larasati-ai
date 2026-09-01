import * as React from "react";
import {
  ArrowRight,
  Crown,
  KeyRound,
  Lock,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Contest, KelompokLomba } from "@/stores/contest-store";
import type { Kasus } from "@/routes/(admin)/dashboard/master/kasus/-components/data";
import { playCtaClickSound, playTransitionChime } from "./lomba-sound-effects";

interface LombaAuthScreenProps {
  contest?: Contest;
  kasus?: Kasus;
  onLoginSuccess: (kelompok: KelompokLomba) => void;
}

export function LombaAuthScreen({
  contest,
  kasus,
  onLoginSuccess,
}: LombaAuthScreenProps) {
  const kelompokList = contest?.kelompok_list || [
    {
      id: "kel-01",
      nama: "Kelompok A (Stase Pagi)",
      mahasiswa_ids: ["mhs-01", "mhs-02", "mhs-03"],
      ketua_mhs_id: "mhs-01",
      kasus_id: "KSS-001",
    },
    {
      id: "kel-02",
      nama: "Kelompok B (Stase Siang)",
      mahasiswa_ids: ["mhs-04", "mhs-05", "mhs-06"],
      ketua_mhs_id: "mhs-04",
      kasus_id: "KSS-001",
    },
  ];

  const [username, setUsername] = React.useState<string>("sitinurdhaliza");
  const [selectedKelompokId, setSelectedKelompokId] = React.useState<string>(
    kelompokList[0]?.id || "kel-01",
  );
  const [password, setPassword] = React.useState<string>("1234");
  const [errorMsg, setErrorMsg] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const selectedKelompok = kelompokList.find((k) => k.id === selectedKelompokId) || kelompokList[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedKelompok) {
      setErrorMsg("Pilih kelompok terlebih dahulu.");
      return;
    }

    if (!password.trim()) {
      setErrorMsg("Masukkan password atau token tim.");
      return;
    }

    playCtaClickSound();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      playTransitionChime();
      onLoginSuccess(selectedKelompok);
    }, 400);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-3 sm:p-6 lg:p-10 select-none overflow-hidden">
      {/* Dynamic Keyframes for Float & Breathing Animation */}
      <style>{`
        @keyframes floatLarasatiHero {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.03);
          }
        }
        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.96);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.04);
          }
        }
      `}</style>

      {/* Main 2-Column Split Card Container */}
      <div className="relative z-10 grid w-full max-w-6xl grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-3xl border-2 border-[#8c6d23]/50 bg-[#120d08]/95 shadow-[0_0_50px_rgba(0,0,0,0.85)] backdrop-blur-md">

        {/* ============================================================ */}
        {/* KOLOM KIRI (HERO SECTION LARASATI DENGAN FOTO OVAL FULL WIDTH) */}
        {/* ============================================================ */}
        <div className="relative lg:col-span-7 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-[#8c6d23]/40 bg-gradient-to-br from-[#261a0e] via-[#1a1209] to-[#0d0905] p-6 sm:p-10 text-[#f3e5ab]">

          {/* Radial Ambient Gold Light Behind Avatar */}
          <div
            style={{ animation: "glowPulse 4s ease-in-out infinite" }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-[radial-gradient(circle,_#d4af37_0%,_transparent_70%)] opacity-35 blur-3xl pointer-events-none"
          />

          {/* Top Tag & Badge */}
          <div className="relative z-10 flex items-center justify-between mb-4">
            <Badge className="bg-[#d4af37] text-[#14100c] font-serif font-extrabold text-[11px] px-2.5 py-0.5 shadow-md uppercase tracking-wider">
              LARASATI JOURNEY
            </Badge>
          </div>

          {/* Center / Side-by-Side: Larasati Photo on Left + Acronym Breakdown on Right */}
          <div className="relative z-10 my-auto flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
            {/* Larasati Oval Photo Frame */}
            <div
              style={{ animation: "floatLarasatiHero 4.5s ease-in-out infinite" }}
              className="relative flex items-center justify-center shrink-0"
            >
              {/* Grand Golden Oval Frame */}
              <div className="relative rounded-[50%/40%] border-2 border-[#d4af37] bg-gradient-to-b from-[#3a2512] via-[#20150a] to-[#120d07] shadow-[0_0_35px_rgba(212,175,55,0.45)] ring-2 ring-[#d4af37]/50 overflow-hidden w-44 sm:w-48 md:w-52 aspect-[4/5] flex items-center justify-center">
                <img
                  src="/images/larasati.png"
                  alt="Larasati"
                  className="w-full h-full object-cover object-top filter brightness-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/ny_ani_patient_torso.jpg";
                  }}
                />
              </div>
            </div>

            {/* Samping Foto: Grand Title & Breakdown Acronym */}
            <div className="flex flex-col text-left flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-widest bg-gradient-to-b from-[#fff8db] via-[#d4af37] to-[#997a15] bg-clip-text text-transparent drop-shadow-md">
                  LARASATI
                </h1>
              </div>

              <div className="w-20 h-0.5 bg-gradient-to-r from-[#d4af37] to-transparent mb-3" />

              {/* Breakdown Acronym Text */}
              <div className="text-xs sm:text-[13px] text-[#f3e5ab] leading-relaxed font-serif">
                <p>
                  <span className="font-extrabold text-[#fde047] text-sm">L</span>earning through virtual{" "}
                  <span className="font-extrabold text-[#fde047] text-sm">A</span>namnesis,{" "}
                  <span className="font-extrabold text-[#fde047] text-sm">R</span>isk factor,{" "}
                  <span className="font-extrabold text-[#fde047] text-sm">A</span>rrangement of Procedure,{" "}
                  <span className="font-extrabold text-[#fde047] text-sm">S</span>creening,{" "}
                  <span className="font-extrabold text-[#fde047] text-sm">A</span>ssessment and{" "}
                  <span className="font-extrabold text-[#fde047] text-sm">T</span>ransition to{" "}
                  <span className="font-extrabold text-[#fde047] text-sm">I</span>ntegrated Midwifery Care
                </p>
              </div>

              {/* Subtitle Motto Card */}
              <div className="mt-3.5 p-3 rounded-xl border border-[#8c6d23]/50 bg-[#1a1209]/85 shadow-sm">
                <p className="text-[11px] font-serif italic text-[#f9f586]/90 leading-snug">
                  &ldquo;An Interactive Clinical Journey for Cervical Cancer Screening through IVA in Midwifery Students.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* KOLOM KANAN (FORM LOGIN TIM & AUTENTIKASI PESERTA)          */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-[#140e08]/90 p-6 sm:p-10 text-[#f3e5ab]">

          {/* Form Header */}
          <div className="flex flex-col gap-1.5 border-b border-[#8c6d23]/30 pb-5">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40">
                <Lock className="size-4" />
              </div>
              <h2 className="font-serif font-bold text-lg text-[#fff8db]">
                Autentikasi Tim Peserta
              </h2>
            </div>
            <p className="text-xs text-[#e6d59c]/80 leading-relaxed">
              Silakan masukkan username dan password Tim Ketua untuk membuka stase ujian sirkuit.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="my-6 flex flex-col gap-5">
            {/* Error Message if any */}
            {errorMsg && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300 flex items-center gap-2 animate-in fade-in">
                <span>&bull; {errorMsg}</span>
              </div>
            )}

            {/* Input Username */}
            <div className="grid gap-2">
              <Label htmlFor="auth-username" className="font-serif text-xs font-semibold text-[#fff8db] flex items-center gap-1.5">
                <Users className="size-3.5 text-[#d4af37]" />
                Username <span className="text-red-400">*</span>
              </Label>
              <Input
                id="auth-username"
                placeholder="Masukkan Username Peserta"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 bg-[#1d140b] border-[#8c6d23]/60 text-xs text-[#fff8db] placeholder:text-[#e6d59c]/40 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                required
              />
              {/* <Select
                value={selectedKelompokId}
                onValueChange={(val) => setSelectedKelompokId(val || "")}
              >
                <SelectTrigger
                  id="auth-kelompok"
                  className="w-full h-11 bg-[#1d140b] border-[#8c6d23]/60 text-xs text-[#fff8db] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                >
                  <SelectValue placeholder="Pilih Kelompok..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1209] border-[#8c6d23] text-[#fff8db]">
                  <SelectGroup>
                    {kelompokList.map((kel) => (
                      <SelectItem
                        key={kel.id}
                        value={kel.id}
                        className="text-xs focus:bg-[#d4af37]/20 focus:text-[#fff8db] cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Crown className="size-3 text-[#d4af37]" />
                          <span>{kel.nama}</span>
                          <span className="text-[10px] text-[#e6d59c]/60">
                            ({kel.mahasiswa_ids?.length || 3} Mahasiswa)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select> */}
            </div>

            {/* Input Password / Token */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="auth-password" className="font-serif text-xs font-semibold text-[#fff8db] flex items-center gap-1.5">
                  <KeyRound className="size-3.5 text-[#d4af37]" />
                  Password <span className="text-red-400">*</span>
                </Label>
              </div>
              <Input
                id="auth-password"
                type="password"
                placeholder="Masukkan PIN Tim (cth: 1234)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-[#1d140b] border-[#8c6d23]/60 text-xs text-[#fff8db] placeholder:text-[#e6d59c]/40 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                required
              />
            </div>

            {/* Active Case Preview Badge */}
            {/* <div className="rounded-xl border border-[#8c6d23]/40 bg-[#1f150b]/60 p-3 flex items-center justify-between text-xs">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#e6d59c]/70 uppercase tracking-wider font-mono">
                  Skenario Kasus Terhubung
                </span>
                <span className="font-semibold text-[#fff8db] truncate max-w-[200px]">
                  {kasus?.nama || "Deteksi Dini Kanker Serviks (IVA)"}
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] border-[#d4af37]/50 text-[#d4af37]">
                5 Pos Soal
              </Badge>
            </div> */}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full mt-2 rounded-xl bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] text-xs font-serif font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:brightness-110 transition-all cursor-pointer border border-[#fff8db]/60 gap-2 active:scale-98"
            >
              {isLoading ? (
                <span>Memverifikasi Tim...</span>
              ) : (
                <>
                  <span>Masuk ke Arena Ujian</span>
                  <ArrowRight className="size-4 stroke-[2.5]" />
                </>
              )}
            </Button>
          </form>

          {/* Form Footer Note */}
          <div className="border-t border-[#8c6d23]/30 pt-3 text-center">
            <p className="text-[11px] text-[#e6d59c]/60">
              Pastikan mikrofon dan audio perangkat Anda telah terhubung dengan baik sebelum memulai stase interaktif.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
