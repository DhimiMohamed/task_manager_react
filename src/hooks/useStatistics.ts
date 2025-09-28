// src\hooks\useStatistics.ts

import { useQuery } from '@tanstack/react-query';
import { TasksApi } from '../api/apis/tasks-api';
import { TasksStatsList200Response } from '../api/models';
import customAxios from '../lib/customAxios';

const tasksApi = new TasksApi(undefined, undefined, customAxios);

// Hook to fetch statistics (task stats)
export function useStatistics() {
  return useQuery<TasksStatsList200Response>({
    queryKey: ['taskStats'],
    queryFn: async () => {
      const response = await tasksApi.tasksStatsList();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
