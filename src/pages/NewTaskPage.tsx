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
import { format, subMinutes, subHours, subDays } from "date-fns";
import { CalendarIcon, Plus, Trash2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import AITaskGenerator from "@/components/ai-task-generator";
import { Task, TaskStatusEnum } from "@/api/models/task";
import { Reminder, ReminderEmailStatusEnum, ReminderInAppStatusEnum } from "@/api/models/reminder";
import { TasksApi } from "@/api/apis/tasks-api";
import { RemindersApi } from "@/api/apis/reminders-api";
import customAxios from "@/lib/customAxios";
import { useCategories } from "@/hooks/useCategories";

interface ReminderInput {
  id: string;
  type: 'preset' | 'custom';
  preset?: string;
  customDateTime?: Date;
}

const REMINDER_PRESETS = [
  { value: '10min', label: '10 minutes before' },
  { value: '30min', label: '30 minutes before' },
  { value: '1hour', label: '1 hour before' },
  { value: '2hours', label: '2 hours before' },
  { value: '1day', label: '1 day before' },
];

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
  
  // Reminders state
  const [reminders, setReminders] = useState<ReminderInput[]>([]);

  const { data: categories, isLoading: isCategoriesLoading, error: categoriesError } = useCategories();

  const addReminder = () => {
    const newReminder: ReminderInput = {
      id: Date.now().toString(),
      type: 'preset',
      preset: '10min'
    };
    setReminders([...reminders, newReminder]);
  };

  const updateReminder = (id: string, updates: Partial<ReminderInput>) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id ? { ...reminder, ...updates } : reminder
    ));
  };

  const removeReminder = (id: string) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };

  const calculateReminderTime = (taskDate: Date, taskStartTime: string, reminderInput: ReminderInput): Date => {
    const [hours, minutes] = taskStartTime.split(':').map(Number);
    const taskDateTime = new Date(taskDate);
    taskDateTime.setHours(hours, minutes, 0, 0);

    if (reminderInput.type === 'custom' && reminderInput.customDateTime) {
      return reminderInput.customDateTime;
    }

    switch (reminderInput.preset) {
      case '10min':
        return subMinutes(taskDateTime, 10);
      case '30min':
        return subMinutes(taskDateTime, 30);
      case '1hour':
        return subHours(taskDateTime, 1);
      case '2hours':
        return subHours(taskDateTime, 2);
      case '1day':
        return subDays(taskDateTime, 1);
      default:
        return subMinutes(taskDateTime, 10);
    }
  };

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

      // Initialize the APIs with custom axios
      const tasksApi = new TasksApi(undefined, undefined, customAxios);
      const remindersApi = new RemindersApi(undefined, undefined, customAxios);
      
      // Submit the task
      const taskResponse = await tasksApi.tasksCreate(taskData);
      const createdTask = taskResponse.data;

      // Create reminders if any exist and we have a valid task date/time
      if (reminders.length > 0 && date && createdTask.id) {
        const reminderPromises = reminders.map(reminderInput => {
          const reminderTime = calculateReminderTime(date, startTime, reminderInput);
          
          const reminderData: Reminder = {
            task: createdTask.id!,
            reminder_time: format(reminderTime, "yyyy-MM-dd'T'HH:mm:ss"),
            email_status: ReminderEmailStatusEnum.Pending,
            in_app_status: ReminderInAppStatusEnum.Pending,
          };

          return remindersApi.remindersRemindersCreate(reminderData);
        });

        await Promise.all(reminderPromises);
      }
      
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
              <CardContent className="space-y-6">
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

                {/* Reminders Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <Label className="text-base font-medium">Reminders</Label>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addReminder}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Reminder
                    </Button>
                  </div>

                  {reminders.length === 0 && (
                    <div className="text-sm text-muted-foreground py-4 text-center border-2 border-dashed rounded-lg">
                      No reminders set. Click "Add Reminder" to create one.
                    </div>
                  )}

                  <div className="space-y-3">
                    {reminders.map((reminder, index) => (
                      <div
                        key={reminder.id}
                        className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30"
                      >
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              Reminder {index + 1}
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Reminder Type</Label>
                            <Select
                              value={reminder.type === 'custom' ? 'custom' : reminder.preset}
                              onValueChange={(value) => {
                                if (value === 'custom') {
                                  updateReminder(reminder.id, {
                                    type: 'custom',
                                    preset: undefined,
                                    customDateTime: new Date()
                                  });
                                } else {
                                  updateReminder(reminder.id, {
                                    type: 'preset',
                                    preset: value,
                                    customDateTime: undefined
                                  });
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select reminder time" />
                              </SelectTrigger>
                              <SelectContent>
                                {REMINDER_PRESETS.map((preset) => (
                                  <SelectItem key={preset.value} value={preset.value}>
                                    {preset.label}
                                  </SelectItem>
                                ))}
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {reminder.type === 'custom' && (
                            <div className="space-y-2">
                              <Label>Custom Reminder Time</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !reminder.customDateTime && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {reminder.customDateTime 
                                      ? format(reminder.customDateTime, "PPP 'at' p") 
                                      : "Select custom time"
                                    }
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={reminder.customDateTime}
                                    onSelect={(date) => {
                                      if (date) {
                                        const newDateTime = new Date(date);
                                        if (reminder.customDateTime) {
                                          newDateTime.setHours(
                                            reminder.customDateTime.getHours(),
                                            reminder.customDateTime.getMinutes()
                                          );
                                        }
                                        updateReminder(reminder.id, { customDateTime: newDateTime });
                                      }
                                    }}
                                    initialFocus
                                  />
                                  <div className="p-3 border-t">
                                    <Label className="text-sm">Time</Label>
                                    <Input
                                      type="time"
                                      value={
                                        reminder.customDateTime
                                          ? format(reminder.customDateTime, "HH:mm")
                                          : "09:00"
                                      }
                                      onChange={(e) => {
                                        const [hours, minutes] = e.target.value.split(':').map(Number);
                                        const newDateTime = reminder.customDateTime || new Date();
                                        newDateTime.setHours(hours, minutes);
                                        updateReminder(reminder.id, { customDateTime: newDateTime });
                                      }}
                                      className="mt-1"
                                    />
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          )}
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeReminder(reminder.id)}
                          className="text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
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