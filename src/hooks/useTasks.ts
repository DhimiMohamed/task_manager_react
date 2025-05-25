// src/hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TasksApi } from '../api/apis/tasks-api';
import { Task, TaskStatusEnum } from '../api/models/task';
import customAxios from "../lib/customAxios";

const tasksApi = new TasksApi(undefined, undefined, customAxios);

export function useTasks(ordering?: string) {
  return useQuery<Task[]>({
    queryKey: ['tasks', ordering],
    queryFn: async () => {
      const response = await tasksApi.tasksList(ordering);
      return response.data;
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