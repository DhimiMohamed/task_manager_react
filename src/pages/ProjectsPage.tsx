"use client"

import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useProjects } from "@/hooks/useProjects"
import { useStatistics } from "@/hooks/useStatistics"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useCallback } from "react"
import { PlusCircle, Search, Calendar, AlertTriangle, Grid3X3, List, Star, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, isAfter, isBefore, addDays, parseISO } from "date-fns"
import ProjectForm from "@/components/projects/project-form"

// Use backend Project type

export interface ProjectFilters {
  team: string
  status: string
  timeframe: string
  search: string
}


// ...existing code...

import { useTeams } from "@/hooks/useTeams"

// ...existing code...

// Remove static teams, use dynamic teams from backend
const statuses = ["All Statuses", "planning", "active", "on_hold", "completed"]
const timeframes = ["All Time", "This Week", "This Month", "Next Month", "Overdue"]

const statusColors = {
  planning: "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600",
  active: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-700",
  "in-progress": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700",
  review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300 dark:border-green-700",
  "on_hold": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-300 dark:border-red-700",
  "on-hold": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-300 dark:border-red-700",
};


export default function ProjectsPage() {
  const navigate = useNavigate();
  // Fetch projects from backend
  const { data: projects = [], isLoading, refetch } = useProjects()
  // Fetch project statistics (for progress bar)
  const { data: stats } = useStatistics();
  // Fetch teams from backend
  const { data: teamsData = [], isLoading: isTeamsLoading } = useTeams();
  const [filters, setFilters] = useState<ProjectFilters>({
    team: "All Teams",
    status: "All Statuses",
    timeframe: "All Time",
    search: "",
  })

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [dialogOpen, setDialogOpen] = useState(false)

  // Handler to close dialog and refetch
  const handleProjectCreated = useCallback(() => {
    setDialogOpen(false)
    refetch()
  }, [refetch])



  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Team filter
      if (filters.team !== "All Teams" && project.team_name !== filters.team) {
        return false
      }

      // Status filter
      if (filters.status !== "All Statuses" && project.status !== filters.status) {
        return false
      }

      // Search filter
      if (filters.search && !project.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }

      // Timeframe filter
      const deadline = project.end_date ? parseISO(project.end_date) : null
      const now = new Date()

      if (!deadline) return true

      switch (filters.timeframe) {
        case "This Week":
          return isBefore(deadline, addDays(now, 7))
        case "This Month":
          return isBefore(deadline, addDays(now, 30))
        case "Next Month":
          return isAfter(deadline, now) && isBefore(deadline, addDays(now, 60))
        case "Overdue":
          return isBefore(deadline, now) && project.status !== "completed"
        default:
          return true
      }
    })
  }, [projects, filters])

//   const isOverdue = (deadline: string, status: string) => {
//     return isBefore(parseISO(deadline), new Date()) && status !== "completed"
//   }

  const getDeadlineStatus = (deadline?: string | null, status?: string) => {
    if (!deadline) return "normal"
    const deadlineDate = parseISO(deadline)
    const now = new Date()
    const daysDiff = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (status === "completed") return "completed"
    if (daysDiff < 0) return "overdue"
    if (daysDiff <= 1) return "urgent"
    if (daysDiff <= 7) return "soon"
    return "normal"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage and track all your projects</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <ProjectForm onSuccess={handleProjectCreated} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={filters.team} onValueChange={(value) => setFilters({ ...filters, team: value })}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="all-teams" value="All Teams">
                    All Teams
                  </SelectItem>
                  {isTeamsLoading ? (
                    <SelectItem disabled value="loading">Loading teams...</SelectItem>
                  ) : (
                    teamsData.map((team) => (
                      <SelectItem key={team.name} value={team.name}>
                        {team.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.timeframe} onValueChange={(value) => setFilters({ ...filters, timeframe: value })}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {timeframes.map((timeframe) => (
                    <SelectItem key={timeframe} value={timeframe}>
                      {timeframe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading projects..." : `Showing ${filteredProjects.length} of ${projects.length} projects`}
        </p>
        {filters.search && (
          <Button variant="ghost" size="sm" onClick={() => setFilters({ ...filters, search: "" })}>
            Clear search
          </Button>
        )}
      </div>

      {/* Projects Grid/List */}
      {filteredProjects.length > 0 ? (
        <div className={cn(viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4")}>
          {filteredProjects.map((project) => {
            const deadlineStatus = getDeadlineStatus(project.end_date, project.status);
            // Find the matching stats for this project
            const projectStats = stats?.projects?.find((p) => p.name === project.name);
            const completionRate = projectStats?.completion_rate ?? 0;


            // Fallbacks for UI fields not in backend
            const isFavorite = false; // No favorite in backend
            const teamColor = "bg-gray-400"; // No color in backend
            const teamName = project.team_name ?? "Unknown Team";
            const progress = completionRate;
            const deadline = project.end_date;

            return (
              <Card
                key={project.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  viewMode === "list" && "flex flex-col sm:flex-row",
                  deadlineStatus === "overdue" && "border-red-200 dark:border-red-800",
                  deadlineStatus === "urgent" && "border-orange-200 dark:border-orange-800",
                )}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <CardHeader className={cn("pb-2", viewMode === "list" && "sm:flex-1")}> 
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => e.stopPropagation()}
                          title="Favorite (not implemented)"
                        >
                          <Star
                            className={cn(
                              "h-4 w-4",
                              isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
                            )}
                          />
                        </Button>
                      </div>
                      <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <div className={cn("w-3 h-3 rounded-full", teamColor)}></div>
                    <span className="text-sm text-muted-foreground">{teamName}</span>
                  </div>
                </CardHeader>

                <CardContent className={cn("pt-0", viewMode === "list" && "sm:flex-1 sm:pt-6")}> 
                  <div className="space-y-3">
                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Status and Deadline */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          statusColors[(project.status as keyof typeof statusColors) ?? "planning"] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
                          "capitalize border"
                        )}
                      >
                        {project.status || "unknown"}
                      </Badge>

                      <div
                        className={cn(
                          "flex items-center gap-1 text-sm",
                          deadlineStatus === "overdue" && "text-red-600 dark:text-red-400",
                          deadlineStatus === "urgent" && "text-orange-600 dark:text-orange-400",
                        )}
                      >
                        {deadlineStatus === "overdue" && <AlertTriangle className="h-4 w-4" />}
                        <Calendar className="h-4 w-4" />
                        <span>
                          {deadline ? format(parseISO(deadline), "MMM d, yyyy") : "No deadline"}
                          {deadlineStatus === "overdue" && " (Overdue)"}
                          {deadlineStatus === "urgent" && " (Due Soon)"}
                        </span>
                      </div>
                    </div>

                    {/* Team Members and Tasks */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{projectStats?.team_members_count ?? 0} members</span>
                      </div>
                      <span>
                        {(projectStats?.completed ?? 0)}/{projectStats?.total ?? 0} tasks
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">No projects found</h3>
              <p className="text-muted-foreground">
                {filters.search ||
                filters.team !== "All Teams" ||
                filters.status !== "All Statuses" ||
                filters.timeframe !== "All Time"
                  ? "Try adjusting your filters or search terms"
                  : "Get started by creating your first project"}
              </p>
              {!filters.search &&
                filters.team === "All Teams" &&
                filters.status === "All Statuses" &&
                filters.timeframe === "All Time" && (
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="mt-4">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                      </DialogHeader>
                      <ProjectForm onSuccess={handleProjectCreated} />
                    </DialogContent>
                  </Dialog>
                )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
