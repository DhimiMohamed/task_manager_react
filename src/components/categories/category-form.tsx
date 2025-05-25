"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { Category } from '../../api/models/category';

interface CategoryFormProps {
  category?: Category
  onSubmit: (category: Omit<Category, "id">) => void
  isSubmitting?: boolean
}

const colorOptions = [
  { value: "#3b82f6", label: "Blue" },      // bg-blue-500
  { value: "#10b981", label: "Green" },     // bg-green-500
  { value: "#ef4444", label: "Red" },       // bg-red-500
  { value: "#f59e0b", label: "Yellow" },    // bg-yellow-500
  { value: "#8b5cf6", label: "Purple" },    // bg-purple-500
  { value: "#ec4899", label: "Pink" },      // bg-pink-500
  { value: "#6366f1", label: "Indigo" },    // bg-indigo-500
  { value: "#f97316", label: "Orange" },    // bg-orange-500
  { value: "#14b8a6", label: "Teal" },      // bg-teal-500
  { value: "#06b6d4", label: "Cyan" },      // bg-cyan-500
  { value: "#84cc16", label: "Lime" },      // bg-lime-500
  { value: "#22c55e", label: "Emerald" },    // bg-emerald-500
];

export default function CategoryForm({ category, onSubmit, isSubmitting }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || "")
  const [color, setColor] = useState(category?.color || colorOptions[0].value)
  const [nameError, setNameError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setNameError("Category name is required")
      return
    }

    onSubmit({ name, color })

    if (!category) {
      setName("")
      setColor(colorOptions[0].value)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setNameError("")
          }}
          placeholder="Enter category name"
        />
        {nameError && <p className="text-sm text-red-500">{nameError}</p>}
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <RadioGroup value={color} onValueChange={setColor} className="grid grid-cols-6 gap-2">
          {colorOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
              <Label htmlFor={option.value} className="flex flex-col items-center space-y-2 cursor-pointer">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full border-2",
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : category ? "Update" : "Create"} Category
        </Button>
      </div>
    </form>
  )
}