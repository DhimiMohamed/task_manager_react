import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Task } from "@/api/models/task";
import { Category } from "@/api/models/category";
import TaskForm from "./task-form";

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

  if (isEditing) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            taskToEdit={task}
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="text-sm">
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No date"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Time</p>
              <p className="text-sm">
                {task.start_time && task.end_time 
                  ? `${task.start_time} - ${task.end_time}`
                  : "No time"}
              </p>
            </div>
          </div>

          {task.category && (
            <div>
              <p className="text-xs text-muted-foreground">Category</p>
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

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              size="sm"
            >
              Delete
            </Button>
            <Button
              onClick={() => setIsEditing(true)}
              size="sm"
            >
              Edit
            </Button>
          </div>
        </div>

        {/* Delete confirmation dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <p className="text-sm">Are you sure you want to delete this task permanently?</p>
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