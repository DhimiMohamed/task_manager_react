import { useState } from "react";
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
import { PlusCircle } from "lucide-react";
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

interface MonthViewProps {
  currentDate: Date;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  selectedCategories: number[];
  tasks: Task[];
  categories: Category[];
  onTaskCreated: (task: Task) => void;
}

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
      if (!task.category || !selectedCategories.includes(task.category)) {
        return false;
      }
      if (task.due_date) {
        try {
          const dueDate = parseISO(task.due_date);
          return isSameDay(dueDate, day);
        } catch (e) {
          console.error("Error parsing due_date:", task.due_date);
          return false;
        }
      }
      return false;
    });
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
                    const backgroundColor = category?.color || "#CCCCCC";

                    return (
                      <div
                        key={task.id}
                        className="text-xs px-2 py-1 rounded truncate text-white"
                        style={{ backgroundColor }}
                        title={task.title}
                      >
                        {formatTaskTime(task.start_time)}
                        {task.title}
                      </div>
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
    </div>
  );
}
