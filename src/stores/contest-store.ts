import { create } from "zustand";
import {
  contestService,
  contestTeamService,
  extractNumericCaseId,
  trxResponseService,
  userService,
} from "@/services/api";

export interface Mahasiswa {
  id: string;
  nama: string;
  nim: string;
}

export interface Penilai {
  id: string;
  nama: string;
  nip: string;
  spesialisasi: string;
  role: string;
}

export interface KelompokLomba {
  id: string;
  nama: string;
  mahasiswa_ids: string[];
  ketua_mhs_id?: string;
  kasus_id?: string;
}

export interface Contest {
  id: string;
  nama: string;
  periode_id: number;
  periode_nama?: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  deskripsi: string;
  kasus_ids: string[];
  kelompok_list: KelompokLomba[];
  allow_shared_kasus: boolean;
  penilai_ids: string[];
  status: "Akan Datang" | "Sedang Berlangsung" | "Selesai";
}

export const INITIAL_MAHASISWA_LIST: Mahasiswa[] = [];

export const INITIAL_PENILAI_LIST: Penilai[] = [];

export const INITIAL_CONTEST_LIST: Contest[] = [];

interface ContestState {
  contests: Contest[];
  mahasiswaList: Mahasiswa[];
  penilaiList: Penilai[];
  isLoadingUsers: boolean;
  fetchUsers: () => Promise<void>;
  getContestDetail: (id: string | number) => Promise<Contest | null>;
  addContest: (contest: Omit<Contest, "id"> & { id?: string }) => string;
  updateContest: (id: string, updated: Partial<Contest>) => void;
  deleteContest: (id: string) => void;
  getContestById: (id: string) => Contest | undefined;
}

let userFetchPromise: Promise<void> | null = null;
let contestDetailPromises: Record<string, Promise<Contest | null> | undefined> = {};

