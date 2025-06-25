// // src/hooks/useTaskStatistics.ts
// import { useQuery } from '@tanstack/react-query';
// import { useTasks } from './useTasks';
// import { Task, TaskStatusEnum } from '../api/models/task';
// import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

// interface CompletionStats {
//   completion_rate: number;
//   completion_rate_change: number;
//   tasks_created: number;
//   tasks_created_change: number;
//   avg_completion_time: number;
//   avg_completion_time_change: number;
//   trend_data: { period: string; completed: number }[];
// }

// interface ProductivityData {
//   day: string;
//   hour: number;
//   productivity: number;
// }

// interface CategoryData {
//   category: string;
//   count: number;
//   percentage: number;
// }

// export function useTaskStatistics() {
//   const { data: tasks = [], isLoading } = useTasks();

//   // Calculate completion statistics
//   const calculateCompletionStats = (): CompletionStats => {
//     const now = new Date();
//     const currentMonthStart = startOfMonth(now);
//     const lastMonthStart = startOfMonth(subMonths(now, 1));

//     // Filter tasks for current and last month
//     const currentMonthTasks = tasks.filter(task => 
//       new Date(task.created_at || '') >= currentMonthStart
//     );
//     const lastMonthTasks = tasks.filter(task => 
//       new Date(task.created_at || '') >= lastMonthStart && 
//       new Date(task.created_at || '') < currentMonthStart
//     );

//     // Calculate completion rate
//     const currentCompleted = currentMonthTasks.filter(
//       task => task.status === TaskStatusEnum.Completed
//     ).length;
//     const currentCompletionRate = currentMonthTasks.length > 0 
//       ? Math.round((currentCompleted / currentMonthTasks.length) * 100)
//       : 0;

//     const lastCompleted = lastMonthTasks.filter(
//       task => task.status === TaskStatusEnum.Completed
//     ).length;
//     const lastCompletionRate = lastMonthTasks.length > 0 
//       ? Math.round((lastCompleted / lastMonthTasks.length) * 100)
//       : 0;

//     // Calculate trend data (last 6 months)
//     const trendData = Array.from({ length: 6 }, (_, i) => {
//       const monthStart = startOfMonth(subMonths(now, 5 - i));
//       const monthEnd = endOfMonth(monthStart);
//       const monthTasks = tasks.filter(task => 
//         new Date(task.created_at || '') >= monthStart && 
//         new Date(task.created_at || '') <= monthEnd
//       );
//       const monthCompleted = monthTasks.filter(
//         task => task.status === TaskStatusEnum.Completed
//       ).length;

//       return {
//         period: format(monthStart, 'MMM'),
//         completed: monthCompleted
//       };
//     });

//     // Calculate average completion time (in days)
//     const completedTasks = tasks.filter(
//       task => task.status === TaskStatusEnum.Completed && 
//       task.created_at && 
//       task.completed_at
//     );
//     const currentAvgTime = completedTasks.length > 0
//       ? completedTasks.reduce((sum, task) => {
//           const created = new Date(task.created_at || '');
//           const completed = new Date(task.completed_at || '');
//           return sum + (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
//         }, 0) / completedTasks.length
//       : 0;

//     // For simplicity, we'll use the same value for change
//     // In a real app, you'd calculate this properly
//     const avgTimeChange = 0.5;

//     return {
//       completion_rate: currentCompletionRate,
//       completion_rate_change: currentCompletionRate - lastCompletionRate,
//       tasks_created: currentMonthTasks.length,
//       tasks_created_change: currentMonthTasks.length - lastMonthTasks.length,
//       avg_completion_time: parseFloat(currentAvgTime.toFixed(1)),
//       avg_completion_time_change: avgTimeChange,
//       trend_data: trendData
//     };
//   };

//   // Calculate productivity data (simplified example)
//   const calculateProductivityData = (): ProductivityData[] => {
//     // This is a simplified example - you'd need to implement based on your actual data
//     const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
//     return days.flatMap(day => 
//       Array.from({ length: 8 }, (_, i) => ({
//         day,
//         hour: i + 9, // 9AM to 5PM
//         productivity: Math.floor(Math.random() * 10) // Random data for example
//       }))
//     );
//   };

//   // Calculate category breakdown
//   const calculateCategoryData = (): CategoryData[] => {
//     const categoryMap = new Map<string, number>();
    
//     tasks.forEach(task => {
//       const category = task.category || 'Uncategorized';
//       categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
//     });

//     const total = tasks.length;
//     return Array.from(categoryMap.entries()).map(([category, count]) => ({
//       category,
//       count,
//       percentage: Math.round((count / total) * 100)
//     }));
//   };

//   return {
//     completionStats: calculateCompletionStats(),
//     productivityData: calculateProductivityData(),
//     categoryData: calculateCategoryData(),
//     isLoading
//   };
// }