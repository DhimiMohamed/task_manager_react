import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import AITaskGenerator from "@/components/ai-task-generator";
import { Task, TaskStatusEnum } from "@/api/models/task";
import { TasksApi } from "@/api/apis/tasks-api";
import customAxios from "@/lib/customAxios";
import { useCategories } from "@/hooks/useCategories";

export default function NewTaskPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("13:00");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<number | null>(null);
  const [priority, setPriority] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categories, isLoading: isCategoriesLoading, error: categoriesError } = useCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Format the date and times
      const formattedDate = date ? format(date, "yyyy-MM-dd") : undefined;
      const [startHours, startMinutes] = startTime.split(":");
      const [endHours, endMinutes] = endTime.split(":");
      
      const formattedStartTime = date 
        ? format(new Date(date.setHours(parseInt(startHours), parseInt(startMinutes))), "HH:mm:ss") 
        : undefined;
      
      const formattedEndTime = date 
        ? format(new Date(date.setHours(parseInt(endHours), parseInt(endMinutes))), "HH:mm:ss") 
        : undefined;

      // Create the task object
      const taskData: Task = {
        title,
        description: description || null,
        due_date: formattedDate || null,
        start_time: formattedStartTime || null,
        end_time: formattedEndTime || null,
        status: TaskStatusEnum.Pending,
        priority,
        category: category,
      };

      // Initialize the API with custom axios
      const api = new TasksApi(undefined, undefined, customAxios);
      
      // Submit the task
      await api.tasksCreate(taskData);
      
      // Redirect on success
      navigate("/tasks");
    } catch (error) {
      console.error("Failed to create task:", error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Create New Task</h1>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="ai">AI Generated</TabsTrigger>
        </TabsList>
        <TabsContent value="manual" className="mt-6">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Task Details</CardTitle>
                <CardDescription>Enter the details for your new task</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    placeholder="Task title" 
                    required 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Task description" 
                    className="min-h-24" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                {/* <div className="grid grid-cols-2 md:grid-cols-2 gap-4"> */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      onValueChange={(value) => setCategory(value === "null" ? null : Number(value))}
                      disabled={isCategoriesLoading || !!categoriesError}
                      value={category ? category.toString() : "null"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          isCategoriesLoading ? "Loading categories..." : 
                          categoriesError ? "Error loading categories" : 
                          "Select category"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">No category</SelectItem>
                        {categories?.map((category) => (
                          <SelectItem 
                            key={category.id} 
                            value={category.id?.toString() ?? '0'}
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
                    {categoriesError && (
                      <p className="text-sm text-red-500">Failed to load categories</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      onValueChange={(value) => setPriority(parseInt(value))}
                      value={priority.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Low</SelectItem>
                        <SelectItem value="2">Medium</SelectItem>
                        <SelectItem value="3">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          min={startTime}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between py-2">
                <Button variant="outline" onClick={() => navigate("/tasks")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Task"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="ai" className="mt-6">
          <AITaskGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}