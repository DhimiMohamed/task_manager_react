"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Switch } from "@/components/ui/switch"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Task } from "@/api/models/task";

interface TaskVerificationModalProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  onSubmit: (task: Task) => void
  isMobile?: boolean
}

export default function TaskVerificationModal({
  task,
  isOpen,
  onClose,
  onSubmit,
  isMobile = false,
}: TaskVerificationModalProps) {
  const [editedTask, setEditedTask] = useState<Task>({
    ...task,
    description: task.description || '',
    due_date: task.due_date || '',
    start_time: task.start_time || '',
    end_time: task.end_time || '',
    status: task.status || 'pending',
    priority: task.priority || 0,
    category: task.category || null,
  })

  const handleSubmit = () => {
    onSubmit(editedTask)
  }

  const updateTask = (updates: Partial<Task>) => {
    setEditedTask((prev) => ({ ...prev, ...updates }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-h-[90vh] overflow-y-auto",
          isMobile ? "w-[95vw] max-w-none m-2 rounded-lg" : "sm:max-w-[500px]",
        )}
      >
        <DialogHeader>
          <DialogTitle className={cn(isMobile ? "text-lg" : "")}>Review & Modify Task</DialogTitle>
          <DialogDescription className={cn(isMobile ? "text-base" : "")}>
            Review the task details and make any necessary changes before submitting.
          </DialogDescription>
        </DialogHeader>

        <div className={cn("grid gap-4 py-4", isMobile && "gap-6")}>
          {/* Task Title */}
          <div className="grid gap-2">
            <Label htmlFor="title" className={cn(isMobile ? "text-base" : "")}>
              Task Title
            </Label>
            <Input
              id="title"
              value={editedTask.title}
              onChange={(e) => updateTask({ title: e.target.value })}
              className={cn(isMobile && "h-12 text-base")}
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description" className={cn(isMobile ? "text-base" : "")}>
              Description
            </Label>
            <Textarea
              id="description"
              value={editedTask.description || ''}
              onChange={(e) => updateTask({ description: e.target.value })}
              rows={isMobile ? 4 : 3}
              className={cn(isMobile && "text-base")}
            />
          </div>

          {/* Due Date */}
          <div className="grid gap-2">
            <Label className={cn(isMobile ? "text-base" : "")}>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !editedTask.due_date && "text-muted-foreground",
                    isMobile && "h-12 text-base",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {editedTask.due_date ? format(new Date(editedTask.due_date), "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={editedTask.due_date ? new Date(editedTask.due_date) : undefined}
                  onSelect={(date) => date && updateTask({ due_date: date.toISOString() })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Range */}
          <div className={cn("grid gap-4", isMobile ? "grid-cols-1 gap-4" : "grid-cols-2")}>
            <div className="grid gap-2">
              <Label htmlFor="startTime" className={cn(isMobile ? "text-base" : "")}>
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={editedTask.start_time || ''}
                onChange={(e) => updateTask({ start_time: e.target.value })}
                className={cn(isMobile && "h-12 text-base")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime" className={cn(isMobile ? "text-base" : "")}>
                End Time
              </Label>
              <Input
                id="endTime"
                type="time"
                value={editedTask.end_time || ''}
                onChange={(e) => updateTask({ end_time: e.target.value })}
                className={cn(isMobile && "h-12 text-base")}
              />
            </div>
          </div>

          {/* Category */}
          <div className="grid gap-2">
            <Label className={cn(isMobile ? "text-base" : "")}>Category</Label>
            <Select 
              value={editedTask.category?.toString() || ''}
              onValueChange={(value) => updateTask({ category: Number(value) || null })}
            >
              <SelectTrigger className={cn(isMobile && "h-12 text-base")}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Work</SelectItem>
                <SelectItem value="2">Personal</SelectItem>
                <SelectItem value="3">Home</SelectItem>
                <SelectItem value="4">Health</SelectItem>
                <SelectItem value="5">Learning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="grid gap-2">
            <Label className={cn(isMobile ? "text-base" : "")}>Priority</Label>
            <Select
              value={editedTask.priority?.toString() || '0'}
              onValueChange={(value) => updateTask({ priority: Number(value) })}
            >
              <SelectTrigger className={cn(isMobile && "h-12 text-base")}>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Low</SelectItem>
                <SelectItem value="2">Medium</SelectItem>
                <SelectItem value="3">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="grid gap-2">
            <Label className={cn(isMobile ? "text-base" : "")}>Status</Label>
            <Select
              value={editedTask.status || 'pending'}
              onValueChange={(value) => updateTask({ status: value as Task['status'] })}
            >
              <SelectTrigger className={cn(isMobile && "h-12 text-base")}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className={cn(isMobile ? "flex-col gap-2" : "")}>
          <Button variant="outline" onClick={onClose} className={cn(isMobile && "w-full h-12")}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className={cn(isMobile && "w-full h-12")}>
            Save Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}