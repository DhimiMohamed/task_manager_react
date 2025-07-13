"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

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


interface TeamFormProps {
  team?: Team
  onSubmit: (team: Omit<Team, "id" | "createdAt" | "memberCount" | "projectCount" | "isOwner">) => void
}

// Predefined color options
const colorOptions = [
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-green-500", label: "Green" },
  { value: "bg-red-500", label: "Red" },
  { value: "bg-yellow-500", label: "Yellow" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-pink-500", label: "Pink" },
  { value: "bg-indigo-500", label: "Indigo" },
  { value: "bg-orange-500", label: "Orange" },
  { value: "bg-teal-500", label: "Teal" },
  { value: "bg-cyan-500", label: "Cyan" },
]

export default function TeamForm({ team, onSubmit }: TeamFormProps) {
  const [name, setName] = useState(team?.name || "")
  const [description, setDescription] = useState(team?.description || "")
  const [color, setColor] = useState(team?.color || colorOptions[0].value)
  const [nameError, setNameError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate name
    if (!name.trim()) {
      setNameError("Team name is required")
      return
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      color,
      createdBy: "Current User", // In a real app, this would come from auth context
    })

    // Reset form if not editing
    if (!team) {
      setName("")
      setDescription("")
      setColor(colorOptions[0].value)
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
        />
        {nameError && <p className="text-sm text-red-500">{nameError}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your team's purpose and goals"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Team Color</Label>
        <RadioGroup value={color} onValueChange={setColor} className="grid grid-cols-5 gap-2">
          {colorOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
              <Label htmlFor={option.value} className="flex flex-col items-center space-y-2 cursor-pointer">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full border-2",
                    option.value,
                    color === option.value
                      ? "ring-2 ring-offset-2 ring-primary"
                      : "hover:ring-2 hover:ring-offset-1 hover:ring-primary/50",
                  )}
                ></div>
                <span className="text-xs">{option.label}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit">{team ? "Update" : "Create"} Team</Button>
      </div>
    </form>
  )
}
