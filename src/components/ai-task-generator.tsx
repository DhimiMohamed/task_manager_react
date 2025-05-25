import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";
import { TasksApi } from "@/api/apis/tasks-api";
import { TasksExtractTaskDetailsCreateRequest } from "@/api/models/tasks-extract-task-details-create-request";
import { Task } from "@/api/models/task";
import customAxios from "@/lib/customAxios";

type GeneratedTask = {
  title: string;
  description: string;
  dueDate: string;
  startTime?: string;
  endTime?: string;
  category: string;
  priority: "low" | "medium" | "high";
};

export default function AITaskGenerator() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const { data: categories } = useCategories();

  const staticTasks: GeneratedTask[] = [
    {
      title: "Research project requirements",
      description: "Gather information about the project scope and requirements",
      dueDate: "2025-04-15T14:00:00",
      startTime: "2025-04-15T09:00:00",
      endTime: "2025-04-15T11:00:00",
      category: "Work",
      priority: "high",
    },
    {
      title: "Create project timeline",
      description: "Develop a detailed timeline for project milestones",
      dueDate: "2025-04-16T17:00:00",
      startTime: "2025-04-16T13:00:00",
      endTime: "2025-04-16T15:00:00",
      category: "Work",
      priority: "medium",
    },
    {
      title: "Schedule team kickoff meeting",
      description: "Coordinate with team members for initial project discussion",
      dueDate: "2025-04-14T10:00:00",
      startTime: "2025-04-14T09:30:00",
      endTime: "2025-04-14T10:30:00",
      category: "Work",
      priority: "medium",
    },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    try {
      const tasksApi = new TasksApi(undefined, undefined, customAxios);
      const request: TasksExtractTaskDetailsCreateRequest = {
        description: prompt
      };

      const response = await tasksApi.tasksExtractTaskDetailsCreate(request);
      
      if (response.data) {
        const backendTask = response.data;
        
        const getPriorityString = (priorityNum: string): "low" | "medium" | "high" => {
          switch(priorityNum) {
            case "1": return "low";
            case "2": return "medium";
            case "3": return "high";
            default: return "medium";
          }
        };

        const formattedTask: GeneratedTask = {
          title: backendTask.title || "Generated Task",
          description: prompt,
          dueDate: backendTask.due_date || new Date(Date.now() + 86400000).toISOString(),
          startTime: backendTask.start_time,
          endTime: backendTask.end_time,
          category: backendTask.category || "Work",
          priority: backendTask.priority ? getPriorityString(backendTask.priority) : "medium"
        };
        
        setGeneratedTasks([formattedTask, ...staticTasks]);
      } else {
        setGeneratedTasks(staticTasks);
      }
    } catch (error) {
      console.error("Failed to generate tasks:", error);
      setGeneratedTasks(staticTasks);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTaskSelection = (title: string) => {
    setSelectedTasks((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const handleSaveTasks = async () => {
    if (selectedTasks.length === 0 || isSaving) return;

    setIsSaving(true);
    try {
      const tasksApi = new TasksApi(undefined, undefined, customAxios);
      
      // Get the selected tasks from generatedTasks
      const tasksToCreate = generatedTasks.filter(task => 
        selectedTasks.includes(task.title)
      );

      // Convert to the Task interface format and create each task
      const creationPromises = tasksToCreate.map(async (task) => {
        // Find the category ID for the task's category name
        const categoryId = categories?.find(cat => cat.name === task.category)?.id || null;

        const taskData: Task = {
          title: task.title,
          description: task.description,
          due_date: task.dueDate,
          start_time: task.startTime,
          end_time: task.endTime,
          category: categoryId,
          priority: task.priority === "high" ? 3 : task.priority === "medium" ? 2 : 1,
          status: 'pending'
        };

        return tasksApi.tasksCreate(taskData);
      });

      // Wait for all tasks to be created
      await Promise.all(creationPromises);
      
      // Navigate to calendar after successful creation
      navigate("/calendar");
    } catch (error) {
      console.error("Failed to save tasks:", error);
      // You might want to add error handling here (e.g., show a toast notification)
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories?.find(cat => cat.name === categoryName);
    if (!category) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    
    return `bg-${category.color}-100 text-${category.color}-800 dark:bg-${category.color}-900 dark:text-${category.color}-300`;
  };

  const priorityColors: Record<string, string> = {
    low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }) +
      `, ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          AI Task Generator
        </CardTitle>
        <CardDescription>
          Describe what you need to do, and AI will generate tasks for you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="E.g., I need to prepare for a project presentation next week"
            className="min-h-32 resize-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Tasks
              </>
            )}
          </Button>
        </div>

        {generatedTasks.length > 0 && (
          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-medium">Generated Tasks</h3>
            <p className="text-sm text-muted-foreground">
              Select the tasks you want to add to your list
            </p>
            <div className="space-y-3">
              {generatedTasks.map((task, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer transition-colors",
                    selectedTasks.includes(task.title)
                      ? "bg-primary/10 border-primary/50"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  )}
                  onClick={() => toggleTaskSelection(task.title)}
                >
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{task.title}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline" className={cn(getCategoryColor(task.category))}>
                          {task.category}
                        </Badge>
                        <Badge variant="outline" className={cn(priorityColors[task.priority])}>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {task.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Due: {formatDate(task.dueDate)}
                      {task.startTime && task.endTime && (
                        <>
                          <br />
                          Time: {formatDate(task.startTime)} - {formatDate(task.endTime).split(', ')[1]}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      {generatedTasks.length > 0 && (
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/tasks")}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveTasks} 
            disabled={selectedTasks.length === 0 || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              `Add ${selectedTasks.length} ${selectedTasks.length === 1 ? "Task" : "Tasks"}`
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}