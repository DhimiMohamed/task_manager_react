"use client"
import customAxios from "../../lib/customAxios"
import { useState } from "react"
import { format, subMinutes, subHours, subDays } from "date-fns"
import { CalendarIcon, Plus, Trash2, Clock } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { TasksApi } from "@/api/apis/tasks-api"
import { RemindersApi } from "@/api/apis/reminders-api"
import { Task, TaskStatusEnum } from "@/api/models/task"
import { Reminder, ReminderEmailStatusEnum, ReminderInAppStatusEnum } from "@/api/models/reminder"
import { Category } from "@/api/models/category"

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

interface TaskFormProps {
  initialDate?: Date | null
  initialHour?: number
  categories: Category[]
  onSuccess?: (newTask: Task) => void
  onCancel?: () => void
  taskToEdit?: Task
}

export default function TaskForm({ 
  initialDate, 
  initialHour = 9, 
  categories, 
  onSuccess, 
  onCancel,
  taskToEdit 
}: TaskFormProps) {
  const [date, setDate] = useState<Date | undefined>(
    taskToEdit?.due_date ? new Date(taskToEdit.due_date) : initialDate || new Date()
  );
  const [startTime, setStartTime] = useState(
    taskToEdit?.start_time || (initialHour ? `${initialHour.toString().padStart(2, "0")}:00` : "09:00")
  );
  const [endTime, setEndTime] = useState(
    taskToEdit?.end_time || (initialHour ? `${(initialHour + 1).toString().padStart(2, "0")}:00` : "10:00")
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    taskToEdit?.category?.toString() || (categories.length > 0 ? categories[0].id?.toString() || "" : "")
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reminders state
  const [reminders, setReminders] = useState<ReminderInput[]>([]);

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
    
    const toastId = toast.loading(taskToEdit ? "Updating task..." : "Creating task...");
    
    try {
      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData(form);
      
      const taskData: Task = {
        title: formData.get('title') as string,
        description: formData.get('description') as string || null,
        due_date: date ? format(date, 'yyyy-MM-dd') : null,
        start_time: startTime,
        end_time: endTime,
        status: taskToEdit?.status || TaskStatusEnum.Pending,
        priority: taskToEdit?.priority || 1,
        category: selectedCategoryId ? parseInt(selectedCategoryId) : null,
      };

      const tasksApi = new TasksApi(undefined, undefined, customAxios);
      
      let response;
      if (taskToEdit) {
        response = await tasksApi.tasksUpdate(taskToEdit.id!.toString(), taskData);
      } else {
        response = await tasksApi.tasksCreate(taskData);
      }
      const createdOrUpdatedTask = response.data;

      // Create reminders if any exist and we have a valid task date/time
      if (reminders.length > 0 && date && createdOrUpdatedTask.id) {
        const remindersApi = new RemindersApi(undefined, undefined, customAxios);
        const reminderPromises = reminders.map(reminderInput => {
          const reminderTime = calculateReminderTime(date, startTime, reminderInput);
          
          const reminderData: Reminder = {
            task: createdOrUpdatedTask.id!,
            reminder_time: format(reminderTime, "yyyy-MM-dd'T'HH:mm:ss"),
            email_status: ReminderEmailStatusEnum.Pending,
            in_app_status: ReminderInAppStatusEnum.Pending,
          };

          return remindersApi.remindersRemindersCreate(reminderData);
        });

        await Promise.all(reminderPromises);
      }
      
      toast.success(taskToEdit ? "Task updated successfully" : "Task created successfully", { id: toastId });
      if (onSuccess) {
        onSuccess(createdOrUpdatedTask);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(taskToEdit ? "Failed to update task" : "Failed to create task", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input 
          id="title" 
          name="title" 
          placeholder="Task title" 
          required 
          disabled={isSubmitting}
          defaultValue={taskToEdit?.title}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          name="description" 
          placeholder="Task description" 
          disabled={isSubmitting}
          className="min-h-20"
          defaultValue={taskToEdit?.description || undefined}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select 
            value={selectedCategoryId} 
            onValueChange={setSelectedCategoryId}
            disabled={isSubmitting || categories.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={categories.length === 0 ? "No categories available" : "Select category"} />
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
          <Label htmlFor="startTime">Start Time *</Label>
          <Input 
            id="startTime" 
            type="time" 
            value={startTime} 
            onChange={(e) => setStartTime(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">End Time *</Label>
          <Input 
            id="endTime" 
            type="time" 
            value={endTime} 
            onChange={(e) => setEndTime(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      {/* Reminders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <Label className="text-sm font-medium">Reminders</Label>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addReminder}
            disabled={isSubmitting}
            className="flex items-center gap-1 text-xs"
          >
            <Plus className="h-3 w-3" />
            Add
          </Button>
        </div>

        {reminders.length === 0 && (
          <div className="text-xs text-muted-foreground py-3 text-center border border-dashed rounded-lg">
            No reminders set
          </div>
        )}

        <div className="space-y-3 max-h-48 overflow-y-auto">
          {reminders.map((reminder, index) => (
            <div
              key={reminder.id}
              className="flex items-start gap-2 p-3 border rounded-lg bg-muted/20"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Reminder {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeReminder(reminder.id)}
                    disabled={isSubmitting}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
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
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select time" />
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

                {reminder.type === 'custom' && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-8 text-xs",
                          !reminder.customDateTime && "text-muted-foreground"
                        )}
                        disabled={isSubmitting}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {reminder.customDateTime 
                          ? format(reminder.customDateTime, "MMM d 'at' HH:mm") 
                          : "Set time"
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
                        disabled={isSubmitting}
                      />
                      <div className="p-3 border-t">
                        <Label className="text-xs">Time</Label>
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
                          className="mt-1 h-8"
                          disabled={isSubmitting}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
          size="sm"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !selectedCategoryId}
          size="sm"
        >
          {isSubmitting 
            ? taskToEdit ? "Updating..." : "Creating..." 
            : taskToEdit ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  );
}