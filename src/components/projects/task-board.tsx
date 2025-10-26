// src\components\projects\task-board.tsx
import type React from "react"
import { useState } from "react"
import { useTasks, useUpdateTask, useTaskComments, useTaskAttachments } from "@/hooks/useTasks"
import { useTeamMembers } from "@/hooks/useTeams"
// TaskCard component to avoid calling hooks in a loop
import { Eye } from "lucide-react"

function TaskCard({ task, onDragStart, getInitials, getPriorityProps, onView, getAssigneeEmail }: {
  task: any;
  onDragStart: (e: React.DragEvent, taskId: number) => void;
  getInitials: (userId: number | null | undefined) => string;
  getPriorityProps: (priority: number | undefined) => { label: string; color: string };
  onView: (task: any) => void;
  getAssigneeEmail: (userId: number | null | undefined) => string;
}) {
  const { data: comments = [] } = useTaskComments(String(task.id));
  const { data: attachments = [] } = useTaskAttachments(String(task.id));
  return (
    <Card
      key={task.id}
      className="cursor-move hover:shadow-md transition-shadow bg-background"
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onView(task); }}>
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>

          <div className="flex items-center justify-between">
            {(() => {
              const { label, color } = getPriorityProps(task.priority);
              return (
                <Badge variant="outline" className={cn("text-xs", color)}>
                  {label}
                </Badge>
              );
            })()}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {task.due_date ? format(parseISO(task.due_date), "MMM d") : "-"}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="text-xs">{getInitials(task.assigned_to)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate max-w-[130px]">
      {getAssigneeEmail(task.assigned_to)}
    </span>
    </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {comments.length > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {comments.length}
                </div>
              )}
              {attachments.length > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  {attachments.length}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import { useCategories } from "@/hooks/useCategories"
import TaskProjectForm from "./taskProject-form"
import TaskProjectDetails from "./taskProject-details"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Calendar } from "lucide-react"
import { MessageSquare, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"

// Use backend Task type, not local interface

interface TaskBoardProps {
  projectId: string;
  teamId: number;
  fullWidth?: boolean;
}

const columns = [
  { id: "pending", title: "To Do", color: "bg-gray-100 dark:bg-gray-800" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-100 dark:bg-blue-900" },
  { id: "completed", title: "Done", color: "bg-green-100 dark:bg-green-900" },
];

// Map backend priority (number) to color and label
const priorityMap = {
  1: { label: "Low", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
  2: { label: "Medium", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  3: { label: "High", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" }
};

export default function TaskBoard({ projectId, teamId, fullWidth = false }: TaskBoardProps) {
  const { data: tasks = [], isLoading } = useTasks(undefined, { projectId });
  const updateTask = useUpdateTask();
  const [draggedTask, setDraggedTask] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  // Get categories for this project only
  // const { data: allCategories = [] } = useCategories();
  // const categories = allCategories.filter(cat => cat.project === Number(projectId));

  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    setDraggedTask(taskId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    if (draggedTask !== null) {
      const task = tasks.find((t: any) => t.id === draggedTask)
      if (task && task.status !== newStatus) {
        // Only allow valid status values from backend enum
        let backendStatus: any = newStatus;
        if (newStatus === "pending" || newStatus === "in_progress" || newStatus === "completed") {
          backendStatus = newStatus;
        }
        updateTask.mutate({ ...task, status: backendStatus })
      }
      setDraggedTask(null)
    }
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task: { status?: string }) => task.status === status)
  }

  // Get member info by userId (for assignee display)
  // Use the hook directly (must import at top)
  // import { useTeamMembers } from "@/hooks/useTeams"
  // (move import to top)
  const { data: teamMembers = [] } = useTeamMembers(teamId);

  // Helper to get member by userId
  const getMemberById = (userId: number | null | undefined) => {
    if (!userId) return null;
    return teamMembers.find((m: any) => m.user_id === userId || m.id === userId) || null;
  };

  // Get initials from member name/email
  const getInitials = (userId: number | null | undefined) => {
    const member = getMemberById(userId);
    if (!member) return "?";
    const name = member.username || member.user_email || member.email || "?";
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();
  };

  // Get email for assignee
  const getAssigneeEmail = (userId: number | null | undefined) => {
    const member = getMemberById(userId);
    return member?.user_email || member?.email || "-";
  };

  // Helper for priority color/label with type safety
  const getPriorityProps = (priority: number | undefined) => {
    if (!priority) return { label: "-", color: "" };
    return priorityMap[priority as 1 | 2 | 3] || { label: "-", color: "" };
  }

  if (isLoading) {
    return <div>Loading tasks...</div>
  }

  return (
    <Card className={cn(!fullWidth && "lg:col-span-2")}> 
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Task Board</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <TaskProjectForm
                  projectId={Number(projectId)}
                  teamId={teamId}
                  // categories={categories}
                  categories={[]}
                  onSuccess={() => setOpen(false)}
                  onCancel={() => setOpen(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((column) => (
            <div
              key={column.id}
              className={cn("rounded-lg p-4 min-h-[400px]", column.color)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">{column.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {getTasksByStatus(column.id).length}
                </Badge>
              </div>

              <div className="space-y-3">
                {getTasksByStatus(column.id).map((task: any) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDragStart={handleDragStart}
                    getInitials={getInitials}
                    getPriorityProps={getPriorityProps}
                    onView={setSelectedTask}
                    getAssigneeEmail={getAssigneeEmail}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Task Detail Modal */}
        {selectedTask && (
          <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <TaskProjectDetails
                task={selectedTask}
                getInitials={getInitials}
                getAssigneeEmail={getAssigneeEmail}
                getPriorityProps={getPriorityProps}
              />
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}
