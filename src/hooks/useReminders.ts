// src/hooks/useReminders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RemindersApi } from '../api/apis/reminders-api';
import { Reminder } from '../api/models/reminder';
import customAxios from "../lib/customAxios";

const remindersApi = new RemindersApi(undefined, undefined, customAxios);

export function useReminders() {
  return useQuery<Reminder[]>({
    queryKey: ['reminders'],
    queryFn: async () => {
      const response = await remindersApi.remindersRemindersList();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reminder: Omit<Reminder, 'id'>) => 
      remindersApi.remindersRemindersCreate(reminder as Reminder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, reminder}: {id: number, reminder: Reminder}) => 
      remindersApi.remindersRemindersUpdate(id.toString(), reminder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => remindersApi.remindersRemindersDelete(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useRemindersByTask(taskId?: number) {
  return useQuery<Reminder[]>({
    queryKey: ['reminders', taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const response = await remindersApi.remindersRemindersList();
      return response.data.filter(reminder => reminder.task === taskId);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useRemindersByStatus(
  statusType: 'email' | 'in_app',
  status: Reminder['email_status'] | Reminder['in_app_status']
) {
  return useQuery<Reminder[]>({
    queryKey: ['reminders', statusType, status],
    queryFn: async () => {
      const response = await remindersApi.remindersRemindersList();
      return response.data.filter(reminder => 
        statusType === 'email' 
          ? reminder.email_status === status 
          : reminder.in_app_status === status
      );
    },
    staleTime: 1000 * 60 * 5,
  });
}