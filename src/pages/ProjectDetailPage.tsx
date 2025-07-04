"use client"

import { useNavigate, useParams } from "react-router-dom"
import { useProjectDetails } from "../hooks/useProjects"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar } from "lucide-react"
import { format, parseISO } from "date-fns"
import TaskBoard from "@/components/projects/task-board"
import ActivityLog from "@/components/projects/activity-log"
import MembersSection from "@/components/projects/members-section"
import ProjectTimeline from "@/components/projects/project-timeline"

// Use backend Project type


export interface ProjectFilters {
  team: string
  status: string
  timeframe: string
  search: string
}

// Remove sampleProject, use real data



export default function ProjectDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: project, isLoading, error } = useProjectDetails(Number(id));
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) return <div>Loading...</div>;
  if (error || !project) return <div>Project not found</div>;

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{project.team_name}</div>
            <p className="text-xs text-muted-foreground">Created by {project.created_by_username}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="capitalize">
              {project.status}
            </Badge>
          </CardContent>
        </Card>

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
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
          <TaskBoard projectId={project.id?.toString() ?? ""} />
            </div>
            <div className="space-y-6">
              <MembersSection teamId={project.team} teamColor="red" projectId={project.id?.toString() ?? ""} teamName={project.team_name} />
              <ActivityLog projectId="1" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <TaskBoard projectId={project.id?.toString() ?? ""} fullWidth />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <ProjectTimeline projectId="1" />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ActivityLog projectId={project.id?.toString() ?? ""} fullWidth />
        </TabsContent>
      </Tabs>
    </div>
  );
}
