// src/components/calendar/week-view.tsx
import React, { useRef, useEffect, useState } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  differenceInMinutes,
  isValid,
  parseISO,
} from "date-fns";
import { PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import TaskForm from "./task-form";
import { Task } from "@/api/models/task";
import { Category } from "@/api/models/category";
import { TaskDetailsDialog } from "./task-details-dialog";
import { useDeleteTask } from "@/hooks/useTasks";

interface WeekViewProps {
  currentDate: Date;
  selectedCategories: number[];
  tasks: Task[];
  categories: Category[];
  onTaskCreated: (task: Task) => void;
}

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

export default function WeekView({
  currentDate,
  selectedCategories,
  tasks,
  categories,
  onTaskCreated,
}: WeekViewProps) {
  const [newTaskInfo, setNewTaskInfo] = useState<{ date: Date; hour: number } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [hoveredTaskId, setHoveredTaskId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const deleteTaskMutation = useDeleteTask();

  useEffect(() => {
    const updateSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const scrollToHour = 8;
      const hourHeight = isMobile ? 40 : 60;
      containerRef.current.scrollTop = scrollToHour * hourHeight;
    }
  }, [isMobile]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const weekTasks = tasks.filter((task) => {
    if (!task.due_date || !task.category || !selectedCategories.includes(task.category)) {
      return false;
    }

    try {
      const taskDate = parseISO(task.due_date);
      return isValid(taskDate) && taskDate >= weekStart && taskDate <= weekEnd;
    } catch (e) {
      console.error("Error parsing task date:", task.due_date);
      return false;
    }
  });

  const getTaskStyle = (task: Task) => {
    if (!task.due_date || !task.start_time || !task.end_time) return null;

    try {
      const dateStr = format(new Date(task.due_date), "yyyy-MM-dd");
      const startTime = new Date(`${dateStr}T${task.start_time}`);
      const endTime = new Date(`${dateStr}T${task.end_time}`);

      if (!isValid(startTime) || !isValid(endTime)) return null;

      const dayIndex = weekDays.findIndex((day) => isSameDay(day, startTime));
      if (dayIndex === -1) return null;

      const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
      const durationMinutes = differenceInMinutes(endTime, startTime);

      return {
        dayIndex,
        startMinutes,
        durationMinutes,
      };
    } catch (e) {
      console.error("Error calculating task position:", e);
      return null;
    }
  };

  const getCategoryColor = (categoryId: number | null) => {
    if (!categoryId) return "#CCCCCC";
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || "#CCCCCC";
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsDialogOpen(true);
  };

  const handleTaskDelete = async (taskId: number) => {
    if (confirm("Delete this task permanently?")) {
      try {
        await deleteTaskMutation.mutateAsync(taskId);
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    onTaskCreated(updatedTask);
  };

  const handleTaskMouseEnter = (taskId: number) => {
    setHoveredTaskId(taskId);
  };

  const handleTaskMouseLeave = () => {
    setHoveredTaskId(null);
  };

  return (
    <div
      className="h-[calc(100dvh-8rem)] overflow-auto lg:h-full touch-pan-y"
      ref={containerRef}
    >
      <div
        className="relative grid min-h-[1440px] lg:min-h-[1440px] bg-white dark:bg-gray-950"
        style={{
          gridTemplateColumns: `${isMobile ? "30px" : "80px"} repeat(7, 1fr)`,
          gridTemplateRows: "auto repeat(96, 1fr)",
        }}
      >
        <div className="sticky top-0 left-0 z-30 h-10 border-b border-r bg-gray-50 dark:bg-gray-900"></div>

        {weekDays.map((day, i) => (
          <div
            key={i}
            className="sticky top-0 z-20 h-10 text-center text-sm font-medium border-b border-r bg-white dark:bg-gray-950 shadow-sm"
            style={{ gridColumn: i + 2 }}
          >
            <div className="hidden lg:block">
              <div className="font-medium">{format(day, "EEE")}</div>
              <div className="text-xs text-muted-foreground">{format(day, "d MMM")}</div>
            </div>
            <div className="lg:hidden flex items-center justify-center h-full font-semibold">
              {format(day, "EEEEE")}
            </div>
          </div>
        ))}

        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <div
              className="sticky left-0 z-10 row-span-4 pr-1 text-[10px] lg:text-xs bg-gray-50/80 dark:bg-gray-900/30 flex items-start justify-end h-full border-b border-r"
              style={{ gridRow: `span 4` }}
            >
              <span className="mt-1 font-medium text-gray-600 dark:text-gray-400">
                {format(new Date().setHours(hour, 0, 0, 0), "HH:mm")}
              </span>
            </div>

            {weekDays.map((day, dayIndex) => (
              <div
                key={`${dayIndex}-${hour}`}
                className={cn(
                  "border-b border-r relative group transition-colors duration-100",
                  hour % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-900/10" : ""
                )}
                style={{
                  gridColumn: dayIndex + 2,
                  gridRow: `span 4`,
                }}
                onClick={() => {
                  setNewTaskInfo({ date: day, hour });
                  setIsDialogOpen(true);
                }}
              >
                <div className="absolute top-1/2 w-full border-t border-gray-200/70 dark:border-gray-800/70"></div>
                <div className="absolute top-1/4 w-full border-t border-gray-200/40 dark:border-gray-800/40"></div>
                <div className="absolute top-3/4 w-full border-t border-gray-200/40 dark:border-gray-800/40"></div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0 h-5 w-5 opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only">Add task</span>
                </Button>
              </div>
            ))}
          </React.Fragment>
        ))}

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            gridColumn: "2 / -1",
            gridRow: "2 / -1",
            margin: "0.25rem",
          }}
        >
          {weekTasks.map((task) => {
            const style = getTaskStyle(task);
            if (!style) return null;

            const backgroundColor = getCategoryColor(task.category);
            const dayWidth = 100 / 7;
            const minuteHeight = 100 / 1440;
            const showDelete = hoveredTaskId === task.id;
            const isDeleting = deleteTaskMutation.isPending && 
              deleteTaskMutation.variables === task.id;

            return (
              <div
                key={task.id}
                className={cn(
                  "absolute rounded-md px-2 py-1 text-xs text-white overflow-hidden cursor-pointer shadow-md hover:ring-2 hover:ring-offset-1 hover:ring-primary transition-all duration-150 pointer-events-auto",
                  isDeleting && "opacity-50 cursor-not-allowed"
                )}
                style={{
                  left: `${style.dayIndex * dayWidth}%`,
                  top: `${style.startMinutes * minuteHeight}%`,
                  height: `${style.durationMinutes * minuteHeight}%`,
                  width: `calc(${dayWidth}% - 0.5rem)`,
                  backgroundColor,
                  zIndex: 10,
                }}
                onClick={() => !isDeleting && handleTaskClick(task)}
                onMouseEnter={() => !isDeleting && handleTaskMouseEnter(task.id!)}
                onMouseLeave={handleTaskMouseLeave}
              >
                <div className="font-medium truncate">
                  {formatTaskTime(task.start_time)}{task.title}
                </div>
                {task.start_time && task.end_time && (
                  <div className="text-white/80 text-[10px] truncate">
                    {formatTaskTime(task.start_time)}- {formatTaskTime(task.end_time)}
                  </div>
                )}
                {showDelete && !isDeleting && (
                  <button
                    className="absolute top-0 right-0 -mt-1 -mr-1 bg-white/20 rounded-full p-0.5 hover:bg-white/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTaskDelete(task.id!);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) setNewTaskInfo(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            initialDate={newTaskInfo?.date}
            initialHour={newTaskInfo?.hour}
            categories={categories}
            onSuccess={(task) => {
              onTaskCreated(task);
              setIsDialogOpen(false);
              setNewTaskInfo(null);
            }}
            onCancel={() => {
              setIsDialogOpen(false);
              setNewTaskInfo(null);
            }}
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