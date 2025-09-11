// src\pages\ProjectProposalPage.tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Sparkles, Loader2, ArrowRight, ArrowLeft, Home } from "lucide-react"
import { useNavigate } from "react-router-dom"
import TeamSelector from "@/components/projects/team-selector"
import AIProjectProposal from "@/components/projects/ai-project-proposal"
import { ProjectsApi } from "@/api/apis/projects-api"
import { ProjectsGenerateProposalCreateRequest } from "@/api/models/projects-generate-proposal-create-request"
import { ProjectsGenerateProposalCreate200Response } from "@/api/models/projects-generate-proposal-create200-response"
import { toast } from "sonner"
import customAxios from "@/lib/customAxios"

export interface TeamMember {
  id: string
  name: string
  email: string
  role: "owner" | "admin" | "member"
  avatar?: string
  skills: string[]
  department: string
  joinedAt: string
  status: "active" | "pending" | "inactive"
}

interface ProjectTask {
  id: string
  title: string
  description: string
  assignedTo: string
  assignedToEmail: string
  priority: "low" | "medium" | "high"
  estimatedHours: number
  dependencies: string[]
  skillsRequired: string[]
}

interface ProjectPhase {
  id: string
  name: string
  description: string
  duration: string
  tasks: ProjectTask[]
}

interface ProjectProposal {
  name: string
  description: string
  deadline: string
  priority: "low" | "medium" | "high"
  estimatedDuration: string
  phases: ProjectPhase[]
  milestones: {
    id: string
    title: string
    description: string
    dueDate: string
    tasks: string[]
  }[]
  resourceRequirements: string[]
  riskAssessment: {
    risk: string
    mitigation: string
  }[]
  successMetrics: string[]
}

const steps = [
  { id: 1, title: "Describe Project", description: "Tell AI about your project idea" },
  { id: 2, title: "Select Team", description: "Choose team members for the project" },
  { id: 3, title: "Review Proposal", description: "Review and modify AI suggestions" },
]

// Transform API response to internal format
const transformAPIResponse = (apiResponse: ProjectsGenerateProposalCreate200Response): ProjectProposal => {
  const phases: ProjectPhase[] = apiResponse.proposal?.phases?.map((phase: any, phaseIndex: number) => ({
    id: `phase-${phaseIndex + 1}`,
    name: phase.phase_name || `Phase ${phaseIndex + 1}`,
    description: phase.description || '',
    duration: phase.duration || '',
    tasks: phase.tasks?.map((task: any, taskIndex: number) => ({
      id: `task-${phaseIndex + 1}-${taskIndex + 1}`,
      title: task.task_name || `Task ${taskIndex + 1}`,
      description: task.description || '',
      assignedTo: task.assigned_to || '',
      assignedToEmail: task.assigned_to_email || '',
      priority: (task.priority?.toLowerCase() || 'medium') as "low" | "medium" | "high",
      estimatedHours: parseInt(task.estimated_hours) || 0,
      dependencies: [],
      skillsRequired: task.skills_required || []
    })) || []
  })) || []

  // Generate milestones from phases
  const milestones = phases.map((phase, index) => ({
    id: `milestone-${index + 1}`,
    title: `${phase.name} Complete`,
    description: `Completion of ${phase.name} phase`,
    dueDate: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    tasks: phase.tasks.map(task => task.id)
  }))

  return {
    name: apiResponse.proposal?.project_name || 'Untitled Project',
    description: apiResponse.proposal?.description || '',
    deadline: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 12 weeks from now
    priority: "medium",
    estimatedDuration: apiResponse.proposal?.estimated_duration || '',
    phases,
    milestones,
    resourceRequirements: apiResponse.proposal?.resource_requirements || [],
    riskAssessment: apiResponse.proposal?.risk_assessment?.map((item: any) => ({
      risk: item.risk || '',
      mitigation: item.mitigation || ''
    })) || [],
    successMetrics: apiResponse.proposal?.success_metrics || []
  }
}

