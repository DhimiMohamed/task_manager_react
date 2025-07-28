// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Textarea } from "@/components/ui/textarea"
// import { Label } from "@/components/ui/label"
// import { Sparkles, Loader2, ArrowRight, ArrowLeft } from "lucide-react"
// import TeamSelector from "./team-selector"
// import AIProjectProposal from "./ai-project-proposal"
// export interface TeamMember {
//   id: string
//   name: string
//   email: string
//   role: "owner" | "admin" | "member"
//   avatar?: string
//   joinedAt: string
//   status: "active" | "pending" | "inactive"
// }

// interface AIProjectCreatorProps {
//   isOpen: boolean
//   onClose: () => void
// }

// interface ProjectProposal {
//   name: string
//   description: string
//   deadline: string
//   priority: "low" | "medium" | "high"
//   estimatedDuration: string
//   tasks: {
//     id: string
//     title: string
//     description: string
//     assignedTo: string
//     priority: "low" | "medium" | "high"
//     estimatedHours: number
//     dependencies: string[]
//   }[]
//   milestones: {
//     id: string
//     title: string
//     description: string
//     dueDate: string
//     tasks: string[]
//   }[]
// }

// const steps = [
//   { id: 1, title: "Describe Project", description: "Tell AI about your project idea" },
//   { id: 2, title: "Select Team", description: "Choose team members for the project" },
//   { id: 3, title: "Review Proposal", description: "Review and modify AI suggestions" },
// ]

// export default function AIProjectCreator({ isOpen, onClose }: AIProjectCreatorProps) {
//   const [currentStep, setCurrentStep] = useState(1)
//   const [projectDescription, setProjectDescription] = useState("")
//   const [selectedTeam, setSelectedTeam] = useState<TeamMember[]>([])
//   const [isGenerating, setIsGenerating] = useState(false)
//   const [proposal, setProposal] = useState<ProjectProposal | null>(null)

//   const handleGenerateProposal = async () => {
//     if (!projectDescription.trim() || selectedTeam.length === 0) return

//     setIsGenerating(true)

//     // Simulate AI processing
//     setTimeout(() => {
//       const aiProposal: ProjectProposal = {
//         name: "AI-Generated Project",
//         description: projectDescription,
//         deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
//         priority: "medium",
//         estimatedDuration: "4-6 weeks",
//         tasks: [
//           {
//             id: "1",
//             title: "Project Planning & Requirements",
//             description: "Define project scope, requirements, and create initial documentation",
//             assignedTo: selectedTeam[0]?.id || "",
//             priority: "high",
//             estimatedHours: 16,
//             dependencies: [],
//           },
//           {
//             id: "2",
//             title: "Design & Architecture",
//             description: "Create system design, wireframes, and technical architecture",
//             assignedTo: selectedTeam[1]?.id || selectedTeam[0]?.id || "",
//             priority: "high",
//             estimatedHours: 24,
//             dependencies: ["1"],
//           },
//           {
//             id: "3",
//             title: "Core Development",
//             description: "Implement main features and functionality",
//             assignedTo: selectedTeam[2]?.id || selectedTeam[0]?.id || "",
//             priority: "medium",
//             estimatedHours: 40,
//             dependencies: ["2"],
//           },
//           {
//             id: "4",
//             title: "Testing & Quality Assurance",
//             description: "Comprehensive testing, bug fixes, and quality assurance",
//             assignedTo: selectedTeam[3]?.id || selectedTeam[1]?.id || "",
//             priority: "medium",
//             estimatedHours: 20,
//             dependencies: ["3"],
//           },
//           {
//             id: "5",
//             title: "Deployment & Launch",
//             description: "Deploy to production and handle launch activities",
//             assignedTo: selectedTeam[0]?.id || "",
//             priority: "high",
//             estimatedHours: 12,
//             dependencies: ["4"],
//           },
//         ],
//         milestones: [
//           {
//             id: "1",
//             title: "Project Kickoff",
//             description: "Project planning completed and team aligned",
//             dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
//             tasks: ["1"],
//           },
//           {
//             id: "2",
//             title: "Design Complete",
//             description: "All designs and architecture finalized",
//             dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
//             tasks: ["2"],
//           },
//           {
//             id: "3",
//             title: "Development Complete",
//             description: "Core functionality implemented and ready for testing",
//             dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
//             tasks: ["3"],
//           },
//           {
//             id: "4",
//             title: "Project Launch",
//             description: "Project tested, deployed, and launched successfully",
//             dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
//             tasks: ["4", "5"],
//           },
//         ],
//       }

