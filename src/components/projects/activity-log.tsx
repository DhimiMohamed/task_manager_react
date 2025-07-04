"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Plus, MessageSquare, Upload, UserPlus, Settings, CheckCircle2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"

interface ActivityItem {
  id: string
  type:
    | "task_moved"
    | "task_created"
    | "comment_added"
    | "file_uploaded"
    | "member_added"
    | "status_changed"
    | "task_completed"
  user: string
  timestamp: string
  details: {
    taskName?: string
    fromStatus?: string
    toStatus?: string
    fileName?: string
    memberName?: string
    comment?: string
    oldStatus?: string
    newStatus?: string
  }
}

interface ActivityLogProps {
  projectId: string
  fullWidth?: boolean
}

const sampleActivities: ActivityItem[] = [
  {
    id: "1",
    type: "task_moved",
    user: "Taylor Wilson",
    timestamp: "2025-04-10T14:30:00",
    details: {
      taskName: "Logo Design",
      fromStatus: "In Progress",
      toStatus: "Done",
    },
  },
  {
    id: "2",
    type: "task_moved",
    user: "Raj Patel",
    timestamp: "2025-04-10T13:45:00",
    details: {
      taskName: "Social Media Kit",
      fromStatus: "To Do",
      toStatus: "In Progress",
    },
  },
  {
    id: "3",
    type: "comment_added",
    user: "Alice Johnson",
    timestamp: "2025-04-10T12:20:00",
    details: {
      taskName: "Color Palette Development",
      comment: "Updated the primary colors based on feedback",
    },
  },
  {
    id: "4",
    type: "file_uploaded",
    user: "Bob Smith",
    timestamp: "2025-04-10T11:15:00",
    details: {
      taskName: "Typography Selection",
      fileName: "font-samples.pdf",
    },
  },
  {
    id: "5",
    type: "task_completed",
    user: "Carol Davis",
    timestamp: "2025-04-10T10:30:00",
    details: {
      taskName: "Brand Guidelines Document",
    },
  },
  {
    id: "6",
    type: "member_added",
    user: "Alice Johnson",
    timestamp: "2025-04-09T16:45:00",
    details: {
      memberName: "David Chen",
    },
  },
  {
    id: "7",
    type: "status_changed",
    user: "Project Manager",
    timestamp: "2025-04-09T09:00:00",
    details: {
      oldStatus: "Planning",
      newStatus: "In Progress",
    },
  },
]

const activityIcons = {
  task_moved: ArrowRight,
  task_created: Plus,
  comment_added: MessageSquare,
  file_uploaded: Upload,
  member_added: UserPlus,
  status_changed: Settings,
  task_completed: CheckCircle2,
}

const activityColors = {
  task_moved: "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
  task_created: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300",
  comment_added: "text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300",
  file_uploaded: "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300",
  member_added: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300",
  status_changed: "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300",
  task_completed: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300",
}

export default function ActivityLog({ fullWidth = false }: ActivityLogProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatActivityMessage = (activity: ActivityItem) => {
    switch (activity.type) {
      case "task_moved":
        return (
          <span>
            moved <strong>{activity.details.taskName}</strong> from{" "}
            <Badge variant="outline" className="mx-1">
              {activity.details.fromStatus}
            </Badge>
            to{" "}
            <Badge variant="outline" className="mx-1">
              {activity.details.toStatus}
            </Badge>
          </span>
        )
      case "task_created":
        return (
          <span>
            created task <strong>{activity.details.taskName}</strong>
          </span>
        )
      case "comment_added":
        return (
          <span>
            commented on <strong>{activity.details.taskName}</strong>
            {activity.details.comment && (
              <div className="mt-1 text-sm text-muted-foreground italic">"{activity.details.comment}"</div>
            )}
          </span>
        )
      case "file_uploaded":
        return (
          <span>
            uploaded <strong>{activity.details.fileName}</strong> to <strong>{activity.details.taskName}</strong>
          </span>
        )
      case "member_added":
        return (
          <span>
            added <strong>{activity.details.memberName}</strong> to the project
          </span>
        )
      case "status_changed":
        return (
          <span>
            changed project status from{" "}
            <Badge variant="outline" className="mx-1">
              {activity.details.oldStatus}
            </Badge>
            to{" "}
            <Badge variant="outline" className="mx-1">
              {activity.details.newStatus}
            </Badge>
          </span>
        )
      case "task_completed":
        return (
          <span>
            completed task <strong>{activity.details.taskName}</strong>
          </span>
        )
      default:
        return <span>performed an action</span>
    }
  }

  return (
    <Card className={cn(fullWidth && "w-full")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {sampleActivities.map((activity) => {
            const ActivityIcon = activityIcons[activity.type]

            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0",
                    activityColors[activity.type],
                  )}
                >
                  <ActivityIcon className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="text-xs">{getInitials(activity.user)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{activity.user}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(activity.timestamp), "MMM d, h:mm a")}
                    </span>
                  </div>

                  <div className="text-sm text-muted-foreground">{formatActivityMessage(activity)}</div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
