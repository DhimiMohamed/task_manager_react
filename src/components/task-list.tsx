// src\components\task-list.tsx
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Edit, Trash2, Clock, Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useTasks } from "@/hooks/useTasks";
import { useDeleteTask, useUpdateTask } from "@/hooks/useTasks";
import { useRemindersByTask } from "@/hooks/useReminders";
import { Task, TaskStatusEnum } from "@/api/models/task";
import { Category } from "@/api/models/category";

interface TaskListProps {
  filter?: "all" | "today" | "upcoming" | "completed";
  categories: Category[];
}

export default function TaskList({ filter = "all", categories }: TaskListProps) {
  const { data: tasks = [] } = useTasks();
  const deleteTaskMutation = useDeleteTask();
  const updateTaskMutation = useUpdateTask();
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [date, setDate] = useState<Date | undefined>(editingTask?.due_date ? new Date(editingTask.due_date) : undefined);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    editingTask?.category?.toString() || ""
  );
  const [startTime, setStartTime] = useState(editingTask?.start_time || "");
  const [endTime, setEndTime] = useState(editingTask?.end_time || "");

  const toggleTaskCompletion = (task: Task) => {
    updateTaskMutation.mutate({
      ...task,
      status: task.status === TaskStatusEnum.Completed ? TaskStatusEnum.Pending : TaskStatusEnum.Completed
    });
  };

  const deleteTask = (id: number) => {
    deleteTaskMutation.mutate(id);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDate(task.due_date ? new Date(task.due_date) : undefined);
    setSelectedCategoryId(task.category?.toString() || "");
    setStartTime(task.start_time || "");
    setEndTime(task.end_time || "");
  };

  const handleSaveTask = () => {
    if (!editingTask) return;

    const updatedTask = {
      ...editingTask,
      due_date: date?.toISOString(),
      category: selectedCategoryId ? parseInt(selectedCategoryId) : null,
      start_time: startTime,
      end_time: endTime,
    };

    updateTaskMutation.mutate(updatedTask, {
      onSuccess: () => {
        setEditingTask(null);
      }
    });
  };

  const filteredTasks = tasks.filter((task) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const taskDate = task.due_date ? new Date(task.due_date) : null;
    if (!taskDate) return filter === "all";

    taskDate.setHours(0, 0, 0, 0);

    const isToday = taskDate.getTime() === today.getTime();
    const isUpcoming = taskDate.getTime() > today.getTime();
    const isCompleted = task.status === TaskStatusEnum.Completed;

    switch (filter) {
      case "today":
        return isToday;
      case "upcoming":
        return isUpcoming;
      case "completed":
        return isCompleted;
      default:
        return true;
    }
  });

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "No due date";
    
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    const isToday = taskDate.getTime() === today.getTime();
    const isTomorrow = taskDate.getTime() === today.getTime() + 86400000;

    if (isToday) {
      return `Today, ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (isTomorrow) {
      return `Tomorrow, ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return (
        date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }) + `, ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
      );
    }
  };

  const getCategoryById = (id: number | null) => {
    return categories.find(category => category.id === id);
  };

  const getPriorityColor = (priority?: number) => {
    if (!priority) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    if (priority <= 3) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    if (priority <= 6) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  };

  return (
    <div className="space-y-4">
      {filteredTasks.length > 0 ? (
        filteredTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            categories={categories}
            onToggleCompletion={toggleTaskCompletion}
            onEdit={handleEditTask}
            onDelete={deleteTask}
            formatDate={formatDate}
            getCategoryById={getCategoryById}
            getPriorityColor={getPriorityColor}
          />
        ))
      ) : (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">No tasks found.</div>
      )}

      {/* Edit Task Dialog */}
      {editingTask && (
        <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>Make changes to your task here. Click save when you're done.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  defaultValue={editingTask.title} 
                  onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  defaultValue={editingTask.description || ""} 
                  onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
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
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={selectedCategoryId} 
                    onValueChange={setSelectedCategoryId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
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
                  <Label>Start Time</Label>
                  <Input 
                    type="time" 
                    value={startTime} 
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input 
                    type="time" 
                    value={endTime} 
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Input 
                  type="number" 
                  min="1" 
                  max="10" 
                  defaultValue={editingTask.priority || 5}
                  onChange={(e) => setEditingTask({...editingTask, priority: parseInt(e.target.value) || 5})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTask(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTask}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Separate TaskItem component to handle reminders
interface TaskItemProps {
  task: Task;
  categories: Category[];
  onToggleCompletion: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  formatDate: (dateString?: string | null) => string;
  getCategoryById: (id: number | null) => Category | undefined;
  getPriorityColor: (priority?: number) => string;
}

function TaskItem({
  task,
  onToggleCompletion,
  onEdit,
  onDelete,
  formatDate,
  getCategoryById,
  getPriorityColor
}: TaskItemProps) {
  const { data: reminders = [] } = useRemindersByTask(task.id!);
  const category = getCategoryById(task.category ?? null);
  const isCompleted = task.status === TaskStatusEnum.Completed;

  const getReminderDisplayText = (reminder: any) => {
    if (!task.due_date || !task.start_time) {
      return new Date(reminder.reminder_time!).toLocaleString();
    }

    const [year, month, day] = task.due_date.split('-').map(Number);
    const [hours, minutes] = task.start_time.split(':').map(Number);

    const taskTime = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    const reminderTime = new Date(reminder.reminder_time!);

    const timeDiff = taskTime.getTime() - reminderTime.getTime();
    const diffInMinutes = Math.floor(Math.abs(timeDiff) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    const isBefore = timeDiff > 0;

    if (isBefore) {
      if (diffInMinutes === 10) return "10 min before";
      if (diffInMinutes === 30) return "30 min before";
      if (diffInHours === 1) return "1 hour before";
      if (diffInHours === 2) return "2 hours before";
      if (diffInDays === 1) return "1 day before";
    }

    const labelPrefix = isBefore ? "before" : "after";

    if (diffInDays > 0) {
      return `${diffInDays}d ${labelPrefix}`;
    } else if (diffInHours > 0) {
      const remainingMinutes = diffInMinutes % 60;
      if (remainingMinutes === 0) {
        return `${diffInHours}h ${labelPrefix}`;
      } else {
        return `${diffInHours}h ${remainingMinutes}m ${labelPrefix}`;
      }
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes}m ${labelPrefix}`;
    } else {
      return "At task time";
    }
  };

  const getReminderStatus = (reminder: any) => {
    if (reminder.email_status === 'sent' || reminder.in_app_status === 'sent') {
      return { label: 'Sent', variant: 'secondary' as const };
    }
    if (reminder.email_status === 'pending' || reminder.in_app_status === 'pending') {
      return { label: 'Pending', variant: 'default' as const };
    }
    return { label: 'Failed', variant: 'destructive' as const };
  };

  return (
    <div
      className={cn(
        "flex flex-col space-y-2 p-4 rounded-lg border transition-colors",
        isCompleted
          ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
          : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border-gray-200 dark:border-gray-700",
      )}
    >
      <div className="flex items-start space-x-4">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={() => onToggleCompletion(task)}
          className="mt-1"
        />
        <div className="flex-1 space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className={cn("font-medium", isCompleted && "line-through text-gray-500 dark:text-gray-400")}>
              {task.title}
            </p>
            <div className="flex flex-wrap gap-2">
              {category && (
                <Badge variant="outline" style={{ backgroundColor: category.color || undefined }}>
                  {category.name}
                </Badge>
              )}
              {task.priority && (
                <Badge variant="outline" className={cn(getPriorityColor(task.priority))}>
                  Priority: {task.priority}
                </Badge>
              )}
            </div>
          </div>
          {task.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
          )}
          {(task.due_date || task.start_time) && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 pt-1">
              <Clock className="h-4 w-4 mr-1" />
              {formatDate(task.due_date)}
              {task.start_time && ` • ${task.start_time}`}
              {task.end_time && ` - ${task.end_time}`}
            </div>
          )}
          
          {/* Reminders Section */}
          {reminders.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Reminders ({reminders.length})
                </span>
              </div>
              <div className="space-y-1 ml-5">
                {reminders.slice(0, 3).map((reminder) => {
                  const status = getReminderStatus(reminder);
                  const displayText = getReminderDisplayText(reminder);
                  return (
                    <div
                      key={reminder.id}
                      className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
                    >
                      <span>{displayText}</span>
                      <Badge variant={status.variant} className="text-xs px-1 py-0">
                        {status.label}
                      </Badge>
                    </div>
                  );
                })}
                {reminders.length > 3 && (
                  <div className="text-xs text-gray-400 italic">
                    +{reminders.length - 3} more reminder{reminders.length - 3 > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => onEdit(task)}>
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
          onClick={() => task.id && onDelete(task.id)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </div>
  );
}