"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, CheckCircle, Edit3, Save, X, Target, ListTodo, Flag } from "lucide-react"
export interface TeamMember {
  id: string
  name: string
  email: string
  role: "owner" | "admin" | "member"
  avatar?: string
  joinedAt: string
  status: "active" | "pending" | "inactive"
}

interface ProjectProposal {
  name: string
  description: string
  deadline: string
  priority: "low" | "medium" | "high"
  estimatedDuration: string
  tasks: {
    id: string
    title: string
    description: string
    assignedTo: string
    priority: "low" | "medium" | "high"
    estimatedHours: number
    dependencies: string[]
  }[]
  milestones: {
    id: string
    title: string
    description: string
    dueDate: string
    tasks: string[]
  }[]
}

interface AIProjectProposalProps {
  proposal: ProjectProposal
  onProposalChange: (proposal: ProjectProposal) => void
  teamMembers: TeamMember[]
  onSubmit: (proposal: ProjectProposal) => void
}

export default function AIProjectProposal({
  proposal,
  onProposalChange,
  teamMembers,
  onSubmit,
}: AIProjectProposalProps) {
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getTeamMemberById = (id: string) => {
    return teamMembers.find((member) => member.id === id)
  }

  const updateTask = (taskId: string, updates: Partial<ProjectProposal["tasks"][0]>) => {
    const updatedTasks = proposal.tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    onProposalChange({ ...proposal, tasks: updatedTasks })
  }

  const updateMilestone = (milestoneId: string, updates: Partial<ProjectProposal["milestones"][0]>) => {
    const updatedMilestones = proposal.milestones.map((milestone) =>
      milestone.id === milestoneId ? { ...milestone, ...updates } : milestone,
    )
    onProposalChange({ ...proposal, milestones: updatedMilestones })
  }

  const totalHours = proposal.tasks.reduce((sum, task) => sum + task.estimatedHours, 0)

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Project Overview
          </CardTitle>
          <CardDescription>Review and modify the AI-generated project details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={proposal.name}
                onChange={(e) => onProposalChange({ ...proposal, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={proposal.deadline}
                onChange={(e) => onProposalChange({ ...proposal, deadline: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={proposal.priority}
                onValueChange={(value: "low" | "medium" | "high") => onProposalChange({ ...proposal, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Estimated Duration</Label>
              <Input
                id="duration"
                value={proposal.estimatedDuration}
                onChange={(e) => onProposalChange({ ...proposal, estimatedDuration: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={proposal.description}
              onChange={(e) => onProposalChange({ ...proposal, description: e.target.value })}
              className="min-h-24"
            />
          </div>

          {/* Project Statistics */}
          <div className="grid gap-4 md:grid-cols-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{proposal.tasks.length}</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalHours}h</div>
              <div className="text-sm text-muted-foreground">Estimated Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{teamMembers.length}</div>
              <div className="text-sm text-muted-foreground">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{proposal.milestones.length}</div>
              <div className="text-sm text-muted-foreground">Milestones</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks and Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            Tasks & Milestones
          </CardTitle>
          <CardDescription>Review task assignments and project milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tasks">Tasks ({proposal.tasks.length})</TabsTrigger>
              <TabsTrigger value="milestones">Milestones ({proposal.milestones.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="space-y-4">
              {proposal.tasks.map((task) => {
                const assignedMember = getTeamMemberById(task.assignedTo)
                const isEditing = editingTask === task.id

                return (
                  <Card key={task.id} className="relative">
                    <CardContent className="p-4">
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Task Title</Label>
                              <Input
                                value={task.title}
                                onChange={(e) => updateTask(task.id, { title: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Estimated Hours</Label>
                              <Input
                                type="number"
                                value={task.estimatedHours}
                                onChange={(e) =>
                                  updateTask(task.id, { estimatedHours: Number.parseInt(e.target.value) || 0 })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Priority</Label>
                              <Select
                                value={task.priority}
                                onValueChange={(value: "low" | "medium" | "high") =>
                                  updateTask(task.id, { priority: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Assigned To</Label>
                              <Select
                                value={task.assignedTo}
                                onValueChange={(value) => updateTask(task.id, { assignedTo: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {teamMembers.map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                      {member.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              value={task.description}
                              onChange={(e) => updateTask(task.id, { description: e.target.value })}
                              className="min-h-20"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => setEditingTask(null)}>
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setEditingTask(null)}>
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{task.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingTask(task.id)}
                              className="h-8 w-8"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {assignedMember && (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={assignedMember.avatar || "/placeholder.svg"}
                                      alt={assignedMember.name}
                                    />
                                    <AvatarFallback className="text-xs">
                                      {assignedMember.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{assignedMember.name}</span>
                                </div>
                              )}
                              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {task.estimatedHours}h
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>

            <TabsContent value="milestones" className="space-y-4">
              {proposal.milestones.map((milestone) => {
                const isEditing = editingMilestone === milestone.id

                return (
                  <Card key={milestone.id} className="relative">
                    <CardContent className="p-4">
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Milestone Title</Label>
                              <Input
                                value={milestone.title}
                                onChange={(e) => updateMilestone(milestone.id, { title: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Due Date</Label>
                              <Input
                                type="date"
                                value={milestone.dueDate}
                                onChange={(e) => updateMilestone(milestone.id, { dueDate: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              value={milestone.description}
                              onChange={(e) => updateMilestone(milestone.id, { description: e.target.value })}
                              className="min-h-20"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => setEditingMilestone(null)}>
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setEditingMilestone(null)}>
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Flag className="h-4 w-4 text-primary" />
                                <h4 className="font-medium">{milestone.title}</h4>
                              </div>
                              <p className="text-sm text-muted-foreground">{milestone.description}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingMilestone(milestone.id)}
                              className="h-8 w-8"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(milestone.dueDate).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-muted-foreground">{milestone.tasks.length} tasks</div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Ready to create your project?</h3>
              <p className="text-sm text-muted-foreground">
                Review all details above and submit to create your AI-generated project.
              </p>
            </div>
            <Button onClick={() => onSubmit(proposal)} size="lg" className="ml-4">
              <CheckCircle className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
