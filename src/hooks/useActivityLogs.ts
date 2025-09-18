// src/hooks/useActivityLogs.ts
import { useQuery } from '@tanstack/react-query'
import { ActivityApi } from '@/api/apis/activity-api'
import { ActivityLog } from '@/api/models/activity-log'
import customAxios from '@/lib/customAxios'

const activityApi = new ActivityApi(undefined, undefined, customAxios)

export function useActivityLogs(projectId: string) {
  return useQuery({
    queryKey: ['activity-logs', projectId],
    queryFn: async () => {
      const data = await activityApi.activityProjectsLogsList(projectId)
      console.log('Activity Logs:', data) // Add this line
      return data
    },
    enabled: !!projectId,
  })
}