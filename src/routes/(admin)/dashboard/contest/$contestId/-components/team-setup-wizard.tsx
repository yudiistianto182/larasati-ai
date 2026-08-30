import * as React from "react";
import { Plus, Search, Trash2, UserPlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fallbackAdminUsers } from "../../../system/user/-components/data";

interface TeamMember {
  user_id: string;
}

interface TeamRow {
  team_id: number;
  name: string;
  contest_id: string;
  member: TeamMember[];
}

interface TeamSetupWizardProps {
  contestId: string;
}

// Fallback dummy teams for demo
const initialTeams: TeamRow[] = [
  {
    team_id: 1,
    name: "Team A - Lomba Konsultasi 1",
    contest_id: "2",
    member: [{ user_id: "1" }],
  },
  {
    team_id: 2,
    name: "Team B - Lomba Konsultasi 1",
    contest_id: "2",
    member: [{ user_id: "2" }],
  },
];

export function TeamSetupWizard({ contestId }: TeamSetupWizardProps) {
  // State for teams associated with this contest
  const [teams, setTeams] = React.useState<TeamRow[]>(() =>
    initialTeams.filter((t) => t.contest_id === contestId)
  );

  // Form states
  const [newTeamName, setNewTeamName] = React.useState("");

  // Search state per team map: [teamId]: searchQuery
  const [memberSearch, setMemberSearch] = React.useState<Record<number, string>>({});
  // Dropdown open state per team map: [teamId]: boolean
  const [dropdownOpen, setDropdownOpen] = React.useState<Record<number, boolean>>({});

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const nextId = teams.length > 0 ? Math.max(...teams.map((t) => t.team_id)) + 1 : 1;
    const newTeam: TeamRow = {
      team_id: nextId,
      name: newTeamName.trim(),
      contest_id: contestId,
      member: [],
    };

    setTeams((prev) => [...prev, newTeam]);
    setNewTeamName("");
  };

  const handleDeleteTeam = (teamId: number) => {
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
    // Check if member already in team
    const team = teams.find((t) => t.team_id === teamId);
    if (!team) return;

    const exists = team.member.some((m) => m.user_id === userIdStr);
    if (exists) return;

    setTeams((prev) =>
      prev.map((t) =>
        t.team_id === teamId
          ? { ...t, member: [...t.member, { user_id: userIdStr }] }
          : t
      )
    );

    // Clear search and close dropdown
    setMemberSearch((prev) => ({ ...prev, [teamId]: "" }));
    setDropdownOpen((prev) => ({ ...prev, [teamId]: false }));
  };

  // Get user details helper
  const getUserDetails = (userIdStr: string) => {
    const user = fallbackAdminUsers.find((u) => String(u.user_id) === userIdStr);
    return user ? { name: user.user_fullname, email: user.user_email } : { name: `User ID: ${userIdStr}`, email: "" };
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
      <div className="grid gap-4 md:grid-cols-2">
        {teams.map((team) => {
          const searchQuery = memberSearch[team.team_id] ?? "";
          const isDropdownOpen = dropdownOpen[team.team_id] ?? false;

          // Search midwives by name
          const filteredUsers = fallbackAdminUsers.filter(
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
                      Belum ada anggota terdaftar.
                    </span>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {team.member.map((m) => {
                        const details = getUserDetails(m.user_id);
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
    </div>
  );
}
