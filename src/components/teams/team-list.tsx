"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTeams } from "@/hooks/useTeams"
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
import { Users, FolderOpen, MoreHorizontal, Settings, Trash2, UserPlus, Crown } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import MemberManagement from "./member-management"

  



export default function TeamList() {
  const { data: teams, isLoading, isError } = useTeams();
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [deleteTeamId, setDeleteTeamId] = useState<number | null>(null);

  // Placeholder for delete handler (should be replaced with mutation)
  const handleDelete = () => {
    // TODO: Call delete mutation here
    setDeleteTeamId(null);
  };

  if (isLoading) {
    return <div>Loading teams...</div>;
  }
  if (isError) {
    return <div>Failed to load teams.</div>;
  }
  if (!teams || teams.length === 0) {
    return <div>No teams found.</div>;
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team: any) => (
          <Card key={team.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{backgroundColor: team?.color}}></div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {team.name}
                      {/* Show crown if user is owner (API may need adjustment) */}
                      {team.is_admin === "true" && <Crown className="h-4 w-4 text-yellow-500" />}
                    </CardTitle>
                    {/* Description may not exist in API */}
                    {/* <p className="text-sm text-muted-foreground line-clamp-2">{team.description}</p> */}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSelectedTeam(team)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Manage Members
                    </DropdownMenuItem>
                    {team.is_admin === "true" && (
                      <>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Team Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => setDeleteTeamId(team.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Team
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{team.member_count ?? 0} members</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <FolderOpen className="h-4 w-4" />
                    <span>{team.project_count ?? 0} projects</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Created {team.created_at ? format(parseISO(team.created_at), "MMM d, yyyy") : "-"} by {team.created_by ?? team.owner ?? "-"}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                  onClick={() => setSelectedTeam(team)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Manage Team
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Member Management Modal */}
      {selectedTeam && (
        <Dialog open={!!selectedTeam} onOpenChange={(open) => !open && setSelectedTeam(null)}>
          <DialogContent className="min-w-5xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: selectedTeam?.color}}></div>
                {selectedTeam.name} - Team Management
              </DialogTitle>
            </DialogHeader>
            <MemberManagement team={selectedTeam} />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTeamId} onOpenChange={(open) => !open && setDeleteTeamId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this team and remove all members. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
  
