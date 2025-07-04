"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, parseISO, differenceInDays, addDays } from "date-fns"

interface TimelineTask {
  id: string
  title: string
  startDate: string
  endDate: string
  status: "completed" | "in-progress" | "upcoming"
  assignee: string
  dependencies?: string[]
}

interface ProjectTimelineProps {
  projectId: string
}

const sampleTimelineTasks: TimelineTask[] = [
  {
    id: "1",
    title: "Logo Design Concepts",
    startDate: "2025-03-01T09:00:00",
    endDate: "2025-03-08T17:00:00",
    status: "completed",
    assignee: "Alice Johnson",
  },
  {
    id: "2",
    title: "Color Palette Development",
    startDate: "2025-03-05T09:00:00",
    endDate: "2025-03-12T17:00:00",
    status: "completed",
    assignee: "Bob Smith",
    dependencies: ["1"],
  },
  {
    id: "3",
    title: "Typography Selection",
    startDate: "2025-03-10T09:00:00",
    endDate: "2025-03-17T17:00:00",
    status: "in-progress",
    assignee: "Carol Davis",
    dependencies: ["2"],
  },
  {
    id: "4",
    title: "Social Media Kit",
    startDate: "2025-03-15T09:00:00",
    endDate: "2025-03-25T17:00:00",
    status: "in-progress",
    assignee: "Alice Johnson",
    dependencies: ["1", "2"],
  },
  {
    id: "5",
    title: "Brand Guidelines Document",
    startDate: "2025-03-20T09:00:00",
    endDate: "2025-04-05T17:00:00",
    status: "upcoming",
    assignee: "Bob Smith",
    dependencies: ["3"],
  },
  {
    id: "6",
    title: "Website Mockups",
    startDate: "2025-04-01T09:00:00",
    endDate: "2025-04-15T17:00:00",
    status: "upcoming",
    assignee: "Carol Davis",
    dependencies: ["4", "5"],
  },
]

const statusColors = {
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  upcoming: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
}

export default function ProjectTimeline({  }: ProjectTimelineProps) {
  const projectStart = new Date("2025-03-01")
  const projectEnd = new Date("2025-04-15")
  const totalDays = differenceInDays(projectEnd, projectStart)

  const getTaskPosition = (startDate: string, endDate: string) => {
    const start = parseISO(startDate)
    const end = parseISO(endDate)
    const startOffset = differenceInDays(start, projectStart)
    const duration = differenceInDays(end, start)

    const leftPercent = (startOffset / totalDays) * 100
    const widthPercent = (duration / totalDays) * 100

    return { left: `${leftPercent}%`, width: `${widthPercent}%` }
  }

  const getWeekDates = () => {
    const weeks = []
    let currentDate = projectStart

    while (currentDate <= projectEnd) {
      weeks.push(new Date(currentDate))
      currentDate = addDays(currentDate, 7)
    }

    return weeks
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Project Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Timeline Header */}
          <div className="relative">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>{format(projectStart, "MMM d")}</span>
              <span>{format(projectEnd, "MMM d, yyyy")}</span>
            </div>

            {/* Week markers */}
            <div className="relative h-8 bg-gray-100 dark:bg-gray-800 rounded">
              {getWeekDates().map((date, index) => {
                const position = (differenceInDays(date, projectStart) / totalDays) * 100
                return (
                  <div
                    key={index}
                    className="absolute top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"
                    style={{ left: `${position}%` }}
                  >
                    <div className="absolute top-full mt-1 text-xs text-muted-foreground transform -translate-x-1/2">
                      {format(date, "MMM d")}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Timeline Tasks */}
          <div className="space-y-4">
            {sampleTimelineTasks.map((task) => {
              const position = getTaskPosition(task.startDate, task.endDate)

              return (
                <div key={task.id} className="relative">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-48 flex-shrink-0">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <p className="text-xs text-muted-foreground">{task.assignee}</p>
                    </div>

                    <div className="flex-1 relative h-8">
                      <div
                        className={cn(
                          "absolute top-1 bottom-1 rounded-md flex items-center px-2",
                          task.status === "completed" && "bg-green-200 dark:bg-green-800",
                          task.status === "in-progress" && "bg-blue-200 dark:bg-blue-800",
                          task.status === "upcoming" && "bg-gray-200 dark:bg-gray-700",
                        )}
                        style={position}
                      >
                        <span className="text-xs font-medium truncate">{task.title}</span>
                      </div>
                    </div>

                    <div className="w-24 flex-shrink-0">
                      <Badge variant="outline" className={cn("text-xs", statusColors[task.status])}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="w-48 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {differenceInDays(parseISO(task.endDate), parseISO(task.startDate))} days
                    </div>
                    <div className="flex-1">
                      {format(parseISO(task.startDate), "MMM d")} - {format(parseISO(task.endDate), "MMM d")}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
