// src\components\projects\project-form.tsx

import type React from "react"
import { useState } from "react"
import { useCreateProject } from "@/hooks/useProjects"
import { useTeams } from "@/hooks/useTeams"
import type { Project } from "@/api/models/project"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"






interface ProjectFormProps {
  onSuccess?: () => void;
}

export default function ProjectForm({ onSuccess }: ProjectFormProps) {
  const { data: teams, isLoading: teamsLoading, isError: teamsError } = useTeams();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    team: "",
    end_date: undefined as Date | undefined,
    members: [] as string[],
  })

  const createProject = useCreateProject();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Map formData to backend Project type (omit id, set required fields)
      const payload: Omit<Project, 'id'> = {
        name: formData.name,
        description: formData.description,
        team: Number(formData.team),
        end_date: formData.end_date ? formData.end_date.toISOString().split('T')[0] : undefined,
      };
      await createProject.mutateAsync(payload);
      if (onSuccess) onSuccess();
    } catch (err) {
      // handle error (show toast, etc.)
    } finally {
      setSubmitting(false);
    }
  }

  // Remove members logic for now (not in backend model)

//   const selectedTeam = teams.find((team) => team.id === formData.team)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Project Name</Label>
          <Input
            id="name"
            placeholder="Enter project name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your project"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="min-h-24"
          />
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Team</Label>
          {teamsLoading ? (
            <div className="text-muted-foreground text-sm">Loading teams...</div>
          ) : teamsError ? (
            <div className="text-destructive text-sm">Failed to load teams</div>
          ) : (
            <Select value={formData.team} onValueChange={(value) => setFormData({ ...formData, team: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {teams && teams.length > 0 ? (
                  teams.map((team) => (
                    <SelectItem key={team.id} value={String(team.id)}>
                      <div className="flex items-center gap-2">
                        {/* Optionally add a color indicator if your team model has a color property */}
                        {/* <div className={cn("w-3 h-3 rounded-full", team.color)}></div> */}
                        {team.name}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1 text-muted-foreground text-sm">No teams found</div>
                )}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <Label>Deadline</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.end_date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.end_date ? format(formData.end_date, "PPP") : "Select deadline"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 pointer-events-auto z-50">
              <Calendar
                mode="single"
                selected={formData.end_date}
                onSelect={(date) => setFormData({ ...formData, end_date: date ?? undefined })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

        {/* Team Members UI removed for now, not in backend model */}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Project"}
        </Button>
      </div>
    </form>
  )
}
