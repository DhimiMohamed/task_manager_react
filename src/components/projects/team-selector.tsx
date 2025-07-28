// src\components\projects\team-selector.tsx
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Users, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
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
  onTeamChange: (team: TeamMember[]) => void
  isGenerating?: boolean
}

// Sample team members data
const availableMembers: TeamMember[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@company.com",
    role: "admin",
    avatar: "/placeholder.svg?height=40&width=40",
    skills: ["UI/UX Design", "Figma", "Prototyping"],
    department: "Design",
    status: "active",
    joinedAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@company.com",
    role: "member",
    avatar: "/placeholder.svg?height=40&width=40",
    skills: ["React", "TypeScript", "Node.js"],
    department: "Development",
    status: "active",
    joinedAt: "2024-02-01",
  },
  {
    id: "3",
    name: "Carol Davis",
    email: "carol@company.com",
    role: "member",
    avatar: "/placeholder.svg?height=40&width=40",
    skills: ["Project Management", "Agile", "Scrum"],
    department: "Management",
    status: "active",
    joinedAt: "2024-01-20",
  },
  {
    id: "4",
    name: "David Wilson",
    email: "david@company.com",
    role: "member",
    avatar: "/placeholder.svg?height=40&width=40",
    skills: ["Python", "Django", "PostgreSQL"],
    department: "Development",
    status: "active",
    joinedAt: "2024-03-01",
  },
  {
    id: "5",
    name: "Eve Brown",
    email: "eve@company.com",
    role: "member",
    avatar: "/placeholder.svg?height=40&width=40",
    skills: ["QA Testing", "Automation", "Selenium"],
    department: "Quality Assurance",
    status: "active",
    joinedAt: "2024-02-15",
  },
  {
    id: "6",
    name: "Frank Miller",
    email: "frank@company.com",
    role: "member",
    avatar: "/placeholder.svg?height=40&width=40",
    skills: ["DevOps", "AWS", "Docker"],
    department: "Infrastructure",
    status: "active",
    joinedAt: "2024-01-10",
  },
]

export default function TeamSelector({ selectedTeam, onTeamChange, isGenerating }: TeamSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredMembers = availableMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleAddMember = (member: TeamMember) => {
    if (!selectedTeam.find((m) => m.id === member.id)) {
      onTeamChange([...selectedTeam, member])
    }
  }

  const handleRemoveMember = (memberId: string) => {
    onTeamChange(selectedTeam.filter((m) => m.id !== memberId))
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

  return (
    <div className="space-y-6">
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
      <Card>
        <CardHeader>
          <CardTitle>Select Team Members</CardTitle>
          <CardDescription>Choose team members who will work on this project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, department, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
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
                        <p className="text-sm text-muted-foreground mb-2">{member.department}</p>
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

          {filteredMembers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No team members found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTeam.length === 0 && (
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
