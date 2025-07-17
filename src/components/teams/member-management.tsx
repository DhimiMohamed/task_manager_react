// src/components/teams/member-management.tsx

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { UserPlus, MoreHorizontal, Shield, User, Mail, Clock, Trash2, Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import { toast } from "sonner"

// Import your API hooks
import {
  useTeamMembers,
  useTeamInvitations,
  useUpdateTeamMember,
  useRemoveTeamMember,
  useCreateTeamInvitation,
  useDeleteTeamInvitation,
} from "@/hooks/useTeams"

// Import your API models
import type { Team } from "@/api/models/team"
import type { TeamMembershipRoleEnum } from "@/api/models/team-membership"
import type { TeamInvitation } from "@/api/models/team-invitation"

interface MemberManagementProps {
  team: Team
}

const roleColors = {
  admin: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  member: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
}

const roleIcons = {
  admin: Shield,
  member: User,
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  accepted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export default function MemberManagement({ team }: MemberManagementProps) {
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<TeamMembershipRoleEnum>("member")
  const [removeMemberId, setRemoveMemberId] = useState<number | null>(null)

  // API hooks
  const { data: members = [], isLoading: membersLoading, error: membersError } = useTeamMembers(team.id!)
  const { data: invitations = [], isLoading: invitationsLoading, error: invitationsError } = useTeamInvitations(team.id!)
  
  const updateMemberMutation = useUpdateTeamMember()
  const removeMemberMutation = useRemoveTeamMember()
  const createInvitationMutation = useCreateTeamInvitation()
  const deleteInvitationMutation = useDeleteTeamInvitation()

  // Assume current user is team owner for now - in real app, get from auth context
  const currentUserRole = "admin" // or get from auth context
  const canManageMembers = currentUserRole === "admin"
  const canRemoveMembers = currentUserRole === "admin"

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    try {
      // Since TeamInvitation doesn't have role, we'll create a membership after invitation is accepted
      // For now, just send the invitation with email
      await createInvitationMutation.mutateAsync({
        teamId: team.id!,
        email: inviteEmail.trim(),
        // Remove role from invitation since it's not part of the model
      })
      
      toast.success("Invitation sent successfully")
      setInviteEmail("")
      setInviteRole("member")
    } catch (error) {
      toast.error("Failed to send invitation")
      console.error("Error sending invitation:", error)
    }
  }

  const handleUpdateMemberRole = async (memberId: number, newRole: TeamMembershipRoleEnum) => {
    try {
      await updateMemberMutation.mutateAsync({
        teamId: team.id!,
        id: memberId,
        role: newRole,
      })
      toast.success("Member role updated successfully")
    } catch (error) {
      toast.error("Failed to update member role")
      console.error("Error updating member role:", error)
    }
  }

  const handleRemoveMember = async () => {
    if (!removeMemberId) return

    try {
      await removeMemberMutation.mutateAsync({
        teamId: team.id!,
        id: removeMemberId,
      })
      toast.success("Member removed successfully")
      setRemoveMemberId(null)
    } catch (error) {
      toast.error("Failed to remove member")
      console.error("Error removing member:", error)
    }
  }

  const handleCancelInvitation = async (invitationId: number) => {
    try {
      await deleteInvitationMutation.mutateAsync({
        teamId: team.id!,
        id: invitationId,
      })
      toast.success("Invitation cancelled successfully")
    } catch (error) {
      toast.error("Failed to cancel invitation")
      console.error("Error cancelling invitation:", error)
    }
  }

  const handleResendInvitation = async (invitation: TeamInvitation) => {
    // Since there's no explicit resend API, we'll delete and recreate
    try {
      await deleteInvitationMutation.mutateAsync({
        teamId: team.id!,
        id: invitation.id!,
      })
      
      await createInvitationMutation.mutateAsync({
        teamId: team.id!,
        email: invitation.email!,
        // Remove role since it's not part of TeamInvitation model
      })
      
      toast.success("Invitation resent successfully")
    } catch (error) {
      toast.error("Failed to resend invitation")
      console.error("Error resending invitation:", error)
    }
  }

  const adminCount = members.filter(member => member.role === "admin").length
  const pendingInvitationsCount = invitations.filter(inv => inv.status === "pending").length

  if (membersError || invitationsError) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>Error loading team data. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {membersLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                members.length
              )}
            </div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invitationsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                pendingInvitationsCount
              )}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {membersLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                adminCount
              )}
            </div>
            <p className="text-xs text-muted-foreground">Team administrators</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members">
            Members ({membersLoading ? "..." : members.length})
          </TabsTrigger>
          <TabsTrigger value="invitations">
            Invitations ({invitationsLoading ? "..." : invitations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Team Members</CardTitle>
                {canManageMembers && (
                  <form onSubmit={handleInviteMember} className="flex items-center gap-2">
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-64"
                      required
                      disabled={createInvitationMutation.isPending}
                    />
                    <Select 
                      value={inviteRole} 
                      onValueChange={(value: TeamMembershipRoleEnum) => setInviteRole(value)}
                      disabled={createInvitationMutation.isPending}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      type="submit" 
                      size="sm" 
                      disabled={createInvitationMutation.isPending}
                    >
                      {createInvitationMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      Invite
                    </Button>
                  </form>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {membersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => {
                      const RoleIcon = roleIcons[member.role || "member"]
                      const memberName = member.username || member.email || "Unknown"
                      const memberEmail = member.email || member.user_email || ""

                      return (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {getInitials(memberName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{memberName}</div>
                                <div className="text-sm text-muted-foreground">{memberEmail}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {canManageMembers ? (
                              <Select
                                value={member.role || "member"}
                                onValueChange={(value: TeamMembershipRoleEnum) => 
                                  handleUpdateMemberRole(member.id!, value)
                                }
                                disabled={updateMemberMutation.isPending}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">
                                    <div className="flex items-center gap-2">
                                      <Shield className="h-3 w-3" />
                                      Admin
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="member">
                                    <div className="flex items-center gap-2">
                                      <User className="h-3 w-3" />
                                      Member
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant="outline" className={cn("text-xs", roleColors[member.role || "member"])}>
                                <RoleIcon className="h-3 w-3 mr-1" />
                                {member.role || "member"}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {member.joined_at ? format(parseISO(member.joined_at), "MMM d, yyyy") : "Unknown"}
                          </TableCell>
                          <TableCell>
                            {canRemoveMembers && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onClick={() => setRemoveMemberId(member.id!)}
                                    disabled={removeMemberMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
            </CardHeader>
            <CardContent>
              {invitationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : invitations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Invited By</TableHead>
                      <TableHead>Invited</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {invitation.email}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {invitation.invited_by_email || "Unknown"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {invitation.created_at ? format(parseISO(invitation.created_at), "MMM d, yyyy") : "Unknown"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-xs", statusColors[invitation.status || "pending"])}>
                            <Clock className="h-3 w-3 mr-1" />
                            {invitation.status || "pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {canManageMembers && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleResendInvitation(invitation)}
                                  disabled={deleteInvitationMutation.isPending || createInvitationMutation.isPending}
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Resend
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => handleCancelInvitation(invitation.id!)}
                                  disabled={deleteInvitationMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending invitations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!removeMemberId} onOpenChange={(open) => !open && setRemoveMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from the team? They will lose access to all team projects and
              resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveMember} 
              className="bg-red-600 hover:bg-red-700"
              disabled={removeMemberMutation.isPending}
            >
              {removeMemberMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}