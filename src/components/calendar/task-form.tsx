// src/components/calendar/task-form.tsx
import { useState, useEffect } from "react"
import { format, subMinutes, subHours, subDays } from "date-fns"
import { CalendarIcon, Trash2, Clock, Settings } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Task, TaskStatusEnum } from "@/api/models/task"
import { Reminder, ReminderEmailStatusEnum, ReminderInAppStatusEnum } from "@/api/models/reminder"
import { Category } from "@/api/models/category"
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks"
import { useRemindersByTask, useCreateReminder, useDeleteReminder, useUpdateReminder } from "@/hooks/useReminders"

interface ReminderInput {
  id: string;
  type: 'preset' | 'custom';
  preset?: string;
  customDateTime?: Date;
  existingId?: number;
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
  taskId?: number
}

export default function TaskForm({ 
  initialDate, 
  initialHour = 9, 
  categories, 
  onSuccess, 
  onCancel,
  taskToEdit,
  taskId
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
  const [priority, setPriority] = useState<number>(taskToEdit?.priority || 1);
  const [reminders, setReminders] = useState<ReminderInput[]>([]);
  const [showPresetSelector, setShowPresetSelector] = useState(false);
  const [showCustomCalendar, setShowCustomCalendar] = useState<string | null>(null);

  // Use task hooks
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();

  // Use reminders hook
  const { data: existingReminders = [] } = useRemindersByTask(taskId || taskToEdit?.id!);
  const createReminder = useCreateReminder();
  const deleteReminder = useDeleteReminder();
  const updateReminderMutation = useUpdateReminder();

  // Check if any mutation is loading
  const isSubmitting = createTaskMutation.isPending || updateTaskMutation.isPending;

  const getCurrentTaskDateTime = (): Date => {
    if (!date) return new Date();
    const [hours, minutes] = startTime.split(':').map(Number);
    const taskDateTime = new Date(date);
    taskDateTime.setHours(hours, minutes, 0, 0);
    return taskDateTime;
  };

  const adjustForTimezone = (utcDateString: string): Date => {
    const date = new Date(utcDateString);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + timezoneOffset);
  };

  useEffect(() => {
    if (taskToEdit && existingReminders.length > 0) {
      const initialReminders = existingReminders.map(reminder => {
        const reminderTime = adjustForTimezone(reminder.reminder_time!);
        const taskTime = new Date(taskToEdit.due_date!);
        taskTime.setHours(
          parseInt(taskToEdit.start_time?.split(':')[0] || '0'),
          parseInt(taskToEdit.start_time?.split(':')[1] || '0')
        );

        const timeDiff = taskTime.getTime() - reminderTime.getTime();
        let presetMatch = null;

        if (Math.abs(timeDiff - (10 * 60 * 1000)) < 60000) presetMatch = '10min';
        else if (Math.abs(timeDiff - (30 * 60 * 1000)) < 60000) presetMatch = '30min';
        else if (Math.abs(timeDiff - (60 * 60 * 1000)) < 60000) presetMatch = '1hour';
        else if (Math.abs(timeDiff - (2 * 60 * 60 * 1000)) < 60000) presetMatch = '2hours';
        else if (Math.abs(timeDiff - (24 * 60 * 60 * 1000)) < 60000) presetMatch = '1day';

        if (presetMatch) {
          return {
            id: `existing-${reminder.id}`,
            type: 'preset' as const,
            preset: presetMatch,
            existingId: reminder.id
          };
        } else {
          return {
            id: `existing-${reminder.id}`,
            type: 'custom' as const,
            customDateTime: reminderTime,
            existingId: reminder.id
          };
        }
      });

      setReminders(initialReminders);
    }
  }, [taskToEdit, existingReminders]);

  const addPresetReminder = (presetValue: string) => {
    const newReminder: ReminderInput = {
      id: Date.now().toString(),
      type: 'preset',
      preset: presetValue,
    };
    setReminders([...reminders, newReminder]);
    setShowPresetSelector(false);
  };

  const addCustomReminder = () => {
    const taskDateTime = getCurrentTaskDateTime();
    const newReminder: ReminderInput = {
      id: Date.now().toString(),
      type: 'custom',
      customDateTime: taskDateTime
    };
    setReminders([...reminders, newReminder]);
  };

  const updateReminder = (id: string, updates: Partial<ReminderInput>) => {
    setReminders(reminders.map(reminder => {
      if (reminder.id === id) {
        const updatedReminder = { ...reminder, ...updates };
        if (updates.type === 'custom' && !updatedReminder.customDateTime) {
          updatedReminder.customDateTime = getCurrentTaskDateTime();
        }
        return updatedReminder;
      }
      return reminder;
    }));
  };

  const removeReminder = (id: string) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };

  const calculateReminderTime = (taskDate: Date, taskStartTime: string, reminderInput: ReminderInput): Date => {
    const [hours, minutes] = taskStartTime.split(':').map(Number);
    const taskDateTime = new Date(taskDate);
    taskDateTime.setHours(hours, minutes, 0, 0);

    if (reminderInput.type === 'custom' && reminderInput.customDateTime) {
      const customTime = new Date(reminderInput.customDateTime);
      customTime.setSeconds(0, 0);
      return customTime;
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
    
    if ((e.target as HTMLElement).closest('.calendar-container')) {
      return;
    }
    
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
        priority: priority,
        category: selectedCategoryId ? parseInt(selectedCategoryId) : null,
      };

      let createdOrUpdatedTask: Task;
      
      if (taskToEdit) {
        // Update existing task
        const response = await updateTaskMutation.mutateAsync({
          ...taskData,
          id: taskToEdit.id!
        });
        createdOrUpdatedTask = response.data;
        
        // Handle existing reminders - delete ones that are no longer needed
        const existingIds = existingReminders.map(r => r.id!);
        const remainingIds = reminders
          .filter(r => r.existingId)
          .map(r => r.existingId!);
        
        const toDelete = existingIds.filter(id => !remainingIds.includes(id));
        await Promise.all(toDelete.map(id => deleteReminder.mutateAsync(id)));
      } else {
        // Create new task
        const response = await createTaskMutation.mutateAsync(taskData);
        createdOrUpdatedTask = response.data;
      }

      // Handle reminders
      if (reminders.length > 0 && date && createdOrUpdatedTask.id) {
        const reminderPromises = reminders.map(async (reminderInput) => {
          const reminderTime = calculateReminderTime(date, startTime, reminderInput);
          
          const reminderData: Omit<Reminder, 'id'> = {
            task: createdOrUpdatedTask.id!,
            reminder_time: format(reminderTime, "yyyy-MM-dd'T'HH:mm:ss"),
            email_status: ReminderEmailStatusEnum.Pending,
            in_app_status: ReminderInAppStatusEnum.Pending,
          };

          if (reminderInput.existingId) {
            return updateReminderMutation.mutateAsync({
              id: reminderInput.existingId,
              reminder: {
                ...reminderData,
                id: reminderInput.existingId
              }
            });
          } else {
            return createReminder.mutateAsync(reminderData);
          }
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
    }
  };

  useEffect(() => {
    if (date && startTime) {
      setReminders(currentReminders => 
        currentReminders.map(reminder => {
          return reminder;
        })
      );
    }
  }, [date, startTime]);

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
          <Label htmlFor="priority">Priority</Label>
          <Select 
            value={priority.toString()}
            onValueChange={(value) => setPriority(parseInt(value))}
            disabled={isSubmitting}
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
          <PopoverContent className="w-auto p-0 calendar-container">
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
          <div className="flex items-center gap-2">
            {/* Preset Reminders Button */}
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                className="flex items-center gap-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowPresetSelector(!showPresetSelector);
                }}
              >
                <Clock className="h-3 w-3" />
                Preset
              </Button>
              
              {showPresetSelector && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div 
                    className="fixed inset-0 z-[9998]" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPresetSelector(false);
                    }}
                  />
                  {/* Dropdown menu */}
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white border rounded-md shadow-lg z-[9999] p-2 calendar-container">
                    <div className="space-y-1">
                      <p className="text-xs font-medium mb-2 text-gray-700">Choose preset reminder:</p>
                      {REMINDER_PRESETS.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          className="w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            addPresetReminder(preset.value);
                          }}
                          disabled={isSubmitting}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Custom Reminder Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                addCustomReminder();
              }}
              disabled={isSubmitting}
              className="flex items-center gap-1 text-xs"
            >
              <Settings className="h-3 w-3" />
              Custom
            </Button>
          </div>
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
                    {reminder.type === 'preset' ? 'Preset' : 'Custom'} Reminder {index + 1} {reminder.existingId && "(existing)"}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeReminder(reminder.id);
                    }}
                    disabled={isSubmitting}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                {reminder.type === 'preset' ? (
                  <div className="text-sm">
                    {REMINDER_PRESETS.find(p => p.value === reminder.preset)?.label || reminder.preset}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-8 text-xs",
                          !reminder.customDateTime && "text-muted-foreground"
                        )}
                        disabled={isSubmitting}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setShowCustomCalendar(showCustomCalendar === reminder.id ? null : reminder.id);
                        }}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {reminder.customDateTime 
                          ? format(reminder.customDateTime, "MMM d, yyyy 'at' HH:mm") 
                          : "Set reminder time"
                        }
                      </Button>
                      
                      {showCustomCalendar === reminder.id && (
                        <>
                          {/* Backdrop to close calendar */}
                          <div 
                            className="fixed inset-0 z-[9998]" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowCustomCalendar(null);
                            }}
                          />
                          {/* Calendar dropdown - positioned fixed to break out of container constraints */}
                          <div className="fixed bg-white border rounded-md shadow-xl z-[9999] p-0 calendar-container"
                               style={{
                                 top: 'calc(50% - 200px)',
                                 left: '50%',
                                 transform: 'translateX(-50%)',
                                 maxHeight: '400px',
                                 width: '300px'
                               }}>
                            <Calendar
                              mode="single"
                              selected={reminder.customDateTime}
                              onSelect={(selectedDate) => {
                                if (selectedDate) {
                                  const currentTime = reminder.customDateTime || getCurrentTaskDateTime();
                                  const newDate = new Date(selectedDate);
                                  newDate.setHours(
                                    currentTime.getHours(),
                                    currentTime.getMinutes(),
                                    0,
                                    0
                                  );
                                  updateReminder(reminder.id, { customDateTime: newDate });
                                }
                              }}
                              initialFocus
                              disabled={isSubmitting}
                              className="rounded-md"
                            />
                            <div className="p-3 border-t bg-gray-50">
                              <Label className="text-xs font-medium">Time</Label>
                              <Input
                                type="time"
                                value={
                                  reminder.customDateTime
                                    ? format(reminder.customDateTime, "HH:mm")
                                    : startTime // Use task's start time as default
                                }
                                onChange={(e) => {
                                  const [hours, minutes] = e.target.value.split(':').map(Number);
                                  const currentDate = reminder.customDateTime || new Date();
                                  const newDateTime = new Date(currentDate);
                                  newDateTime.setHours(hours, minutes, 0, 0);
                                  updateReminder(reminder.id, { customDateTime: newDateTime });
                                }}
                                className="mt-1 h-8"
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
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