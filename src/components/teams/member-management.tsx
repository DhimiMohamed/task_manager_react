"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { UserPlus, MoreHorizontal, Crown, Shield, User, Mail, Clock, Trash2, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"
export interface Team {
  id: string
  name: string
  description: string
  color: string
  createdAt: string
  createdBy: string
  memberCount: number
  projectCount: number
  isOwner: boolean
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: "owner" | "admin" | "member"
  avatar?: string
  joinedAt: string
  status: "active" | "pending" | "inactive"
}

export interface TeamInvitation {
  id: string
  email: string
  role: "admin" | "member"
  invitedBy: string
  invitedAt: string
  status: "pending" | "accepted" | "declined"
}

interface MemberManagementProps {
  team: Team
}

// Sample members data
const sampleMembers: TeamMember[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@company.com",
    role: "owner",
    joinedAt: "2025-01-15T09:00:00",
    status: "active",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@company.com",
    role: "admin",
    joinedAt: "2025-01-20T09:00:00",
    status: "active",
  },
  {
    id: "3",
    name: "Carol Davis",
    email: "carol@company.com",
    role: "member",
    joinedAt: "2025-02-01T09:00:00",
    status: "active",
  },
  {
    id: "4",
    name: "David Wilson",
    email: "david@company.com",
    role: "member",
    joinedAt: "2025-02-15T09:00:00",
    status: "active",
  },
]

// Sample invitations data
const sampleInvitations: TeamInvitation[] = [
  {
    id: "1",
    email: "eve@company.com",
    role: "member",
    invitedBy: "Alice Johnson",
    invitedAt: "2025-04-08T10:00:00",
    status: "pending",
  },
  {
    id: "2",
    email: "frank@company.com",
    role: "admin",
    invitedBy: "Alice Johnson",
    invitedAt: "2025-04-07T14:30:00",
    status: "pending",
  },
]

const roleColors = {
  owner: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  admin: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  member: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
}

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: User,
}

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  accepted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  declined: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export default function MemberManagement({ team }: MemberManagementProps) {
  const [members, setMembers] = useState<TeamMember[]>(sampleMembers)
  const [invitations, setInvitations] = useState<TeamInvitation[]>(sampleInvitations)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member")
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null)
  const [currentUserRole] = useState<"owner" | "admin" | "member">("owner") // In a real app, this would come from auth context

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    const newInvitation: TeamInvitation = {
      id: Math.random().toString(36).substring(2, 9),
      email: inviteEmail.trim(),
      role: inviteRole,
      invitedBy: "Current User", // In a real app, this would come from auth context
      invitedAt: new Date().toISOString(),
      status: "pending",
    }

    setInvitations([...invitations, newInvitation])
    setInviteEmail("")
    setInviteRole("member")
  }

  const handleUpdateMemberRole = (memberId: string, newRole: string) => {
    setMembers((prev) => prev.map((member) => (member.id === memberId ? { ...member, role: newRole as any } : member)))
  }

  const handleRemoveMember = () => {
    if (removeMemberId) {
      setMembers(members.filter((member) => member.id !== removeMemberId))
      setRemoveMemberId(null)
    }
  }

  const handleCancelInvitation = (invitationId: string) => {
    setInvitations(invitations.filter((invitation) => invitation.id !== invitationId))
  }

  const canManageMembers = currentUserRole === "owner" || currentUserRole === "admin"
  const canRemoveMembers = currentUserRole === "owner"

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invitations.filter((inv) => inv.status === "pending").length}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.filter((member) => member.role === "owner" || member.role === "admin").length}
            </div>
            <p className="text-xs text-muted-foreground">Team administrators</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
          <TabsTrigger value="invitations">Invitations ({invitations.length})</TabsTrigger>
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
                    />
                    <Select value={inviteRole} onValueChange={(value: "admin" | "member") => setInviteRole(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="submit" size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite
                    </Button>
                  </form>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => {
                    const RoleIcon = roleIcons[member.role]

                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-muted-foreground">{member.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {canManageMembers && member.role !== "owner" ? (
                            <Select
                              value={member.role}
                              onValueChange={(value) => handleUpdateMemberRole(member.id, value)}
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
                            <Badge variant="outline" className={cn("text-xs", roleColors[member.role])}>
                              <RoleIcon className="h-3 w-3 mr-1" />
                              {member.role}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-xs", statusColors[member.status])}>
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(parseISO(member.joinedAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          {canRemoveMembers && member.role !== "owner" && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => setRemoveMemberId(member.id)}
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
            </CardHeader>
            <CardContent>
              {invitations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
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
                        <TableCell>
                          <Badge variant="outline" className={cn("text-xs", roleColors[invitation.role])}>
                            {invitation.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{invitation.invitedBy}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(parseISO(invitation.invitedAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-xs", statusColors[invitation.status])}>
                            <Clock className="h-3 w-3 mr-1" />
                            {invitation.status}
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
                                <DropdownMenuItem>
                                  <Send className="h-4 w-4 mr-2" />
                                  Resend
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => handleCancelInvitation(invitation.id)}
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
            <AlertDialogAction onClick={handleRemoveMember} className="bg-red-600 hover:bg-red-700">
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
