import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useState } from "react";

type Task = {
  id: string;
  title: string;
  dueDate: string;
  category: string;
  completed: boolean;
};

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Complete project proposal",
    dueDate: "Today, 5:00 PM",
    category: "Work",
    completed: false,
  },
  {
    id: "2",
    title: "Schedule dentist appointment",
    dueDate: "Tomorrow, 12:00 PM",
    category: "Personal",
    completed: false,
  },
  {
    id: "3",
    title: "Review quarterly report",
    dueDate: "Today, 3:00 PM",
    category: "Work",
    completed: false,
  },
  {
    id: "4",
    title: "Grocery shopping",
    dueDate: "Tomorrow, 6:00 PM",
    category: "Home",
    completed: false,
  },
  {
    id: "5",
    title: "Team meeting",
    dueDate: "Today, 2:00 PM",
    category: "Work",
    completed: false,
  },
];

const categoryColors: Record<string, string> = {
  Work: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Personal: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  Home: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
};

export default function UpcomingTasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const toggleTaskCompletion = (id: string) => {
    setTasks(tasks.map((task) => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={cn(
            "flex items-start space-x-4 p-3 rounded-lg transition-colors",
            task.completed 
              ? "bg-gray-50 dark:bg-gray-800/50" 
              : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
          )}
        >
          <Checkbox 
            checked={task.completed} 
            onCheckedChange={() => toggleTaskCompletion(task.id)} 
            className="mt-1" 
          />
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className={cn(
                "font-medium", 
                task.completed && "line-through text-gray-500 dark:text-gray-400"
              )}>
                {task.title}
              </p>
              <Badge 
                variant="outline" 
                className={cn("ml-2", categoryColors[task.category])}
              >
                {task.category}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {task.dueDate}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}