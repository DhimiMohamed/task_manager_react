// src/pages/ProjectDetailPage.tsx
import { useNavigate, useParams } from "react-router-dom"
import { useProjectDetails, useUpdateProject } from "../hooks/useProjects"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
// Status options for select
const statusOptions = [
  { value: "planning", label: "Planning", color: "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600" },
  { value: "active", label: "Active", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-700" },
  { value: "on_hold", label: "On Hold", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-300 dark:border-red-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300 dark:border-green-700" },
]
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar } from "lucide-react"
import { format, parseISO } from "date-fns"
import TaskBoard from "@/components/projects/task-board"
import ActivityLog from "@/components/projects/activity-log"
import MembersSection from "@/components/projects/members-section"
import ProjectTimeline from "@/components/projects/project-timeline"

// Import useStatistics for project progress
import { useStatistics } from "@/hooks/useStatistics"

// Use backend Project type

export interface ProjectFilters {
  team: string
  status: string
  timeframe: string
  search: string
}

export default function ProjectDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: project, isLoading, error } = useProjectDetails(Number(id));
  const [activeTab, setActiveTab] = useState("overview");
  const updateProjectMutation = useUpdateProject();

  // Fetch statistics for progress
  const { data: stats } = useStatistics();
  // Find stats for this project (by name or id)
  const projectStats = stats?.projects?.find((p) => p.name === project?.name);
  const progress = projectStats?.completion_rate ?? 0;
  const completedTasks = projectStats?.completed ?? 0;
  const tasksCount = projectStats?.total ?? 0;

  // Handler to update status
  const updateStatus = (newStatus: string) => {
    if (!project) return;
    updateProjectMutation.mutate({ ...project, status: newStatus as typeof project.status });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error || !project) return <div>Project not found</div>;

  const projectIdStr = project.id?.toString() ?? ""

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          </div>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Team Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{project.team_name}</div>
            <p className="text-xs text-muted-foreground">Created by {project.created_by_email}</p>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={project.status} onValueChange={updateStatus}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn(status.color)}>
                        {status.label}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Start Date Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Start Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-lg font-semibold">{project.start_date ? format(parseISO(project.start_date), "MMM d, yyyy") : "-"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{completedTasks}/{tasksCount} tasks</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Deadline Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Deadline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-lg font-semibold">{project.end_date ? format(parseISO(project.end_date), "MMM d, yyyy") : "-"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          {/* <TabsTrigger value="timeline">Timeline</TabsTrigger> */}
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-muted-foreground">{project.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-1">Created</h4>
                        <p className="text-sm text-muted-foreground">
                          {project.created_at ? format(parseISO(project.created_at), "MMM d, yyyy") : "-"}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Due Date</h4>
                        <p className="text-sm text-muted-foreground">
                          {project.end_date ? format(parseISO(project.end_date), "MMM d, yyyy") : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <TaskBoard projectId={projectIdStr} teamId={project.team} />
            </div>
            <div className="space-y-6">
              <MembersSection teamId={project.team} teamColor="red" projectId={projectIdStr} teamName={project.team_name} />
              <ActivityLog projectId={projectIdStr} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <TaskBoard projectId={projectIdStr} teamId={project.team} fullWidth />
        </TabsContent>

        {/* <TabsContent value="timeline" className="mt-6">
          <ProjectTimeline projectId={projectIdStr} />
        </TabsContent> */}

        <TabsContent value="activity" className="mt-6">
          <ActivityLog projectId={projectIdStr} fullWidth />
        </TabsContent>
      </Tabs>
    </div>
  );
}