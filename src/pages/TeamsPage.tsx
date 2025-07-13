"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle, Search, Users, Crown } from "lucide-react"
import TeamForm from "@/components/teams/team-form"
import TeamList from "@/components/teams/team-list"
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

// Sample teams data
const sampleTeams: Team[] = [
  {
    id: "1",
    name: "Design Team",
    description: "Creative design and user experience team",
    color: "bg-purple-500",
    createdAt: "2025-01-15T09:00:00",
    createdBy: "Alice Johnson",
    memberCount: 8,
    projectCount: 12,
    isOwner: true,
  },
  {
    id: "2",
    name: "Development Team",
    description: "Frontend and backend development specialists",
    color: "bg-blue-500",
    createdAt: "2025-02-01T09:00:00",
    createdBy: "Bob Smith",
    memberCount: 15,
    projectCount: 8,
    isOwner: false,
  },
  {
    id: "3",
    name: "Marketing Team",
    description: "Digital marketing and growth team",
    color: "bg-green-500",
    createdAt: "2025-02-10T09:00:00",
    createdBy: "Carol Davis",
    memberCount: 6,
    projectCount: 5,
    isOwner: false,
  },
  {
    id: "4",
    name: "QA Team",
    description: "Quality assurance and testing specialists",
    color: "bg-orange-500",
    createdAt: "2025-03-01T09:00:00",
    createdBy: "David Wilson",
    memberCount: 4,
    projectCount: 3,
    isOwner: true,
  },
]

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>(sampleTeams)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const handleCreateTeam = (teamData: Omit<Team, "id" | "createdAt" | "memberCount" | "projectCount" | "isOwner">) => {
    const newTeam: Team = {
      id: Math.random().toString(36).substring(2, 9),
      ...teamData,
      createdAt: new Date().toISOString(),
      memberCount: 1,
      projectCount: 0,
      isOwner: true,
    }
    setTeams([...teams, newTeam])
    setIsCreateDialogOpen(false)
  }

  const handleDeleteTeam = (teamId: string) => {
    setTeams(teams.filter((team) => team.id !== teamId))
  }

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const ownedTeams = filteredTeams.filter((team) => team.isOwner)
  const memberTeams = filteredTeams.filter((team) => !team.isOwner)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">Create and manage your teams</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
            </DialogHeader>
            <TeamForm onSubmit={handleCreateTeam} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardHeader className="pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Teams Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
            <p className="text-xs text-muted-foreground">
              {ownedTeams.length} owned, {memberTeams.length} member
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.reduce((sum, team) => sum + team.memberCount, 0)}</div>
            <p className="text-xs text-muted-foreground">Across all teams</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.reduce((sum, team) => sum + team.projectCount, 0)}</div>
            <p className="text-xs text-muted-foreground">Team projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Owned Teams */}
      {ownedTeams.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-semibold">Your Teams</h2>
          </div>
          <TeamList teams={ownedTeams} onDelete={handleDeleteTeam} />
        </div>
      )}

      {/* Member Teams */}
      {memberTeams.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-semibold">Member Of</h2>
          </div>
          <TeamList teams={memberTeams} onDelete={handleDeleteTeam} />
        </div>
      )}

      {/* Empty State */}
      {filteredTeams.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">{searchQuery ? "No teams found" : "No teams yet"}</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try adjusting your search terms" : "Create your first team to start collaborating"}
              </p>
              {!searchQuery && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="mt-4">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Team</DialogTitle>
                    </DialogHeader>
                    <TeamForm onSubmit={handleCreateTeam} />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
