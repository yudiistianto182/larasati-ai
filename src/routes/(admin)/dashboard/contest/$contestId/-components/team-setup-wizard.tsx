import * as React from "react";
import { Plus, Search, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userService, contestTeamService } from "@/services/api";
import type { AdminUserRow } from "../../../system/user/-components/data";
import type { DataContestTeamItem } from "@/types/api";

interface TeamMember {
  user_id: string;
  user_fullname?: string;
  user_email?: string;
}

interface TeamRow {
  team_id: number;
  name: string;
  contest_id: string;
  member: TeamMember[];
  /** Flag: apakah member sudah di-fetch dari API detail */
  memberLoaded?: boolean;
}

interface TeamSetupWizardProps {
  contestId: string;
}

export function TeamSetupWizard({ contestId }: TeamSetupWizardProps) {
  // State for teams associated with this contest
  const [teams, setTeams] = React.useState<TeamRow[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = React.useState(false);
  const hasLoadedRef = React.useRef(false);

  // Users from API
  const [usersList, setUsersList] = React.useState<AdminUserRow[]>([]);

  // Load teams from API on mount
  React.useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    async function loadTeams() {
      setIsLoadingTeams(true);
      try {
        const res = await contestTeamService.getAll(contestId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = Array.isArray(res.data)
          ? res.data
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          : (res.data && typeof res.data === "object" && "data" in res.data && Array.isArray((res.data as any).data))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? (res.data as any).data
          : [];

        setTeams(
          raw.map((t: DataContestTeamItem) => ({
            team_id: t.contestteam_id,
            name: t.contestteam_name,
            contest_id: String(t.contestteam_contest_id),
            member: [],
            memberLoaded: false,
          }))
        );
      } catch (err) {
        console.warn("[TeamSetupWizard] Gagal memuat tim:", err);
      } finally {
        setIsLoadingTeams(false);
      }
    }
    loadTeams();
  }, [contestId]);

  // Load users from API
  React.useEffect(() => {
    async function loadUsers() {
      try {
        const res = await userService.getAll();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = Array.isArray(res.data)
          ? res.data
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          : (res.data && typeof res.data === "object" && "data" in res.data && Array.isArray((res.data as any).data))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? (res.data as any).data
          : [];

        setUsersList(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          raw.map((u: any, idx: number) => ({
            user_id: u.user_id,
            user_name: u.user_name || "",
            user_fullname: u.user_fullname || u.user_name || "-",
            user_email: u.user_email || "-",
            user_role_id: Number(u.user_role_id || u.role_id || 1),
            role_name: u.role_name || u.role?.role_name || "User",
            user_is_banned: u.user_is_banned ?? 0,
            numb: u.numb ?? idx + 1,
          }))
        );
      } catch (err) {
        console.warn("[TeamSetupWizard] Failed to load users:", err);
      }
    }
    loadUsers();
  }, []);

  // Form states
  const [newTeamName, setNewTeamName] = React.useState("");

  // Search state per team map: [teamId]: searchQuery
  const [memberSearch, setMemberSearch] = React.useState<Record<number, string>>({});
  // Dropdown open state per team map: [teamId]: boolean
  const [dropdownOpen, setDropdownOpen] = React.useState<Record<number, boolean>>({});

  // Lazy-load member list via API getDetail when a card is first rendered
  const loadedTeamIds = React.useRef<Set<number>>(new Set());
  const handleLoadTeamMembers = React.useCallback(
    async (teamId: number) => {
      if (loadedTeamIds.current.has(teamId)) return;
      loadedTeamIds.current.add(teamId);

      try {
        const res = await contestTeamService.getDetail(teamId);
        if (res.status && res.data?.member) {
          setTeams((prev) =>
            prev.map((t) =>
              t.team_id === teamId
                ? {
                    ...t,
                    member: res.data.member.map((m) => ({
                      user_id: String(m.user_id),
                      user_fullname: m.user_fullname,
                      user_email: m.user_email,
                    })),
                    memberLoaded: true,
                  }
                : t
            )
          );
        }
      } catch (err) {
        console.warn(`[TeamSetupWizard] Gagal memuat anggota tim ${teamId}:`, err);
      }
    },
    []
  );

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    // Call API to create team
    try {
      await contestTeamService.create({
        name: newTeamName.trim(),
        contest_id: contestId,
        member: [],
      });
    } catch (err) {
      console.warn("[TeamSetupWizard] Gagal membuat tim:", err);
    }

    // Optimistic local update
    const nextId = teams.length > 0 ? Math.max(...teams.map((t) => t.team_id)) + 1 : Date.now();
    const newTeam: TeamRow = {
      team_id: nextId,
      name: newTeamName.trim(),
      contest_id: contestId,
      member: [],
      memberLoaded: true,
    };

    setTeams((prev) => [...prev, newTeam]);
    setNewTeamName("");
  };

  const handleDeleteTeam = async (teamId: number) => {
    try {
      await contestTeamService.destroy(teamId);
    } catch (err) {
      console.warn("[TeamSetupWizard] Gagal menghapus tim:", err);
    }
    setTeams((prev) => prev.filter((t) => t.team_id !== teamId));
  };

  const handleRemoveMember = (teamId: number, userIdStr: string) => {
    setTeams((prev) =>
      prev.map((t) =>
        t.team_id === teamId
          ? { ...t, member: t.member.filter((m) => m.user_id !== userIdStr) }
          : t
      )
    );
  };

  const handleAddMember = (teamId: number, userIdStr: string) => {
    const team = teams.find((t) => t.team_id === teamId);
    if (!team) return;

    const exists = team.member.some((m) => m.user_id === userIdStr);
    if (exists) return;

    const user = usersList.find((u) => String(u.user_id) === userIdStr);

    setTeams((prev) =>
      prev.map((t) =>
        t.team_id === teamId
          ? {
              ...t,
              member: [
                ...t.member,
                {
                  user_id: userIdStr,
                  user_fullname: user?.user_fullname,
                  user_email: user?.user_email,
                },
              ],
            }
          : t
      )
    );

    // Clear search and close dropdown
    setMemberSearch((prev) => ({ ...prev, [teamId]: "" }));
    setDropdownOpen((prev) => ({ ...prev, [teamId]: false }));
  };

  // Get user details helper
  const getUserDetails = (member: TeamMember) => {
    if (member.user_fullname) return { name: member.user_fullname, email: member.user_email || "" };
    const user = usersList.find((u) => String(u.user_id) === member.user_id);
    return user ? { name: user.user_fullname, email: user.user_email } : { name: `User ID: ${member.user_id}`, email: "" };
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Add Team form */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-md font-semibold">Buat Tim Baru</CardTitle>
          <CardDescription>Tambahkan nama tim untuk ditugaskan di lomba ini.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleAddTeam} className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="e.g. Tim Melati - Lomba 1"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={!newTeamName.trim()}>
              <Plus /> Tambah Tim
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Teams Grid */}
      {isLoadingTeams ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={`skel-${i}`}>
              <CardHeader className="pb-2 border-b">
                <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                <div className="h-3 w-24 rounded bg-muted/60 animate-pulse mt-1" />
              </CardHeader>
              <CardContent className="pt-3">
                <div className="h-8 w-full rounded bg-muted animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center">
          <p className="text-sm font-semibold text-foreground">Belum ada tim</p>
          <p className="text-xs text-muted-foreground mt-1">Tambahkan tim baru menggunakan form di atas.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {teams.map((team) => {
            const searchQuery = memberSearch[team.team_id] ?? "";
            const isDropdownOpen = dropdownOpen[team.team_id] ?? false;

            // Trigger lazy member load for teams loaded from API
            if (!team.memberLoaded) {
              handleLoadTeamMembers(team.team_id);
            }

            // Search midwives by name
            const filteredUsers = usersList.filter(
              (u) =>
                u.user_fullname.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !team.member.some((m) => m.user_id === String(u.user_id))
            );

            return (
              <Card key={team.team_id} className="relative flex flex-col">
                <CardHeader className="pb-2 border-b flex flex-row items-start justify-between gap-4">
                  <div className="grid gap-1">
                    <CardTitle className="text-sm font-bold text-foreground leading-snug">
                      {team.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      ID Tim: {team.team_id} • Anggota: {team.member.length}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground hover:text-destructive shrink-0 size-7"
                    onClick={() => handleDeleteTeam(team.team_id)}
                    aria-label="Delete team"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </CardHeader>
                <CardContent className="pt-3 flex flex-col gap-4">
                  {/* Add member search area - placed on top */}
                  <div className="relative flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">Tambah Peserta (Search by Nama)</Label>
                    <div className="relative">
                      <Input
                        placeholder="Ketik nama midwife..."
                        className="h-8 pl-8 text-xs"
                        value={searchQuery}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMemberSearch((prev) => ({ ...prev, [team.team_id]: val }));
                          setDropdownOpen((prev) => ({ ...prev, [team.team_id]: val.trim().length > 0 }));
                        }}
                        onFocus={() => {
                          if (searchQuery.trim().length > 0) {
                            setDropdownOpen((prev) => ({ ...prev, [team.team_id]: true }));
                          }
                        }}
                      />
                      <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
                      {searchQuery && (
                        <button
                          type="button"
                          className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setMemberSearch((prev) => ({ ...prev, [team.team_id]: "" }));
                            setDropdownOpen((prev) => ({ ...prev, [team.team_id]: false }));
                          }}
                        >
                          <X className="size-3" />
                        </button>
                      )}
                    </div>

                    {/* Search results dropdown popup - below input */}
                    {isDropdownOpen && searchQuery.trim().length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-35 max-h-40 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md p-1">
                        {filteredUsers.length === 0 ? (
                          <div className="text-xs text-muted-foreground py-2 px-3 text-center">
                            Tidak menemukan midwife.
                          </div>
                        ) : (
                          filteredUsers.map((user) => (
                            <button
                              key={user.user_id}
                              type="button"
                              className="flex w-full flex-col gap-0.5 rounded-sm px-2.5 py-1.5 text-left text-xs hover:bg-muted/80 transition-colors"
                              onClick={() => handleAddMember(team.team_id, String(user.user_id))}
                            >
                              <span className="font-semibold text-foreground leading-tight">
                                {user.user_fullname}
                              </span>
                              <span className="text-muted-foreground leading-none">
                                {user.user_email}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Members list */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase">Daftar Anggota Tim</Label>
                    {team.member.length === 0 ? (
                      <span className="text-xs text-muted-foreground italic py-1">
                        {team.memberLoaded ? "Belum ada anggota terdaftar." : "Memuat anggota..."}
                      </span>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {team.member.map((m) => {
                          const details = getUserDetails(m);
                          return (
                            <div
                              key={m.user_id}
                              className="flex items-center justify-between rounded-lg border bg-muted/20 px-2.5 py-1.5"
                            >
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="text-sm font-semibold text-foreground truncate leading-tight">
                                  {details.name}
                                </span>
                                <span className="text-xs text-muted-foreground truncate leading-none">
                                  {details.email}
                                </span>
                              </div>
                              <Button
                                size="icon-xs"
                                variant="ghost"
                                className="size-5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full"
                                onClick={() => handleRemoveMember(team.team_id, m.user_id)}
                                aria-label="Remove member"
                              >
                                <X className="size-3" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
