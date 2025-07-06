
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task, TaskStatusEnum } from "@/api/models/task";
import { Category } from "@/api/models/category";
import { useCreateTask } from "@/hooks/useTasks";
import { useTeamMembers } from "@/hooks/useTeams";

interface TaskProjectFormProps {
  projectId: number;
  teamId: number;
  categories: Category[];
  onSuccess?: (newTask: Task) => void;
  onCancel?: () => void;
}

export default function TaskProjectForm({ projectId, teamId, categories, onSuccess, onCancel }: TaskProjectFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [priority, setPriority] = useState<number>(1);
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id?.toString() || "");
  const [assignedTo, setAssignedTo] = useState<string>("");

  const { data: teamMembers = [], isLoading: loadingMembers } = useTeamMembers(teamId);
  const createTaskMutation = useCreateTask();
  const isSubmitting = createTaskMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Creating project task...");
    try {
      const taskData: Task = {
        title,
        description: description || null,
        due_date: date,
        start_time: startTime,
        end_time: endTime,
        status: TaskStatusEnum.Pending,
        priority,
        category: categoryId ? parseInt(categoryId) : null,
        project: projectId,
        assigned_to: assignedTo ? parseInt(assignedTo) : null,
      };
      const response = await createTaskMutation.mutateAsync(taskData);
      toast.success("Task created successfully", { id: toastId });
      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      toast.error("Failed to create task", { id: toastId });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
      <div className="space-y-2">
        <Input
          id="title"
          name="title"
          placeholder="Task title"
          required
          disabled={isSubmitting}
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Textarea
          id="description"
          name="description"
          placeholder="Task description"
          disabled={isSubmitting}
          className="min-h-20"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs mb-1">Due Date</label>
          <Input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="flex gap-2">
          <div>
            <label className="block text-xs mb-1">Start</label>
            <Input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-xs mb-1">End</label>
            <Input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs mb-1">Category</label>
          <Select value={categoryId} onValueChange={setCategoryId} disabled={isSubmitting}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id?.toString() || ""}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-xs mb-1">Priority</label>
          <Select value={priority.toString()} onValueChange={v => setPriority(Number(v))} disabled={isSubmitting}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Low</SelectItem>
              <SelectItem value="2">Medium</SelectItem>
              <SelectItem value="3">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-xs mb-1">Assign to</label>
        <Select value={assignedTo} onValueChange={setAssignedTo} disabled={isSubmitting || loadingMembers}>
          <SelectTrigger>
            <SelectValue placeholder="Select member" />
          </SelectTrigger>
          <SelectContent>
            {teamMembers.map(member => (
              <SelectItem key={member.user_id} value={member.user_id?.toString() || ""}>
                {member.username || member.email || member.user_email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>Create Task</Button>
      </div>
    </form>
  );
}
