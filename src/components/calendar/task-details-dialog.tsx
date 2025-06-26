import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Bell, Trash2 } from "lucide-react";
import { Task } from "@/api/models/task";
import { Category } from "@/api/models/category";
import { useRemindersByTask, useDeleteReminder } from "@/hooks/useReminders";
import TaskForm from "./task-form";
import { toast } from "sonner";

interface TaskDetailsDialogProps {
  task: Task;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: (updatedTask: Task) => void;
  onTaskDeleted: (taskId: number) => void;
}

export function TaskDetailsDialog({
  task,
  categories,
  isOpen,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
}: TaskDetailsDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Fetch reminders for this task
  const { data: reminders = [], isLoading: loadingReminders } = useRemindersByTask(task.id!);
  const deleteReminderMutation = useDeleteReminder();

  const handleDeleteReminder = async (reminderId: number) => {
    try {
      await deleteReminderMutation.mutateAsync(reminderId);
      toast.success("Reminder deleted successfully");
    } catch (error) {
      console.error("Error deleting reminder:", error);
      toast.error("Failed to delete reminder");
    }
  };

  const formatReminderTime = (reminderTime: string) => {
    const date = new Date(reminderTime);
    return date.toLocaleString();
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

  const getReminderDisplayText = (reminder: any) => {
  if (!task.due_date || !task.start_time) {
    return formatReminderTime(reminder.reminder_time!);
  }

  const [year, month, day] = task.due_date.split('-').map(Number);
  const [hours, minutes] = task.start_time.split(':').map(Number);

  // Use UTC to avoid local time shift
  const taskTime = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  const reminderTime = new Date(reminder.reminder_time!); // assumed to be in UTC

  const timeDiff = taskTime.getTime() - reminderTime.getTime();
  const diffInMinutes = Math.floor(Math.abs(timeDiff) / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  const isBefore = timeDiff > 0;

  if (isBefore) {
    if (diffInMinutes === 10) return "10 minutes before";
    if (diffInMinutes === 30) return "30 minutes before";
    if (diffInHours === 1) return "1 hour before";
    if (diffInHours === 2) return "2 hours before";
    if (diffInDays === 1) return "1 day before";
  }

  const labelPrefix = isBefore ? "before" : "after";

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ${labelPrefix}`;
  } else if (diffInHours > 0) {
    const remainingMinutes = diffInMinutes % 60;
    if (remainingMinutes === 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ${labelPrefix}`;
    } else {
      return `${diffInHours}h ${remainingMinutes}m ${labelPrefix}`;
    }
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ${labelPrefix}`;
  } else {
    return "At task time";
  }
};

const formatReminderTimeUTC = (reminderTime: string) => {
  const d = new Date(reminderTime);
  return d.toLocaleString('en-GB', {
    timeZone: 'UTC',
    hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
};


  if (isEditing) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            taskToEdit={task}
            existingReminders={reminders}
            categories={categories}
            onSuccess={(updatedTask) => {
              onTaskUpdated(updatedTask);
              setIsEditing(false);
              onClose();
            }}
            onCancel={() => setIsEditing(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Task Information */}
          <div>
            <h3 className="font-medium text-lg">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-2">{task.description}</p>
            )}
          </div>

          {/* Task Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Date</p>
              <p className="text-sm mt-1">
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No date"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Time</p>
              <p className="text-sm mt-1">
                {task.start_time && task.end_time 
                  ? `${task.start_time} - ${task.end_time}`
                  : "No time"}
              </p>
            </div>
          </div>

          {/* Category */}
          {task.category && (
            <div>
              <p className="text-xs text-muted-foreground font-medium">Category</p>
              <div className="flex items-center gap-2 mt-1">
                <span 
                  className="w-3 h-3 rounded-full" 
                  style={{ 
                    backgroundColor: categories.find(c => c.id === task.category)?.color || "#CCCCCC"
                  }}
                />
                <p className="text-sm">
                  {categories.find(c => c.id === task.category)?.name || "Unknown"}
                </p>
              </div>
            </div>
          )}

          {/* Reminders Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground font-medium">Reminders</p>
            </div>

            {loadingReminders ? (
              <div className="text-sm text-muted-foreground py-3">
                Loading reminders...
              </div>
            ) : reminders.length === 0 ? (
              <div className="text-sm text-muted-foreground py-3 text-center border border-dashed rounded-lg">
                No reminders set
              </div>
            ) : (
              <div className="space-y-2">
                {reminders.map((reminder) => {
                  const status = getReminderStatus(reminder);
                  const displayText = getReminderDisplayText(reminder);
                  return (
                    <div
                      key={reminder.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/20"
                    >
                      <div className="flex items-center gap-3">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {displayText}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatReminderTimeUTC(reminder.reminder_time!)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={status.variant} className="text-xs">
                              {status.label}
                            </Badge>
                            {reminder.email_status && (
                              <span className="text-xs text-muted-foreground">
                                Email: {reminder.email_status}
                              </span>
                            )}
                            {reminder.in_app_status && (
                              <span className="text-xs text-muted-foreground">
                                In-app: {reminder.in_app_status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReminder(reminder.id!)}
                        disabled={deleteReminderMutation.isPending}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              size="sm"
            >
              Delete Task
            </Button>
            <Button
              onClick={() => setIsEditing(true)}
              size="sm"
            >
              Edit Task
            </Button>
          </div>
        </div>

        {/* Delete confirmation dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <p className="text-sm">Are you sure you want to delete this task permanently? This will also delete all associated reminders.</p>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onTaskDeleted(task.id!);
                  setShowDeleteConfirm(false);
                  onClose();
                }}
                size="sm"
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}