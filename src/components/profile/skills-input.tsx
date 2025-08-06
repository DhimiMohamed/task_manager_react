// src\components\profile\skills-input.tsx
import { useState, type KeyboardEvent } from "react"
import { X, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export type Skill = {
  id: string
  name: string
}

interface SkillsInputProps {
  skills: Skill[]
  onChange: (skills: Skill[]) => void
}

export default function SkillsInput({ skills, onChange }: SkillsInputProps) {
  const [inputValue, setInputValue] = useState("")

  const generateId = () => {
    return Math.random().toString(36).substring(2, 9)
  }

  const addSkill = (skillName: string) => {
    const trimmedSkill = skillName.trim()
    if (!trimmedSkill) return

    // Check if skill already exists
    const exists = skills.some((skill) => skill.name.toLowerCase() === trimmedSkill.toLowerCase())

    if (!exists) {
      const newSkill = { id: generateId(), name: trimmedSkill }
      onChange([...skills, newSkill])
    }

    setInputValue("")
  }

  const removeSkill = (id: string) => {
    onChange(skills.filter((skill) => skill.id !== id))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addSkill(inputValue)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a skill (press Enter or comma to add)"
          className="flex-1"
        />
        <Button type="button" size="icon" onClick={() => addSkill(inputValue)} disabled={!inputValue.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge key={skill.id} variant="secondary" className="px-2 py-1 text-sm">
            {skill.name}
            <button
              type="button"
              onClick={() => removeSkill(skill.id)}
              className="ml-1 text-muted-foreground hover:text-foreground focus:outline-none"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {skill.name}</span>
            </button>
          </Badge>
        ))}

        {skills.length === 0 && (
          <p className="text-sm text-muted-foreground">No skills added yet. Add skills to showcase your expertise.</p>
        )}
      </div>
    </div>
  )
}
