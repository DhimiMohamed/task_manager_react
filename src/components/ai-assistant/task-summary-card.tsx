"use client"

import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// import { Calendar, Clock, Tag, Bell } from "lucide-react"
import { Calendar, Clock, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import { Task } from "@/api/models/task";

interface TaskSummaryCardProps {
  task: Task
  onAction: (action: string) => void
  isMobile?: boolean
}

type PriorityLevel = 1 | 2 | 3;

const priorityColors: Record<PriorityLevel, string> = {
  1: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  2: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  3: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const priorityLabels: Record<PriorityLevel, string> = {
  1: "Low",
  2: "Medium",
  3: "High"
}

const getPriorityLevel = (priority?: number): PriorityLevel => {
  if (priority === 1 || priority === 2 || priority === 3) {
    return priority;
  }
  return 1; // default to low priority
}

export default function TaskSummaryCard({ task, onAction, isMobile = false }: TaskSummaryCardProps) {
  const priorityLevel = getPriorityLevel(task.priority);

  return (
    <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20">
      <CardContent className={cn(isMobile ? "p-4" : "p-4")}>
        <div className="space-y-3">
          {/* Task Title */}
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn("font-semibold", isMobile ? "text-base" : "text-sm")}>{task.title}</h4>
            <Badge variant="outline" className={cn(priorityColors[priorityLevel], "flex-shrink-0")}>
              {priorityLabels[priorityLevel]}
            </Badge>
          </div>

          {/* Task Details */}
          <div className={cn("space-y-2 text-muted-foreground", isMobile ? "text-sm" : "text-xs")}>
            {task.due_date && (
              <div className="flex items-center space-x-2">
                <Calendar className={cn(isMobile ? "h-4 w-4" : "h-3 w-3")} />
                <span>{format(new Date(task.due_date), "EEEE, MMMM d, yyyy")}</span>
              </div>
            )}

            {(task.start_time || task.end_time) && (
              <div className="flex items-center space-x-2">
                <Clock className={cn(isMobile ? "h-4 w-4" : "h-3 w-3")} />
                <span>
                  {task.start_time || '--:--'} - {task.end_time || '--:--'}
                </span>
              </div>
            )}

            {task.category && (
              <div className="flex items-center space-x-2">
                <Tag className={cn(isMobile ? "h-4 w-4" : "h-3 w-3")} />
                <span>{task.category}</span>
              </div>
            )}
          </div>

          {task.description && (
            <p className={cn("text-muted-foreground", isMobile ? "text-sm" : "text-xs")}>{task.description}</p>
          )}

          {/* Action Buttons */}
          <div className={cn("flex gap-2 pt-2", isMobile ? "flex-col space-y-2" : "flex-wrap")}>
            <div className={cn("flex gap-2", isMobile ? "flex-1" : "")}>
              <Button
                variant="outline"
                size={isMobile ? "default" : "sm"}
                className={cn(isMobile ? "flex-1 h-10" : "h-7 text-xs")}
                onClick={() => onAction("review")}
              >
                Review
              </Button>
              <Button
                variant="outline"
                size={isMobile ? "default" : "sm"}
                className={cn(isMobile ? "flex-1 h-10" : "h-7 text-xs")}
                onClick={() => onAction("modify")}
              >
                Modify
              </Button>
            </div>
            <div className={cn("flex gap-2", isMobile ? "flex-1" : "")}>
              <Button
                size={isMobile ? "default" : "sm"}
                className={cn(isMobile ? "flex-1 h-10" : "h-7 text-xs")}
                onClick={() => onAction("submit")}
              >
                Submit
              </Button>
              <Button
                variant="ghost"
                size={isMobile ? "default" : "sm"}
                className={cn("text-muted-foreground", isMobile ? "flex-1 h-10" : "h-7 text-xs")}
                onClick={() => onAction("cancel")}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}