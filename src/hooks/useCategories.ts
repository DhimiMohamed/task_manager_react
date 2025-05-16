// src/hooks/useCategories.ts
import { useQuery } from '@tanstack/react-query';
import { TasksApi } from '../api/apis/tasks-api';
import { Category } from '../api/models/category';
import customAxios from "../lib/customAxios";

// Initialize your API client
const tasksApi = new TasksApi(undefined, undefined, customAxios);

// Create the hook
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'], // Unique key for caching
    queryFn: async () => {
      const response = await tasksApi.tasksCategoriesList();
      return response.data; // Returns Category[]
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}