//       setProposal(aiProposal)
//       setIsGenerating(false)
//       setCurrentStep(3)
//     }, 3000)
//   }

//   const handleSubmitProject = (finalProposal: ProjectProposal) => {
//     // Here you would normally save the project
//     console.log("Creating project:", finalProposal)
//     onClose()
//     // Reset state
//     setCurrentStep(1)
//     setProjectDescription("")
//     setSelectedTeam([])
//     setProposal(null)
//   }

//   const handleNext = () => {
//     if (currentStep === 2) {
//       handleGenerateProposal()
//     } else {
//       setCurrentStep(currentStep + 1)
//     }
//   }

//   const handleBack = () => {
//     setCurrentStep(currentStep - 1)
//   }

//   const canProceed = () => {
//     switch (currentStep) {
//       case 1:
//         return projectDescription.trim().length > 0
//       case 2:
//         return selectedTeam.length > 0
//       case 3:
//         return proposal !== null
//       default:
//         return false
//     }
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <Sparkles className="h-5 w-5 text-yellow-500" />
//             Create Project with AI
//           </DialogTitle>
//         </DialogHeader>

//         {/* Progress Steps */}
//         <div className="flex items-center justify-between mb-6">
//           {steps.map((step, index) => (
//             <div key={step.id} className="flex items-center">
//               <div
//                 className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
//                   currentStep >= step.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
//                 }`}
//               >
//                 {step.id}
//               </div>
//               <div className="ml-2 hidden sm:block">
//                 <p
//                   className={`text-sm font-medium ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"}`}
//                 >
//                   {step.title}
//                 </p>
//                 <p className="text-xs text-muted-foreground">{step.description}</p>
//               </div>
//               {index < steps.length - 1 && (
//                 <div className={`w-12 h-px mx-4 ${currentStep > step.id ? "bg-primary" : "bg-muted"}`} />
//               )}
//             </div>
//           ))}
//         </div>

//         {/* Step Content */}
//         <div className="flex-1 overflow-y-auto">
//           {currentStep === 1 && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>Describe Your Project</CardTitle>
//                 <CardDescription>
//                   Tell the AI about your project idea. Be as detailed as possible to get better suggestions.
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="description">Project Description</Label>
//                   <Textarea
//                     id="description"
//                     placeholder="E.g., I want to create a mobile app for task management with real-time collaboration features. The app should have user authentication, project creation, task assignment, and notification system..."
//                     value={projectDescription}
//                     onChange={(e) => setProjectDescription(e.target.value)}
//                     className="min-h-32 resize-none"
//                   />
//                   <p className="text-xs text-muted-foreground">{projectDescription.length}/1000 characters</p>
//                 </div>
//                 <div className="bg-muted/50 p-4 rounded-lg">
//                   <h4 className="font-medium mb-2">💡 Tips for better AI suggestions:</h4>
//                   <ul className="text-sm text-muted-foreground space-y-1">
//                     <li>• Mention the type of project (web app, mobile app, etc.)</li>
//                     <li>• Include key features and functionality</li>
//                     <li>• Specify any technical requirements or constraints</li>
//                     <li>• Mention target timeline or deadlines</li>
//                   </ul>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {currentStep === 2 && (
//             <TeamSelector selectedTeam={selectedTeam} onTeamChange={setSelectedTeam} isGenerating={isGenerating} />
//           )}

//           {currentStep === 3 && proposal && (
//             <AIProjectProposal
//               proposal={proposal}
//               onProposalChange={setProposal}
//               teamMembers={selectedTeam}
//               onSubmit={handleSubmitProject}
//             />
//           )}
//         </div>

//         {/* Navigation */}
//         <div className="flex justify-between pt-4 border-t">
//           <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back
//           </Button>

//           <div className="flex gap-2">
//             <Button variant="outline" onClick={onClose}>
//               Cancel
//             </Button>
//             {currentStep < 3 ? (
//               <Button onClick={handleNext} disabled={!canProceed() || isGenerating}>
//                 {isGenerating ? (
//                   <>
//                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                     Generating...
//                   </>
//                 ) : (
//                   <>
//                     Next
//                     <ArrowRight className="h-4 w-4 ml-2" />
//                   </>
//                 )}
//               </Button>
//             ) : null}
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }
