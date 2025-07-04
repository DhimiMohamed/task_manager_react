
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Crown, User, Settings } from "lucide-react"
import { cn } from "@/lib/utils"


import { TeamMembership, TeamMembershipRoleEnum } from "@/api/models/team-membership";
import { useTeamMembers, useUpdateTeamMember, useAddTeamMember } from "@/hooks/useTeams";

interface Member {
  id: string;
  name: string;
  role: "admin" | "member" | "viewer";
  avatar?: string;
  email: string;
  joinedAt: string;
}

interface MembersSectionProps {
  teamId: number;
  teamColor: string;
  projectId: string;
  teamName?: string;
}

// Remove static sampleMembers

const roleColors = {
  admin: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  member: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  viewer: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
}


const roleIcons = {
  admin: Crown,
  member: User,
  viewer: Settings,
};

export default function MembersSection({ teamId, teamColor, teamName }: MembersSectionProps) {
  const { data: teamMembers = [], isLoading } = useTeamMembers(teamId);
  const [isCurrentUserAdmin] = useState(true); // TODO: Replace with real auth context

  // Add member dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<TeamMembershipRoleEnum>(TeamMembershipRoleEnum.Member);
  const [addError, setAddError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const { mutate: addTeamMember } = useAddTeamMember();
  const { mutate: updateTeamMember } = useUpdateTeamMember();

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Map TeamMembership to Member type for UI
  const projectMembers: Member[] = teamMembers.map((member) => ({
    id: member.user_id?.toString() ?? (member.id?.toString() ?? ""),
    name: member.username || member.user_email || "Unknown",
    role: member.role === "admin" ? "admin" : "member", // Only admin/member supported by backend
    avatar: undefined, // Could be added if available
    email: member.email || "",
    joinedAt: member.joined_at || "",
  }));

  const updateMemberRole = (memberId: string, newRole: string) => {
  // Find the membership (not the user)
  const membership = teamMembers.find(
    (m) => m.id?.toString() === memberId || m.user_id?.toString() === memberId
  );
  if (!membership || !membership.id) return;

  // Only send the role field as a plain string
  updateTeamMember(
    {
      teamId,
      id: membership.id,
      role: newRole === "admin" ? "admin" : "member"
    },
    {
      onSuccess: () => console.log("Role updated successfully"),
      onError: (error) => {
        console.error("Update error:", error);
        const errWithResponse = error as { response?: { data?: any } };
        if (errWithResponse.response?.data) {
          alert("Update failed: " + JSON.stringify(errWithResponse.response.data));
        }
      }
    }
  );
};

  // Add member submit handler
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    if (!newMemberEmail) {
      setAddError("Email is required");
      return;
    }
    setIsAdding(true);
    addTeamMember(
      {
        teamId,
        email: newMemberEmail,
        role: newMemberRole,
      } as any,
      {
        onSuccess: () => {
          setAddDialogOpen(false);
          setNewMemberEmail("");
          setNewMemberRole(TeamMembershipRoleEnum.Member);
          setIsAdding(false);
        },
        onError: (err: any) => {
          setAddError(err?.message || "Failed to add member");
          setIsAdding(false);
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", teamColor)}></div>
            Team Members
            {teamName && (
              <span className="ml-2 text-xs text-muted-foreground">({teamName})</span>
            )}
          </CardTitle>
          {isCurrentUserAdmin && (
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                  <Plus className="h-4 w-4" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Team Member</DialogTitle>
                </DialogHeader>
                <form className="p-4 space-y-4" onSubmit={handleAddMember}>
                  <div>
                    <label className="block text-xs mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={newMemberEmail}
                      onChange={e => setNewMemberEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Role</label>
                    <select
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={newMemberRole}
                      onChange={e => setNewMemberRole(e.target.value as TeamMembershipRoleEnum)}
                    >
                      <option value={TeamMembershipRoleEnum.Member}>Member</option>
                      <option value={TeamMembershipRoleEnum.Admin}>Admin</option>
                    </select>
                  </div>
                  {addError && <div className="text-xs text-red-500">{addError}</div>}
                  <div className="flex justify-end">
                    <Button type="submit" size="sm" disabled={isAdding}>
                      {isAdding ? "Adding..." : "Add"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div>Loading members...</div>
          ) : projectMembers.length === 0 ? (
            <div className="text-muted-foreground text-sm">No members found for this team.</div>
          ) : (
            projectMembers.map((member) => {
              const RoleIcon = roleIcons[member.role];
              return (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{member.name}</p>
                        <RoleIcon className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCurrentUserAdmin ? (
                      <Select value={member.role} onValueChange={(value) => updateMemberRole(member.id, value)}>
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">
                            <Badge variant="outline" className={cn("text-xs", roleColors.admin)}>
                              Admin
                            </Badge>
                          </SelectItem>
                          <SelectItem value="member">
                            <Badge variant="outline" className={cn("text-xs", roleColors.member)}>
                              Member
                            </Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className={cn("text-xs", roleColors[member.role])}>
                        {member.role}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
