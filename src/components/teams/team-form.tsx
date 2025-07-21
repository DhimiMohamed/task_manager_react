// src/components/teams/team-form.tsx
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { Team } from "@/api/models/team"
import { useCreateTeam, useUpdateTeam } from "@/hooks/useTeams"

interface TeamFormProps {
  team?: Team
  onSuccess?: () => void
}

// Predefined color options
const colorOptions = [
  { value: "#3B82F6", label: "Blue" },
  { value: "#10B981", label: "Green" },
  { value: "#EF4444", label: "Red" },
  { value: "#F59E0B", label: "Yellow" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#EC4899", label: "Pink" },
  { value: "#6366F1", label: "Indigo" },
  { value: "#F97316", label: "Orange" },
  { value: "#14B8A6", label: "Teal" },
  { value: "#06B6D4", label: "Cyan" },
]

export default function TeamForm({ team, onSuccess }: TeamFormProps) {
  const [name, setName] = useState(team?.name || "")
  const [color, setColor] = useState(team?.color || colorOptions[0].value)
  const [nameError, setNameError] = useState("")

  const createTeamMutation = useCreateTeam()
  const updateTeamMutation = useUpdateTeam()

  const isEditing = !!team
  const isLoading = createTeamMutation.isPending || updateTeamMutation.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate name
    if (!name.trim()) {
      setNameError("Team name is required")
      return
    }

    try {
      if (isEditing && team?.id) {
        // Update existing team
        await updateTeamMutation.mutateAsync({
          id: team.id,
          name: name.trim(),
          color,
          // Keep existing fields
          owner: team.owner,
          members: team.members,
          invitations: team.invitations,
          member_count: team.member_count,
          project_count: team.project_count,
          pending_invitations_count: team.pending_invitations_count,
          created_at: team.created_at,
          is_admin: team.is_admin,
          created_by: team.created_by,
        })
      } else {
        // Create new team
        await createTeamMutation.mutateAsync({
          name: name.trim(),
          color,
          // Optional fields will be handled by the backend
        })
      }

      // Reset form if creating new team
      if (!isEditing) {
        setName("")
        setColor(colorOptions[0].value)
      }

      // Call success callback
      onSuccess?.()
    } catch (error) {
      console.error("Failed to save team:", error)
      // Handle error (you might want to show a toast notification here)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Team Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setNameError("")
          }}
          placeholder="Enter team name"
          required
          disabled={isLoading}
        />
        {nameError && <p className="text-sm text-red-500">{nameError}</p>}
      </div>

      <div className="space-y-2">
        <Label>Team Color</Label>
        <RadioGroup 
          value={color} 
          onValueChange={setColor} 
          className="grid grid-cols-5 gap-2"
          disabled={isLoading}
        >
          {colorOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
              <Label htmlFor={option.value} className="flex flex-col items-center space-y-2 cursor-pointer">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    color === option.value
                      ? "ring-2 ring-offset-2 ring-primary"
                      : "hover:ring-2 hover:ring-offset-1 hover:ring-primary/50",
                  )}
                  style={{ backgroundColor: option.value }}
                ></div>
                <span className="text-xs">{option.label}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading 
            ? (isEditing ? "Updating..." : "Creating...") 
            : (isEditing ? "Update" : "Create") + " Team"
          }
        </Button>
      </div>

      {/* Error handling */}
      {(createTeamMutation.error || updateTeamMutation.error) && (
        <div className="text-sm text-red-500 mt-2">
          Failed to {isEditing ? "update" : "create"} team. Please try again.
        </div>
      )}
    </form>
  )
}