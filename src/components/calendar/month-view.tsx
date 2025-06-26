// src/components/calendar/month-view.tsx
import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addDays,
  getDay,
  subDays,
  parseISO,
  isValid,
} from "date-fns";
import { PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import TaskForm from "./task-form";
import { Task } from "@/api/models/task";
import { Category } from "@/api/models/category";
import { TaskDetailsDialog } from "./task-details-dialog";
import { useDeleteTask } from "@/hooks/useTasks";

interface MonthViewProps {
  currentDate: Date;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  selectedCategories: number[];
  tasks: Task[];
  categories: Category[];
  onTaskCreated: (task: Task) => void;
}

interface TaskPillProps {
  task: Task;
  category: Category | undefined;
  onTaskClick: (task: Task) => void;
  onTaskDelete: (taskId: number) => void;
  isDeleting?: boolean;
}

const TaskPill = ({ task, category, onTaskClick, onTaskDelete, isDeleting }: TaskPillProps) => {
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  return (
    <div
      className={cn(
        "text-xs px-2 py-1 rounded truncate text-white relative group cursor-pointer transition-opacity",
        isDeleting && "opacity-50 cursor-not-allowed"
      )}
      style={{ backgroundColor: category?.color || "#CCCCCC" }}
      title={task.title}
      onClick={(e) => {
        e.stopPropagation();
        if (!isDeleting) {
          onTaskClick(task);
        }
      }}
      onMouseEnter={() => !isDeleting && setShowDeleteButton(true)}
      onMouseLeave={() => setShowDeleteButton(false)}
    >
      {formatTaskTime(task.start_time)}
      {task.title}
      
      {showDeleteButton && !isDeleting && (
        <button
          className="absolute top-0 right-0 -mt-1 -mr-1 bg-white/20 rounded-full p-0.5 hover:bg-white/30"
          onClick={(e) => {
            e.stopPropagation();
            onTaskDelete(task.id!);
          }}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

const formatTaskTime = (timeString: string | null | undefined) => {
  if (!timeString) return "";
  try {
    const tempDate = new Date(`2000-01-01T${timeString}`);
    if (isValid(tempDate)) {
      return format(tempDate, "HH:mm") + " ";
    }
  } catch (e) {
    console.error("Error formatting time:", timeString);
  }
  return "";
};

export default function MonthView({
  currentDate,
  selectedDate,
  onDateSelect,
  selectedCategories,
  tasks,
  categories,
  onTaskCreated,
}: MonthViewProps) {
  const [newTaskDate, setNewTaskDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Use the delete mutation hook
  const deleteTaskMutation = useDeleteTask();

  // Debugging useEffect
  useEffect(() => {
    console.log("Tasks in MonthView:", tasks);
  }, [tasks]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDay = getDay(monthStart);
  const daysBeforeMonth = Array.from({ length: startDay }, (_, i) =>
    subDays(monthStart, startDay - i)
  ).reverse();

  const daysAfterMonth = Array.from(
    { length: (7 - ((startDay + monthDays.length) % 7)) % 7 },
    (_, i) => addDays(monthEnd, i + 1)
  );

  const calendarDays = [...daysBeforeMonth, ...monthDays, ...daysAfterMonth];
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const getTasksForDay = (day: Date) => {
    return tasks.filter((task) => {
      // Skip if task has no category or category not selected
      if (!task.category || !selectedCategories.includes(task.category)) {
        return false;
      }
      
      // Skip if no due date
      if (!task.due_date) return false;
      
      try {
        const dueDate = parseISO(task.due_date);
        return isSameDay(dueDate, day);
      } catch (e) {
        console.error("Error parsing due_date:", task.due_date);
        return false;
      }
    });
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsDialogOpen(true);
  };

  const handleTaskDelete = async (taskId: number) => {
    if (confirm("Delete this task permanently?")) {
      try {
        await deleteTaskMutation.mutateAsync(taskId);
        // The mutation will automatically invalidate and refetch the tasks
        // No need to manually call onTaskCreated for deletions
      } catch (error) {
        console.error("Error deleting task:", error);
        // You might want to show a toast notification here
      }
    }
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    onTaskCreated(updatedTask);
  };

  const fullDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const shortDayNames = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="h-full p-4 overflow-y-auto">
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden min-h-[500px]">
        {fullDayNames.map((day, index) => (
          <div
            key={day}
            className="bg-background p-2 text-center text-sm font-medium"
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="inline sm:hidden">{shortDayNames[index]}</span>
          </div>
        ))}

        {weeks.map((week, weekIndex) =>
          week.map((day, dayIndex) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const dayTasks = getTasksForDay(day);

            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={cn(
                  "bg-background min-h-[90px] p-1 relative group flex flex-col",
                  !isCurrentMonth && "opacity-40"
                )}
                onClick={() => onDateSelect(day)}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={cn(
                      "inline-flex items-center justify-center w-4 h-4 text-sm rounded-full",
                      isToday &&
                        "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100",
                      isSelected && !isToday && "bg-gray-100 dark:bg-gray-800"
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewTaskDate(day);
                      setIsDialogOpen(true);
                    }}
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span className="sr-only">Add task</span>
                  </Button>
                </div>

                <div className="mt-0 space-y-1 max-h-[80px] overflow-y-auto">
                  {dayTasks.map((task) => {
                    const category = categories.find((c) => c.id === task.category);
                    const isDeleting = deleteTaskMutation.isPending && 
                      deleteTaskMutation.variables === task.id;
                    
                    return (
                      <TaskPill
                        key={task.id}
                        task={task}
                        category={category}
                        onTaskClick={handleTaskClick}
                        onTaskDelete={handleTaskDelete}
                        isDeleting={isDeleting}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>add new task</DialogDescription>
          </DialogHeader>
          <TaskForm
            initialDate={newTaskDate}
            categories={categories}
            onSuccess={(newTask) => {
              onTaskCreated(newTask);
              setIsDialogOpen(false);
            }}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {selectedTask && (
        <TaskDetailsDialog
          task={selectedTask}
          categories={categories}
          isOpen={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDelete}
        />
      )}
    </div>
  );
}