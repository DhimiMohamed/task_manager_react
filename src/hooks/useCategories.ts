// src/hooks/useCategories.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TasksApi } from '../api/apis/tasks-api';
import { Category } from '../api/models/category';
import customAxios from "../lib/customAxios";

const tasksApi = new TasksApi(undefined, undefined, customAxios);

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await tasksApi.tasksCategoriesList();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category: Omit<Category, 'id'>) => tasksApi.tasksCategoriesCreate(category as Category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...category }: Category) => {
      if (id === undefined) {
        throw new Error("Category ID is required for update");
      }
      return tasksApi.tasksCategoriesUpdate(id.toString(), category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tasksApi.tasksCategoriesDelete(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}