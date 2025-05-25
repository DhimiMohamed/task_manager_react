"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
// import { Separator } from "@/components/ui/separator"
import { MessageCircle, Send, Bot, X, Minimize2, Maximize2 } from "lucide-react"
import { cn } from "@/lib/utils"
import ChatMessage from "./chat-message"
import VoiceInput from "./voice-input"
import TaskSummaryCard from "./task-summary-card"
import TaskVerificationModal from "./task-verification-modal"
import { Task, TaskStatusEnum } from "@/api/models/task"

interface ChatMessageType {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  taskSuggestion?: Task
}

interface AIAssistantPanelProps {
  isOpen: boolean
  onToggle: () => void
  className?: string
}

const initialMessages: ChatMessageType[] = [
  {
    id: "1",
    type: "assistant",
    content:
      "Hi! I'm your AI assistant. I can help you create tasks, schedule meetings, and manage your to-do list. Try saying something like 'Schedule a meeting with John tomorrow at 2 PM' or 'Remind me to call the dentist next week'.",
    timestamp: new Date(),
  },
]

export default function AIAssistantPanel({ isOpen, onToggle, className }: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [pendingTask, setPendingTask] = useState<Task | null>(null)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsProcessing(true)

    setTimeout(() => {
      const response = processUserInput(inputValue)
      setMessages((prev) => [...prev, response.message])
      if (response.taskSuggestion) setPendingTask(response.taskSuggestion)
      setIsProcessing(false)
    }, 1000)
  }

  const processUserInput = (input: string): { message: ChatMessageType; taskSuggestion?: Task } => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("meeting") || lowerInput.includes("schedule")) {
      const taskSuggestion: Task = {
        title: "Meeting",
        description: "Scheduled meeting",
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        start_time: "14:00",
        end_time: "15:00",
        category: 1,
        priority: 2,
        status: TaskStatusEnum.Pending,
        user: 1,
      }
      return {
        message: {
          id: Date.now().toString(),
          type: "assistant",
          content: "I've understood you want to schedule a meeting. Here's what I've prepared:",
          timestamp: new Date(),
          taskSuggestion,
        },
        taskSuggestion,
      }
    }

    if (lowerInput.includes("remind") || lowerInput.includes("task")) {
      const taskSuggestion: Task = {
        title: "Reminder Task",
        description: "Task created from reminder",
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        start_time: "09:00",
        end_time: "10:00",
        category: 2,
        priority: 2,
        status: TaskStatusEnum.Pending,
        user: 1,
      }
      return {
        message: {
          id: Date.now().toString(),
          type: "assistant",
          content: "I'll help you create a reminder. Here's what I've set up:",
          timestamp: new Date(),
          taskSuggestion,
        },
        taskSuggestion,
      }
    }

    return {
      message: {
        id: Date.now().toString(),
        type: "assistant",
        content:
          "I understand you want to manage your tasks. Could you be more specific? For example, you can say 'Schedule a meeting tomorrow at 2 PM' or 'Remind me to call the dentist next week'.",
        timestamp: new Date(),
      },
    }
  }

  const handleVoiceInput = (transcript: string) => {
    setInputValue(transcript)
  }

  const handleTaskAction = (action: string, task: Task) => {
    switch (action) {
      case "review":
      case "modify":
        setShowVerificationModal(true)
        break
      case "submit":
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: "assistant",
            content: `Perfect! I've created the task "${task.title}" for you. You can find it in your task list.`,
            timestamp: new Date(),
          },
        ])
        setPendingTask(null)
        break
      case "cancel":
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: "assistant",
            content: "No problem! The task has been cancelled. Is there anything else I can help you with?",
            timestamp: new Date(),
          },
        ])
        setPendingTask(null)
        break
    }
  }

  const handleTaskSubmit = (task: Task) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "assistant",
        content: `Great! I've updated and created the task "${task.title}" for you.`,
        timestamp: new Date(),
      },
    ])
    setPendingTask(null)
    setShowVerificationModal(false)
  }

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className={cn(
          "fixed shadow-lg z-50 rounded-full",
          isMobile ? "bottom-4 right-4 h-14 w-14" : "bottom-4 right-4 h-12 w-12",
        )}
        size="icon"
      >
        <MessageCircle className={cn(isMobile ? "h-7 w-7" : "h-6 w-6")} />
      </Button>
    )
  }

  return (
    <>
      <Card
        className={cn(
          "p-0", // 👈 THIS REMOVES THE UNWANTED py-6
          "fixed shadow-xl z-50 flex flex-col",
          isMobile && "inset-0 rounded-none",
          !isMobile && "bottom-4 right-4 w-96 h-[600px]",
          isMinimized && !isMobile && "h-16 p-4",
          className,
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between border-b",
            isMobile ? "p-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" : "p-3",
          )}
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {!isMobile && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMinimized(!isMinimized)}>
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggle}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {(!isMinimized || isMobile) && (
          <>
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full" ref={scrollAreaRef}>
                <div className="space-y-4 p-4">
                  {messages.map((message) => (
                    <div key={message.id}>
                      <ChatMessage message={message} isMobile={isMobile} />
                      {message.taskSuggestion && (
                        <div className="mt-2">
                          <TaskSummaryCard
                            task={message.taskSuggestion}
                            onAction={(action) => handleTaskAction(action, message.taskSuggestion!)}
                            isMobile={isMobile}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Bot className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* <Separator className="mt-0" /> */}

            <div className={cn("border-t bg-background", isMobile ? "p-4 pb-safe-area-inset-bottom" : "p-4")}>
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={isMobile ? "Type or speak..." : "Type or speak your command..."}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className={cn("pr-12", isMobile && "h-12 text-base")}
                  />
                  <VoiceInput
                    onTranscript={handleVoiceInput}
                    isListening={isListening}
                    onListeningChange={setIsListening}
                    isMobile={isMobile}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isProcessing}
                  size="icon"
                  className={cn(isMobile ? "h-12 w-12" : "h-10 w-10")}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {showVerificationModal && pendingTask && (
        <TaskVerificationModal
          task={pendingTask}
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          onSubmit={handleTaskSubmit}
          isMobile={isMobile}
        />
      )}
    </>
  )
}
