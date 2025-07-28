// src\components\projects\team-selector.tsx
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Users, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTeams, useTeamMembers } from "@/hooks/useTeams"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TeamMembership } from "@/api/models/team-membership"

export interface TeamMember {
  id: string
  name: string
  email: string
  role: "owner" | "admin" | "member"
  avatar?: string
  skills: string[]
  department: string
  joinedAt: string
  status: "active" | "pending" | "inactive"
}

interface TeamSelectorProps {
  selectedTeam: TeamMember[]
  onTeamChange: (team: TeamMember[], teamId: number | null) => void
  isGenerating?: boolean
}

function transformTeamMembership(member: TeamMembership): TeamMember {
  return {
    id: member.user_id?.toString() || '0',
    name: member.username || 'Unknown',
    email: member.email || member.user_email || '',
    role: member.role === 'admin' ? 'admin' : 'member',
    skills: member.skills ? member.skills.split(',').map(s => s.trim()) : [],
    department: member.team_name || 'General',
    joinedAt: member.joined_at || '',
    status: 'active'
  }
}

export default function TeamSelector({ selectedTeam, onTeamChange, isGenerating }: TeamSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")
  
  // Fetch teams and members
  const { data: teams = [], isLoading: teamsLoading, error: teamsError } = useTeams()
  const { data: teamMembers = [], isLoading: membersLoading, error: membersError } = useTeamMembers(selectedTeamId ? parseInt(selectedTeamId) : 0)

  const filteredMembers = teamMembers
    .map(transformTeamMembership)
    .filter(
      (member) =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())),
    )

  const handleAddMember = (member: TeamMember) => {
    // Clear selected team if trying to add from a different team
    if (selectedTeam.length > 0 && selectedTeam[0].department !== member.department) {
      onTeamChange([member], selectedTeamId ? parseInt(selectedTeamId) : null)
    } else if (!selectedTeam.find((m) => m.id === member.id)) {
      onTeamChange([...selectedTeam, member], selectedTeamId ? parseInt(selectedTeamId) : null)
    }
  }

  const handleRemoveMember = (memberId: string) => {
    const updatedTeam = selectedTeam.filter((m) => m.id !== memberId)
    onTeamChange(updatedTeam, updatedTeam.length > 0 ? (selectedTeamId ? parseInt(selectedTeamId) : null) : null)
  }

  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId)
    // Clear selected members when changing teams
    onTeamChange([], null)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "member":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  // Show loading state
  if (teamsLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading teams...</p>
        </CardContent>
      </Card>
    )
  }

  // Show error state
  if (teamsError) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6 text-center">
          <div className="text-destructive mb-4">
            <X className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Failed to load teams</p>
            <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Team Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select a Team</CardTitle>
          <CardDescription>Choose a team to select members from</CardDescription>
        </CardHeader>
        <CardContent>
          {teams.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No teams available</h3>
              <p className="text-muted-foreground">
                You need to be a member of at least one team to create a project.
              </p>
            </div>
          ) : (
            <Select value={selectedTeamId} onValueChange={handleTeamChange} disabled={isGenerating}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a team..." />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id?.toString() || ''}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {team.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Selected Team */}
      {selectedTeam.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Selected Team ({selectedTeam.length} members)
            </CardTitle>
            <CardDescription>These team members will be included in the AI project proposal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {selectedTeam.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.department}</p>
                      {member.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.skills.slice(0, 2).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {member.skills.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{member.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={isGenerating}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Team Members */}
      {selectedTeamId && (
        <Card>
          <CardHeader>
            <CardTitle>Select Team Members</CardTitle>
            <CardDescription>
              Choose team members who will work on this project
              {membersLoading && " (Loading members...)"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {membersError ? (
              <div className="text-center py-8">
                <div className="text-destructive mb-4">
                  <X className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">Failed to load team members</p>
                  <p className="text-sm text-muted-foreground">Please try selecting a different team</p>
                </div>
              </div>
            ) : membersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading team members...</p>
              </div>
            ) : (
              <>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, department, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    disabled={isGenerating}
                  />
                </div>

                {/* Members List */}
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredMembers.map((member) => {
                    const isSelected = selectedTeam.find((m) => m.id === member.id)

                    return (
                      <div
                        key={member.id}
                        className={cn(
                          "p-4 border rounded-lg transition-all cursor-pointer hover:shadow-md",
                          isSelected ? "border-primary bg-primary/5" : "hover:border-muted-foreground/50",
                        )}
                        onClick={() => (isSelected ? handleRemoveMember(member.id) : handleAddMember(member))}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                              <AvatarFallback>
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium">{member.name}</p>
                                <Badge variant="outline" className={getRoleColor(member.role)}>
                                  {member.role}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{member.email}</p>
                              <div className="flex flex-wrap gap-1">
                                {member.skills.slice(0, 3).map((skill) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {member.skills.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{member.skills.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant={isSelected ? "default" : "outline"}
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            disabled={isGenerating}
                          >
                            {isSelected ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {filteredMembers.length === 0 && teamMembers.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No team members found matching your search.</p>
                  </div>
                )}

                {teamMembers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No members in this team</h3>
                    <p className="text-muted-foreground">
                      This team doesn't have any members yet.
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {selectedTeam.length === 0 && selectedTeamId && !membersLoading && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No team members selected</h3>
            <p className="text-muted-foreground text-center">
              Select team members from the list above to continue with AI project generation.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}