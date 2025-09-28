// src/components/projects/activity-log.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Plus, MessageSquare, Upload, UserPlus, Settings, CheckCircle2, Clock, Trash2, Edit, RefreshCw, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import { useActivityLogs } from "@/hooks/useActivityLogs"
import { ActivityLog as ActivityLogType, ActivityLogActionEnum } from "@/api/models/activity-log"

interface ActivityLogProps {
  projectId: string
  fullWidth?: boolean
}

const activityIcons = {
  [ActivityLogActionEnum.Create]: Plus,
  [ActivityLogActionEnum.Update]: Edit,
  [ActivityLogActionEnum.Delete]: Trash2,
  [ActivityLogActionEnum.Move]: ArrowRight,
  [ActivityLogActionEnum.Comment]: MessageSquare,
  [ActivityLogActionEnum.Complete]: CheckCircle2,
  [ActivityLogActionEnum.Add]: UserPlus,
  [ActivityLogActionEnum.StatusChange]: Settings,
  [ActivityLogActionEnum.FileUpload]: Upload,
  [ActivityLogActionEnum.RecurrenceCreated]: Calendar,
  [ActivityLogActionEnum.RecurrenceTriggered]: RefreshCw,
}

const activityColors = {
  [ActivityLogActionEnum.Create]: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300",
  [ActivityLogActionEnum.Update]: "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
  [ActivityLogActionEnum.Delete]: "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300",
  [ActivityLogActionEnum.Move]: "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
  [ActivityLogActionEnum.Comment]: "text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300",
  [ActivityLogActionEnum.Complete]: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300",
  [ActivityLogActionEnum.Add]: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300",
  [ActivityLogActionEnum.StatusChange]: "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300",
  [ActivityLogActionEnum.FileUpload]: "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300",
  [ActivityLogActionEnum.RecurrenceCreated]: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900 dark:text-cyan-300",
  [ActivityLogActionEnum.RecurrenceTriggered]: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300",
}

export default function ActivityLog({ projectId, fullWidth = false }: ActivityLogProps) {
  const { data: activities, isLoading, error } = useActivityLogs(projectId)

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatActivityMessage = (activity: ActivityLogType) => {
    const contentObject = activity.content_object || "item"
    const action = activity.action

    // Debug logging for comment activities
    if (action === ActivityLogActionEnum.Comment) {
      console.log('Comment activity data:', {
        id: activity.id,
        comment_text: activity.comment_text,
        content_object: activity.content_object,
        full_activity: activity
      })
    }

    switch (action) {
      case ActivityLogActionEnum.Create:
        return (
          <span>
            created <strong>{contentObject}</strong>
          </span>
        )
      
      case ActivityLogActionEnum.Update:
        return (
          <span>
            updated <strong>{contentObject}</strong>
          </span>
        )
      
      case ActivityLogActionEnum.Delete:
        return (
          <span>
            deleted <strong>{contentObject}</strong>
          </span>
        )
      
      case ActivityLogActionEnum.Move:
        return (
          <span>
            moved <strong>{contentObject}</strong>
            {activity.from_state && activity.to_state && (
              <>
                {" "}from{" "}
                <Badge variant="outline" className="mx-1">
                  {activity.from_state}
                </Badge>
                to{" "}
                <Badge variant="outline" className="mx-1">
                  {activity.to_state}
                </Badge>
              </>
            )}
          </span>
        )
      
      case ActivityLogActionEnum.Comment:
        return (
          <div>
            <span>
              commented on <strong>{contentObject}</strong>
            </span>
            {/* Enhanced comment text handling with multiple fallbacks */}
            {(activity.comment_text && activity.comment_text.trim() !== '') ? (
              <div className="mt-2 p-2 bg-muted/50 rounded border-l-2 border-purple-200 dark:border-purple-700">
                <div className="text-sm text-foreground">
                  "{activity.comment_text}"
                </div>
              </div>
            ) : (
              <div className="mt-1 text-xs text-muted-foreground italic">
                [Comment content not available]
              </div>
            )}
          </div>
        )
      
      case ActivityLogActionEnum.Complete:
        return (
          <span>
            completed <strong>{contentObject}</strong>
          </span>
        )
      
      case ActivityLogActionEnum.Add:
        return (
          <span>
            added <strong>{contentObject}</strong> to the project
          </span>
        )
      
      case ActivityLogActionEnum.StatusChange:
        return (
          <span>
            changed status
            {activity.from_state && activity.to_state ? (
              <>
                {" "}from{" "}
                <Badge variant="outline" className="mx-1">
                  {activity.from_state}
                </Badge>
                to{" "}
                <Badge variant="outline" className="mx-1">
                  {activity.to_state}
                </Badge>
              </>
            ) : (
              <>
                {" "}of <strong>{contentObject}</strong>
              </>
            )}
          </span>
        )
      
      case ActivityLogActionEnum.FileUpload:
        return (
          <span>
            uploaded file
            {activity.attachment_info && typeof activity.attachment_info === 'object' && 'filename' in activity.attachment_info && (
              <>
                {" "}<strong>{String(activity.attachment_info.filename)}</strong>
              </>
            )}
            {contentObject && (
              <>
                {" "}to <strong>{contentObject}</strong>
              </>
            )}
          </span>
        )
      
      case ActivityLogActionEnum.RecurrenceCreated:
        return (
          <span>
            created recurring schedule for <strong>{contentObject}</strong>
          </span>
        )
      
      case ActivityLogActionEnum.RecurrenceTriggered:
        return (
          <span>
            triggered recurring task <strong>{contentObject}</strong>
          </span>
        )
      
      default:
        return (
          <span>
            performed action on <strong>{contentObject}</strong>
          </span>
        )
    }
  }

  if (isLoading) {
    return (
      <Card className={cn(fullWidth && "w-full")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading activity...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn(fullWidth && "w-full")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Failed to load activity log</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const activityList = activities?.data || []

  return (
    <Card className={cn(fullWidth && "w-full")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activityList.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">No activity yet</div>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activityList.map((activity) => {
              const ActivityIcon = activityIcons[activity.action!] || Settings
              const iconColor = activityColors[activity.action!] || activityColors[ActivityLogActionEnum.Update]

              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0",
                      iconColor,
                    )}
                  >
                    <ActivityIcon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="text-xs">
                          {getInitials(activity.user || "Unknown")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{activity.user || "Unknown User"}</span>
                      <span className="text-xs text-muted-foreground">
                        {activity.timestamp 
                          ? format(parseISO(activity.timestamp), "MMM d, h:mm a")
                          : "Unknown time"
                        }
                      </span>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {formatActivityMessage(activity)}
                    </div>

                    {/* Debug info for development - remove in production */}
                    {/* {process.env.NODE_ENV === 'development' && activity.action === ActivityLogActionEnum.Comment && (
                      <details className="mt-2 text-xs text-muted-foreground">
                        <summary className="cursor-pointer">Debug Info</summary>
                        <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                          {JSON.stringify(activity, null, 2)}
                        </pre>
                      </details>
                    )} */}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}