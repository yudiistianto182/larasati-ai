import * as React from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Crown,
  KeyRound,
  LayoutDashboard,
  Lock,
  Sparkles,
  Trophy,
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
import { authService } from "@/services/api/auth-service";
import { caseService } from "@/services/api/case-service";
import { trxResponseService } from "@/services/api/trx-response-service";
import { mapApiDetailToKasus } from "@/services/api/case-mapper";
import { setAuthToken, setAuthUser } from "@/lib/api/api-helper";
import { triggerErrorAlert } from "@/stores/error-alert-store";
import type { ContestTeamInfo } from "@/types/api";
import type { Kasus } from "@/routes/(admin)/dashboard/master/kasus/-components/data";
import { playCtaClickSound, playTransitionChime } from "./lomba-sound-effects";

/** Shape yang dikirim ke parent setelah auth berhasil & kasus di-resolve */
export interface LombaAuthResult {
  contestTeamId: number;
  contestTeamName: string;
  contestId: number;
  contestName: string;
  contestDesc: string;
  contestDatestart: string;
  contestDateend: string;
  kasus: Kasus;
  caseId?: number;
  patientId?: number;
  responseId: number;
}

interface LombaAuthScreenProps {
  onLoginSuccess: (result: LombaAuthResult) => void;
}

