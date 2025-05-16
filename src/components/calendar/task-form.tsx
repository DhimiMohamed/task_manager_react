"use client"
import customAxios from "../../lib/customAxios"
import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { TasksApi } from "@/api/apis/tasks-api"
import { Task, TaskStatusEnum } from "@/api/models/task"
import { Category } from "@/api/models/category"

interface TaskFormProps {
  initialDate?: Date | null
  initialHour?: number
  categories: Category[]
  onSuccess?: (newTask: Task) => void
  onCancel?: () => void
}

export default function TaskForm({ 
  initialDate, 
  initialHour = 9, 
  categories, 
  onSuccess, 
  onCancel 
}: TaskFormProps) {
  const [date, setDate] = useState<Date | undefined>(initialDate || new Date())
  const [startTime, setStartTime] = useState(initialHour ? `${initialHour.toString().padStart(2, "0")}:00` : "09:00")
  const [endTime, setEndTime] = useState(initialHour ? `${(initialHour + 1).toString().padStart(2, "0")}:00` : "10:00")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    categories.length > 0 ? categories[0].id?.toString() || "" : ""
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const toastId = toast.loading("Creating task...")
    
    try {
      const form = e.currentTarget as HTMLFormElement
      const formData = new FormData(form)
      
      const taskData: Task = {
        title: formData.get('title') as string,
        description: formData.get('description') as string || null,
        due_date: date ? format(date, 'yyyy-MM-dd') : null,
        start_time: startTime,
        end_time: endTime,
        status: TaskStatusEnum.Pending,
        priority: 1,
        category: selectedCategoryId ? parseInt(selectedCategoryId) : null,
      }

      const api = new TasksApi(undefined, undefined, customAxios)
      const response = await api.tasksCreate(taskData)
      
      toast.success("Task created successfully", { id: toastId })
      onSuccess?.(response.data)
    } catch (error) {
      console.error("Error creating task:", error)
      toast.error("Failed to create task", { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input 
          id="title" 
          name="title" 
          placeholder="Task title" 
          required 
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          name="description" 
          placeholder="Task description" 
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
                disabled={isSubmitting}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar 
                mode="single" 
                selected={date} 
                onSelect={setDate} 
                initialFocus
                disabled={isSubmitting}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select 
            value={selectedCategoryId} 
            onValueChange={setSelectedCategoryId}
            disabled={isSubmitting || categories.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={categories.length === 0 ? "No categories available" : "Select category"} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem 
                  key={category.id} 
                  value={category.id?.toString() || ""}
                >
                  <div className="flex items-center gap-2">
                    {category.color && (
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                    )}
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time *</Label>
          <Input 
            id="startTime" 
            type="time" 
            value={startTime} 
            onChange={(e) => setStartTime(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">End Time *</Label>
          <Input 
            id="endTime" 
            type="time" 
            value={endTime} 
            onChange={(e) => setEndTime(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !selectedCategoryId}
        >
          {isSubmitting ? "Creating..." : "Create Task"}
        </Button>
      </div>
    </form>
  )
}