export const useContestStore = create<ContestState>((set, get) => ({
  contests: INITIAL_CONTEST_LIST,
  mahasiswaList: INITIAL_MAHASISWA_LIST,
  penilaiList: INITIAL_PENILAI_LIST,
  isLoadingUsers: false,

  fetchUsers: async () => {
    if (userFetchPromise) return userFetchPromise;
    set({ isLoadingUsers: true });

    userFetchPromise = (async () => {
      try {
        const res = await userService.getAll();
        const rawList: any[] = Array.isArray(res.data)
          ? res.data
          : res.data && typeof res.data === "object" && "data" in res.data && Array.isArray((res.data as any).data)
            ? (res.data as any).data
            : [];

        // 1. Map Mahasiswa / Peserta (user_role_id === 5 atau role_name Peserta)
        const pesertaUsers = rawList.filter(
          (u) => Number(u.user_role_id) === 5 || u.role_name?.toLowerCase().includes("peserta"),
        );
        const effectivePeserta =
          pesertaUsers.length > 0
            ? pesertaUsers
            : rawList.filter((u) => Number(u.user_role_id) !== 4 && Number(u.user_role_id) !== 1);

        const mappedMhs: Mahasiswa[] = effectivePeserta.map((u) => ({
          id: String(u.user_id),
          nama: u.user_fullname || u.user_name || `Mahasiswa ${u.user_id}`,
          nim: u.user_name || String(u.user_id),
        }));

        // 2. Map Penilai / Juri (user_role_id === 4 atau role_name Juri/Penilai)
        const juriUsers = rawList.filter(
          (u) =>
            Number(u.user_role_id) === 4 ||
            u.role_name?.toLowerCase().includes("juri") ||
            u.role_name?.toLowerCase().includes("penilai"),
        );
        const effectiveJuri =
          juriUsers.length > 0 ? juriUsers : rawList.filter((u) => Number(u.user_role_id) !== 5);

        const mappedPenilai: Penilai[] = effectiveJuri.map((u) => ({
          id: String(u.user_id),
          nama: u.user_fullname || u.user_name || `Penilai ${u.user_id}`,
          nip: u.user_name || String(u.user_id),
          spesialisasi: u.role_name || "Penguji OSCE",
          role: u.role_name || "Juri",
        }));

        set({
          mahasiswaList: mappedMhs,
          penilaiList: mappedPenilai,
        });
      } catch (err) {
        console.warn("[ContestStore] Gagal memuat data pengguna:", err);
      } finally {
        set({ isLoadingUsers: false });
        userFetchPromise = null;
      }
    })();

    return userFetchPromise;
  },

  getContestDetail: async (id: string | number) => {
    const cleanId = extractNumericCaseId(id);
    if (!cleanId) return null;

    const pendingPromise = contestDetailPromises[cleanId];
    if (pendingPromise) {
      return pendingPromise;
    }

    contestDetailPromises[cleanId] = (async () => {
      try {
        // 1. Fetch info dasar lomba dari /v1/data_contest/:id
        const contestRes = await contestService.getDetail(cleanId);
        if (!contestRes.status || !contestRes.data) {
          return null;
        }
        const data = contestRes.data as any;

        // 2. Fetch kelompok/tim lomba dari /v1/data_contest_team?contest_id=cleanId
        let mappedKelompok: KelompokLomba[] = [];

        // 2b. Ambil relasi kasus kelompok dari /v1/trx_response?contest_id=cleanId
        const teamCaseMap = new Map<string, string>();
        try {
          const trxRes = await trxResponseService.getAll(cleanId);
          const trxList = Array.isArray(trxRes.data)
            ? trxRes.data
            : (trxRes.data as any)?.data || [];
          for (const item of trxList) {
            const teamId = String(item.response_contestteam_id || (item as any).contestteam_id || "");
            const caseId = String(item.response_case_id || (item as any).case_id || "");
            if (teamId && caseId) {
              teamCaseMap.set(teamId, caseId.startsWith("KSS-") ? caseId : `KSS-${caseId}`);
            }
          }
        } catch (trxErr) {
          console.warn("[ContestStore] Gagal mengambil trx_response:", trxErr);
        }

        try {
          const teamsRes = await contestTeamService.getAll(cleanId);
          const teamItems = Array.isArray(teamsRes.data)
            ? teamsRes.data
            : (teamsRes.data as any)?.data || [];

          if (teamItems.length > 0) {
            const detailedTeams = await Promise.all(
              teamItems.map(async (t: any) => {
                const teamIdStr = String(t.contestteam_id);
                const assignedCaseId =
                  teamCaseMap.get(teamIdStr) ||
                  (t.contestteam_contestcase_id ? String(t.contestteam_contestcase_id) : undefined);

                try {
                  const teamDetailRes = await contestTeamService.getDetail(t.contestteam_id);
                  const tDetail = teamDetailRes.data as any;
                  const members = Array.isArray(tDetail?.member) ? tDetail.member : [];
                  const leaderMember = members.find(
                    (m: any) =>
                      Number(m.contestteammember_is_leader) === 1 ||
                      m.is_leader === "1" ||
                      m.is_leader === 1,
                  );
                  return {
                    id: teamIdStr,
                    nama: t.contestteam_name || `Kelompok ${t.contestteam_id}`,
                    mahasiswa_ids: members.map((m: any) => String(m.user_id || m.contestteammember_user_id)),
                    ketua_mhs_id: leaderMember
                      ? String(leaderMember.user_id || leaderMember.contestteammember_user_id)
                      : undefined,
                    kasus_id: assignedCaseId,
                  };
                } catch {
                  return {
                    id: teamIdStr,
                    nama: t.contestteam_name || `Kelompok ${t.contestteam_id}`,
                    mahasiswa_ids: [],
                    kasus_id: assignedCaseId,
                  };
                }
              }),
            );
            mappedKelompok = detailedTeams;
          }
        } catch (teamErr) {
          console.warn("[ContestStore] Gagal mengambil tim lomba:", teamErr);
        }

        // 3. Ekstraksi kasus_ids
        const rawCases = Array.isArray(data.case)
          ? data.case
          : Array.isArray(data.cases)
            ? data.cases
            : [];
        let mappedKasusIds: string[] = rawCases.map((c: any) => String(c.case_id || c.id || c));
        // Tambahkan kasus dari trx_response kelompok jika belum ada
        for (const cId of teamCaseMap.values()) {
          if (!mappedKasusIds.includes(cId)) {
            mappedKasusIds.push(cId);
          }
        }
        if (mappedKasusIds.length === 0 && mappedKelompok.length > 0) {
          const teamCases = mappedKelompok.map((k) => k.kasus_id).filter(Boolean) as string[];
          mappedKasusIds = Array.from(new Set(teamCases));
        }
        if (mappedKasusIds.length === 0) {
          const cached = get().contests.find((c) => c.id === id || extractNumericCaseId(c.id) === cleanId);
          if (cached?.kasus_ids?.length) {
            mappedKasusIds = cached.kasus_ids;
          }
        }

        // 4. Ekstraksi penilai_ids
        const rawScorers = Array.isArray(data.scorer) ? data.scorer : [];
        const stateUsers = get().penilaiList;
        const penilaiIds: string[] = rawScorers.map((s: any) => {
          if (s.user_id) return String(s.user_id);
          if (s.contestscorer_user_id) return String(s.contestscorer_user_id);
          const matched = stateUsers.find(
            (p) => p.nama.toLowerCase() === s.user_fullname?.toLowerCase(),
          );
          if (matched) return matched.id;
          return String(s.contestscorer_id);
        });

        const assembledContest: Contest = {
          id: String(data.contest_id || cleanId),
          nama: data.contest_name || "",
          periode_id: Number(data.contest_periode_id) || 1,
          periode_nama: `Periode ${data.contest_periode_id || 1}`,
          tanggal_mulai: data.contest_datestart || data.contest_datestart_text || new Date().toISOString(),
          tanggal_selesai: data.contest_dateend || data.contest_dateend_text || new Date().toISOString(),
          deskripsi: data.contest_desc || "",
          kasus_ids: mappedKasusIds,
          kelompok_list:
            mappedKelompok.length > 0
              ? mappedKelompok
              : [{ id: `kel-${Date.now()}-1`, nama: "Kelompok 1", mahasiswa_ids: [] }],
          allow_shared_kasus: false,
          penilai_ids: penilaiIds,
          status: "Sedang Berlangsung",
        };

        set((state) => {
          const exists = state.contests.some((c) => c.id === assembledContest.id);
          return {
            contests: exists
              ? state.contests.map((c) => (c.id === assembledContest.id ? assembledContest : c))
              : [assembledContest, ...state.contests],
          };
        });

        return assembledContest;
      } catch (err) {
        console.warn(`[ContestStore] Gagal mengambil detail lomba ${cleanId}:`, err);
        return get().contests.find((c) => c.id === id || extractNumericCaseId(c.id) === cleanId) || null;
      } finally {
        setTimeout(() => {
          delete contestDetailPromises[cleanId];
        }, 3000);
      }
    })();

    return contestDetailPromises[cleanId];
  },

  addContest: (contest) => {
    const newId = contest.id || `lomba-${String(Date.now()).slice(-4)}`;
    const newContest: Contest = {
      ...contest,
      id: newId,
    };
    set((state) => ({
      contests: [newContest, ...state.contests],
    }));
    return newId;
  },

  updateContest: (id, updated) => {
    set((state) => ({
      contests: state.contests.map((c) => (c.id === id ? { ...c, ...updated } : c)),
    }));
  },

  deleteContest: (id) => {
    set((state) => ({
      contests: state.contests.filter((c) => c.id !== id),
    }));
  },

  getContestById: (id) => {
    return get().contests.find((c) => c.id === id);
  },
}));
