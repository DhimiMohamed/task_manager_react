// src/hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TasksApi } from '../api/apis/tasks-api';
import { Task, TaskStatusEnum } from '../api/models/task';
import { Comment } from '../api/models/comment';
import { FileAttachment } from '../api/models/file-attachment';
import customAxios from "../lib/customAxios";

const tasksApi = new TasksApi(undefined, undefined, customAxios);

// Existing task hooks
export function useTasks(ordering?: string, filters?: { projectId?: string }) {
  return useQuery<Task[]>({
    queryKey: ['tasks', ordering],
    queryFn: async () => {
      const response = await tasksApi.tasksList(ordering);
      return response.data;
    },
    select: (data) => {
      let filteredData = [...data];
      
      // Apply project filter if provided
      if (filters?.projectId) {
        filteredData = filteredData.filter(task => task.project === Number(filters.projectId));
      }

      // Apply other filters if needed (status, priority, etc.)
      // if (filters?.status) { ... }

      return filteredData;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (task: Omit<Task, 'id'>) => tasksApi.tasksCreate(task as Task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...task }: Task) => {
      if (id === undefined) {
        throw new Error("Task ID is required for update");
      }
      return tasksApi.tasksUpdate(id.toString(), task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tasksApi.tasksDelete(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Optional: Hook for filtering tasks by status
export function useTasksByStatus(status: TaskStatusEnum) {
  return useQuery<Task[]>({
    queryKey: ['tasks', status],
    queryFn: async () => {
      const response = await tasksApi.tasksList();
      return response.data.filter(task => task.status === status);
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ==================== COMMENT HOOKS ====================

export function useTaskComments(taskId: string) {
  return useQuery<Comment[]>({
    queryKey: ['tasks', taskId, 'comments'],
    queryFn: async () => {
      const response = await tasksApi.tasksCommentsList(taskId);
      return response.data;
    },
    enabled: !!taskId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, comment }: { taskId: string; comment: Omit<Comment, 'id'> }) => {
      return tasksApi.tasksCommentsCreate(taskId, comment as Comment);
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'comments'] });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: Comment; taskId: string }) => {
      return tasksApi.tasksCommentsUpdate(id, comment);
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'comments'] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; taskId: string }) => {
      return tasksApi.tasksCommentsDelete(id);
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'comments'] });
    },
  });
}

// ==================== FILE ATTACHMENT HOOKS ====================

export function useTaskAttachments(taskId: string) {
  return useQuery<FileAttachment[]>({
    queryKey: ['tasks', taskId, 'attachments'],
    queryFn: async () => {
      const response = await tasksApi.tasksAttachmentsList(taskId);
      return response.data;
    },
    enabled: !!taskId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, file, description }: { taskId: string; file: File; description?: string }) => {
      return tasksApi.tasksAttachmentsCreate(taskId, file, description);
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'attachments'] });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; taskId: string }) => {
      return tasksApi.tasksAttachmentsDelete(id);
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'attachments'] });
    },
  });
}

export function useDownloadAttachment() {
  return useMutation({
    mutationFn: (id: string) => {
      return tasksApi.tasksAttachmentsDownloadList(id);
    },
  });
}