export default function CreateAIProjectPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [projectDescription, setProjectDescription] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<TeamMember[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [proposal, setProposal] = useState<ProjectProposal | null>(null)
  const [error, setError] = useState<string | null>(null)

  const projectsApi = new ProjectsApi(undefined,undefined,customAxios)

  const handleGenerateProposal = async () => {
    if (!projectDescription.trim() || selectedTeam.length === 0 || !selectedTeamId) {
      toast.error("Please provide project description and select team members.")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const requestData: ProjectsGenerateProposalCreateRequest = {
        team_id: selectedTeamId,
        member_ids: selectedTeam.map(member => parseInt(member.id)),
        project_requirements: projectDescription
      }

      const response = await projectsApi.projectsGenerateProposalCreate(requestData)
      
      if (response.data && response.data.success) {
        const transformedProposal = transformAPIResponse(response.data)
        setProposal(transformedProposal)
        setCurrentStep(3)
        
        toast.success("AI has successfully generated your project proposal.")
      } else {
        throw new Error(response.data?.validation?.errors?.join(", ") || "Failed to generate proposal")
      }
    } catch (err: any) {
      console.error("Error generating proposal:", err)
      const errorMessage = err.response?.data?.message || err.message || "Failed to generate project proposal"
      setError(errorMessage)
      
      toast.error(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmitProject = async (finalProposal: ProjectProposal) => {
  try {
    const submissionData = {
      name: finalProposal.name,
      description: finalProposal.description,
      deadline: finalProposal.deadline,
      teamId: selectedTeamId,
      phases: finalProposal.phases.map((phase) => ({
        name: phase.name,
        description: phase.description,
        tasks: phase.tasks.map((task) => ({
          title: task.title,
          description: task.description,
          assignedToId: parseInt(task.assignedTo),
          priority: task.priority,
        })),
      })),
      // Keep these for future use but they'll be ignored by backend for now
      milestones: finalProposal.milestones,
      resourceRequirements: finalProposal.resourceRequirements,
      riskAssessment: finalProposal.riskAssessment,
      successMetrics: finalProposal.successMetrics,
    };

    const response = await customAxios.post('/projects/create-from-proposal/', submissionData);
    
    if (response.data.success) {
      toast.success(response.data.message);
      navigate("/projects");
    } else {
      throw new Error(response.data.message || 'Failed to create project');
    }
  } catch (err: any) {
    console.error("Error creating project:", err);
    const errorMessage = err.response?.data?.message || err.message || "Failed to create project. Please try again.";
    toast.error(errorMessage);
  }
}

  const handleNext = () => {
    if (currentStep === 2) {
      handleGenerateProposal()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
    setError(null)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return projectDescription.trim().length > 0
      case 2:
        return selectedTeam.length > 0 && selectedTeamId !== null
      case 3:
        return proposal !== null
      default:
        return false
    }
  }

  // Update team selection handler
  const handleTeamSelectionChange = (team: TeamMember[], teamId: number | null) => {
    setSelectedTeam(team)
    setSelectedTeamId(teamId)
  }

  return (
    <div className="container mx-auto py-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/projects")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-yellow-500" />
              Create Project with AI
            </h1>
            <p className="text-muted-foreground">Let AI help you plan and organize your project</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate("/projects")}>
          <Home className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                    currentStep >= step.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p
                    className={`text-sm font-medium ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-px mx-6 ${currentStep > step.id ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <div className="h-4 w-4 rounded-full bg-destructive flex items-center justify-center">
                <span className="text-xs text-destructive-foreground">!</span>
              </div>
              <p className="text-sm font-medium">Error generating proposal</p>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      <div className="min-h-[600px]">
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Describe Your Project</CardTitle>
              <CardDescription>
                Tell the AI about your project idea. Be as detailed as possible to get better suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  placeholder="E.g., I want to create a mobile app for task management with real-time collaboration features. The app should have user authentication, project creation, task assignment, and notification system..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="min-h-20 resize-none"
                />
                <p className="text-xs text-muted-foreground">{projectDescription.length}/1000 characters</p>
              </div>
              <div className="bg-muted/50 p-6 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">💡 Tips for better AI suggestions:</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Mention the type of project (web app, mobile app, etc.)</li>
                  <li>• Include key features and functionality</li>
                  <li>• Specify any technical requirements or constraints</li>
                  <li>• Mention target timeline or deadlines</li>
                  <li>• Include any specific technologies or frameworks</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <TeamSelector 
            selectedTeam={selectedTeam} 
            onTeamChange={handleTeamSelectionChange}
            isGenerating={isGenerating} 
          />
        )}

        {currentStep === 3 && proposal && (
          <AIProjectProposal
            proposal={proposal}
            onProposalChange={setProposal}
            teamMembers={selectedTeam}
            onSubmit={handleSubmitProject}
          />
        )}
      </div>

      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || isGenerating}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/projects")} disabled={isGenerating}>
                Cancel
              </Button>
              {currentStep < 3 ? (
                <Button onClick={handleNext} disabled={!canProceed() || isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}