export function LombaAuthScreen({ onLoginSuccess }: LombaAuthScreenProps) {
  // ── Step 1: Form login ──────────────────────────────────────────────────
  const [username, setUsername] = React.useState<string>("peserta1");
  const [password, setPassword] = React.useState<string>("peserta1");
  const [errorMsg, setErrorMsg] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);

  // ── Step 2: Pilih lomba setelah login berhasil ─────────────────────────
  const [loginStep, setLoginStep] = React.useState<"form" | "select-lomba">("form");
  const [availableTeams, setAvailableTeams] = React.useState<ContestTeamInfo[]>([]);
  const [selectedTeamId, setSelectedTeamId] = React.useState<string>("");

  // ── Step 3: Loading kasus detail ──────────────────────────────────────
  const [isLoadingKasus, setIsLoadingKasus] = React.useState<boolean>(false);

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1: Login → validasi token → filter contest_team is_leader=true
  // ─────────────────────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username.trim()) {
      const msg = "Masukkan username peserta.";
      setErrorMsg(msg);
      triggerErrorAlert("Peringatan Form", msg);
      return;
    }
    if (!password.trim()) {
      const msg = "Masukkan password atau token tim.";
      setErrorMsg(msg);
      triggerErrorAlert("Peringatan Form", msg);
      return;
    }

    playCtaClickSound();
    setIsLoading(true);

    try {
      const res = await authService.login({
        user_name: username.trim(),
        user_password: password.trim(),
      });

      if (!res.status || !res.data?.token?.token) {
        throw new Error(res.message || "Gagal melakukan autentikasi ke server.");
      }

      // Simpan token untuk request berikutnya
      setAuthToken(res.data.token.token);
      if (res.data.user) {
        setAuthUser(res.data.user);
      }

      // Periksa apakah user adalah Admin atau Root
      const userRole = res.data.user?.role_id;
      const roleName = (res.data.user?.role_name || "").toLowerCase();
      const userIsAdmin = userRole === 1 || userRole === 2 || roleName.includes("admin") || roleName.includes("root");
      setIsAdmin(userIsAdmin);

      // Filter hanya team di mana user adalah leader
      const leaderTeams = (res.data.contest_team || []).filter((t) => t.is_leader === true);

      if (leaderTeams.length === 0) {
        if (userIsAdmin) {
          // Jika admin tidak memiliki kelompok lomba, berikan akses langsung ke Dashboard
          setAvailableTeams([]);
          setLoginStep("select-lomba");
          return;
        }
        throw new Error("Akun ini tidak terdaftar sebagai ketua tim di lomba manapun.");
      }

      setAvailableTeams(leaderTeams);
      // Pre-select team pertama
      setSelectedTeamId(String(leaderTeams[0].contestteam_id));
      setLoginStep("select-lomba");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat masuk ke sirkuit.";
      setErrorMsg(msg);
      console.warn("[Auth Error]", msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2: Pilih lomba → tekan Next → fetch detail kasus → callback parent
  // ─────────────────────────────────────────────────────────────────────────
  const handleSelectLomba = async () => {
    if (!selectedTeamId) return;

    const selectedTeam = availableTeams.find((t) => String(t.contestteam_id) === selectedTeamId);
    if (!selectedTeam) return;

    // Validasi lomba masih OPEN berdasarkan tanggal
    const now = new Date();
    const datestart = new Date(selectedTeam.contest.contest_datestart);
    const dateend = new Date(selectedTeam.contest.contest_dateend);
    const isOpen = now >= datestart && now <= dateend;

    if (!isOpen) {
      const msg = `Lomba "${selectedTeam.contest.contest_name}" belum dibuka atau sudah berakhir.`;
      setErrorMsg(msg);
      triggerErrorAlert("Lomba Tidak Aktif", msg);
      return;
    }

    setErrorMsg("");
    setIsLoadingKasus(true);
    playCtaClickSound();

    try {
      // Fetch detail kasus dari case_id yang sudah ada di response login
      const caseId = selectedTeam.case?.case_id;
      if (!caseId) {
        throw new Error("Tidak ada kasus yang ditautkan ke tim ini.");
      }

      const caseRes = await caseService.getDetail(caseId);
      if (!caseRes.status || !caseRes.data) {
        throw new Error(caseRes.message || "Gagal memuat detail kasus.");
      }

      // Map API detail ke model Kasus frontend
      const kasus = mapApiDetailToKasus(caseRes.data);

      // Ambil patient_id dari relasi kasus
      const patientId =
        caseRes.data.patient?.[0]?.casepatient_patient_id ||
        caseRes.data.patient?.[0]?.patient?.patient_id ||
        1;

      // Ambil existing response_id dari server via GET /v1/trx_response (tanpa membuat POST baru)
      let resolvedResponseId = 0;
      try {
        const allTrx = await trxResponseService.getAll(selectedTeam.contest.contest_id);
        const matched = Array.isArray(allTrx.data)
          ? allTrx.data.find(
              (r) => String(r.response_contestteam_id) === String(selectedTeam.contestteam_id),
            )
          : null;
        if (matched?.response_id) {
          resolvedResponseId = Number(matched.response_id);
        }
      } catch (err) {
        console.warn("[Auth Screen] Gagal memuat existing trx_response:", err);
      }

      playTransitionChime();

      onLoginSuccess({
        contestTeamId: selectedTeam.contestteam_id,
        contestTeamName: selectedTeam.contestteam_name,
        contestId: selectedTeam.contest.contest_id,
        contestName: selectedTeam.contest.contest_name,
        contestDesc: selectedTeam.contest.contest_desc ?? "",
        contestDatestart: selectedTeam.contest.contest_datestart,
        contestDateend: selectedTeam.contest.contest_dateend,
        kasus,
        caseId,
        patientId,
        responseId: resolvedResponseId,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memuat kasus.";
      setErrorMsg(msg);
      console.warn("[Kasus Error]", msg);
    } finally {
      setIsLoadingKasus(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 lg:p-10 select-none overflow-hidden">
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

      {/* Top Kemenkes Poltekkes Capsule Badge */}
      <div className="relative z-20 mb-4 flex items-center justify-center">
        <div className="flex items-center justify-center bg-white px-5 py-1.5 rounded-full border-[3px] border-white shadow-[0_0_25px_rgba(255,255,255,0.5)]">
          <img
            src="/images/kemenkes.jpeg"
            alt="Kemenkes Poltekkes Yogyakarta"
            className="h-7 sm:h-8.5 w-auto object-contain"
          />
        </div>
      </div>

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
                {loginStep === "select-lomba" ? (
                  <Trophy className="size-4" />
                ) : (
                  <Lock className="size-4" />
                )}
              </div>
              <h2 className="font-serif font-bold text-lg text-[#fff8db]">
                {loginStep === "select-lomba" ? "Pilih Lomba" : "Autentikasi Tim Peserta"}
              </h2>
            </div>
            <p className="text-xs text-[#e6d59c]/80 leading-relaxed">
              {loginStep === "select-lomba"
                ? "Pilih lomba yang ingin Anda ikuti, lalu tekan Mulai Sirkuit."
                : "Silakan masukkan username dan password Tim Ketua untuk membuka stase ujian sirkuit."}
            </p>
          </div>

          {/* ── STEP 1: FORM LOGIN ────────────────────────────────────────── */}
          {loginStep === "form" && (
            <form onSubmit={handleLoginSubmit} className="my-6 flex flex-col gap-5">
              {/* Error Message */}
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
                  autoComplete="username"
                />
              </div>

              {/* Input Password */}
              <div className="grid gap-2">
                <Label htmlFor="auth-password" className="font-serif text-xs font-semibold text-[#fff8db] flex items-center gap-1.5">
                  <KeyRound className="size-3.5 text-[#d4af37]" />
                  Password <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="auth-password"
                  type="password"
                  placeholder="Masukkan PIN Tim (cth: 1234)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-[#1d140b] border-[#8c6d23]/60 text-xs text-[#fff8db] placeholder:text-[#e6d59c]/40 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                  required
                  autoComplete="current-password"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full mt-2 rounded-xl bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] text-xs font-serif font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:brightness-110 transition-all cursor-pointer border border-[#fff8db]/60 gap-2 active:scale-98"
              >
                {isLoading ? (
                  <span>Memverifikasi Akun...</span>
                ) : (
                  <>
                    <span>Masuk</span>
                    <ArrowRight className="size-4 stroke-[2.5]" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* ── STEP 2: PILIH LOMBA ───────────────────────────────────────── */}
          {loginStep === "select-lomba" && (
            <div className="my-6 flex flex-col gap-5">
              {/* Error Message */}
              {errorMsg && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300 flex items-center gap-2 animate-in fade-in">
                  <span>&bull; {errorMsg}</span>
                </div>
              )}

              {/* Select Lomba */}
              <div className="grid gap-2">
                <Label htmlFor="select-lomba" className="font-serif text-xs font-semibold text-[#fff8db] flex items-center gap-1.5">
                  <Crown className="size-3.5 text-[#d4af37]" />
                  Pilih Lomba <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={selectedTeamId}
                  onValueChange={(val) => val && setSelectedTeamId(val)}
                >
                  <SelectTrigger
                    id="select-lomba"
                    className="w-full h-11 bg-[#1d140b] border-[#8c6d23]/60 text-xs text-[#fff8db] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                  >
                    <SelectValue placeholder="Pilih lomba...">
                      {(() => {
                        const selected = availableTeams.find((t) => String(t.contestteam_id) === selectedTeamId);
                        return selected
                          ? `${selected.contest.contest_name} (${selected.contestteam_name})`
                          : undefined;
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1209] border-[#8c6d23] text-[#fff8db]">
                    <SelectGroup>
                      {availableTeams.map((team) => {
                        const now = new Date();
                        const datestart = new Date(team.contest.contest_datestart);
                        const dateend = new Date(team.contest.contest_dateend);
                        const isOpen = now >= datestart && now <= dateend;

                        return (
                          <SelectItem
                            key={team.contestteam_id}
                            value={String(team.contestteam_id)}
                            label={`${team.contest.contest_name} (${team.contestteam_name})`}
                            className="text-xs focus:bg-[#d4af37]/20 focus:text-[#fff8db] cursor-pointer"
                          >
                            <div className="flex flex-col gap-0.5 py-0.5">
                              <div className="flex items-center gap-1.5">
                                <Crown className="size-3 text-[#d4af37] shrink-0" />
                                <span className="font-semibold truncate">{team.contest.contest_name}</span>
                                {isOpen ? (
                                  <span className="text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full ml-auto shrink-0">
                                    OPEN
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold uppercase bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full ml-auto shrink-0">
                                    CLOSED
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#e6d59c]/60 ml-4.5">{team.contestteam_name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Preview Kasus dari Team yang dipilih */}
              {(() => {
                const team = availableTeams.find((t) => String(t.contestteam_id) === selectedTeamId);
                if (!team) return null;
                return (
                  <div className="rounded-xl border border-[#8c6d23]/40 bg-[#1f150b]/60 p-3 flex flex-col gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[#d4af37] font-semibold font-serif text-[11px] uppercase tracking-wider">
                      <Sparkles className="size-3" />
                      Skenario Kasus Terhubung
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-[#fff8db] leading-snug">
                        {team.case?.case_name || "Kasus belum ditautkan"}
                      </span>
                      {team.case?.case_desc && (
                        <span className="text-[#e6d59c]/70 line-clamp-2 leading-relaxed">
                          {team.case.case_desc}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-[#e6d59c]/60">
                      <CheckCircle2 className="size-3 text-emerald-400" />
                      <span>
                        {team.contest.contest_datestart_text} s/d {team.contest.contest_dateend_text}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Kembali + Mulai */}
              <div className="flex gap-3 mt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setLoginStep("form");
                    setErrorMsg("");
                  }}
                  className="h-11 flex-1 rounded-xl border-[#8c6d23]/60 text-[#e6d59c] bg-transparent hover:bg-[#d4af37]/10 text-xs font-serif"
                >
                  Kembali
                </Button>
                {availableTeams.length > 0 && (
                  <Button
                    type="button"
                    disabled={!selectedTeamId || isLoadingKasus}
                    onClick={handleSelectLomba}
                    className="h-11 flex-[2] rounded-xl bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] text-xs font-serif font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:brightness-110 transition-all cursor-pointer border border-[#fff8db]/60 gap-2 active:scale-98"
                  >
                    {isLoadingKasus ? (
                      <span>Memuat Kasus...</span>
                    ) : (
                      <>
                        <span>Masuk ke Arena Ujian</span>
                        <ArrowRight className="size-4 stroke-[2.5]" />
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Tombol Khusus Admin: Masuk ke Dashboard Admin */}
              {isAdmin && (
                <div className="flex flex-col gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 mt-2 animate-in fade-in">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-amber-300 font-serif font-semibold flex items-center gap-1.5">
                      <LayoutDashboard className="size-3.5 text-[#d4af37]" />
                      Akses Administrator Terdeteksi
                    </span>
                    <Badge className="bg-[#d4af37] text-slate-950 font-bold text-[10px] px-2 py-0">
                      ADMIN
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[#e6d59c]/80 leading-relaxed">
                    Anda memiliki hak akses untuk mengelola master kasus, konfigurasi lomba, dan rekap penilaian.
                  </p>
                  <Button
                    size="sm"
                    className="h-10 w-full mt-1 rounded-lg bg-[#d4af37] hover:bg-[#c49d27] text-slate-950 font-bold text-xs gap-2 shadow-md"
                    nativeButton={false}
                    render={<Link to="/dashboard" />}
                  >
                    <LayoutDashboard className="size-4" />
                    <span>Masuk ke Dashboard Admin &rarr;</span>
                  </Button>
                </div>
              )}
            </div>
          )}

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
