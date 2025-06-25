import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProductivityHeatmap from "@/components/statistics/productivity-heatmap"
import CategoryBreakdown from "@/components/statistics/category-breakdown"
import TaskOverview from "@/components/statistics/task-overview"
import { useQuery } from "@tanstack/react-query"
import { TasksApi } from "@/api/apis/tasks-api"
import { AxiosResponse } from "axios"
import { TasksStatsList200Response } from "@/api/models"
import customAxios from "@/lib/customAxios"

export default function StatisticsPage() {
  const { data: statsResponse } = useQuery<AxiosResponse<TasksStatsList200Response>>({
    queryKey: ['taskStats'],
    queryFn: () => new TasksApi(undefined, undefined, customAxios).tasksStatsList()
  })

  const stats = statsResponse?.data

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
          <p className="text-muted-foreground">Track your productivity and task metrics</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_tasks ?? 0}</div>
                <p className="text-xs text-muted-foreground">All your tasks</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.completed_tasks ?? 0}</div>
                <p className="text-xs text-muted-foreground">{stats?.completion_rate ?? 0}% completion rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.pending_tasks ?? 0}</div>
                <p className="text-xs text-muted-foreground">{stats?.pending_rate ?? 0}% of total tasks</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.upcoming_tasks ?? 0}</div>
                <p className="text-xs text-muted-foreground">Due in the next 24h</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Task Overview</CardTitle>
                <CardDescription>Your task distribution over time</CardDescription>
              </CardHeader>
              <CardContent>
                <TaskOverview data={stats?.daily_tasks} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="productivity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Productivity Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductivityHeatmap data={stats?.heatmap_data} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Categories Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryBreakdown data={stats?.categories} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}