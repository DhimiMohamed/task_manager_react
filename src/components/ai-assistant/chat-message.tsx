"use client"

import { format } from "date-fns"
import { Bot, User, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ChatMessageType {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  toolResults?: any[]
  details?: string[]
}

interface ChatMessageProps {
  message: ChatMessageType
  isMobile?: boolean
}

export default function ChatMessage({ message, isMobile = false }: ChatMessageProps) {
  const isUser = message.type === "user"

  const handlePlayAudio = () => {
    // Text-to-speech functionality
    if ("speechSynthesis" in window) {
      const speechContent = [
        message.content,
        ...(message.details || []),
      ].join(". ")

      const utterance = new SpeechSynthesisUtterance(speechContent)
      utterance.rate = 0.9
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className={cn("flex items-start gap-2", isUser && "flex-row-reverse", isMobile ? "gap-3" : "gap-2")}>
      {/* Avatar */}
      <div
        className={cn(
          "rounded-full flex items-center justify-center flex-shrink-0",
          isMobile ? "w-10 h-10" : "w-8 h-8",
          isUser ? "bg-primary text-primary-foreground" : "bg-gradient-to-br from-blue-500 to-purple-600 text-white",
        )}
      >
        {isUser ? (
          <User className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
        ) : (
          <Bot className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
        )}
      </div>

      {/* Message Content */}
      <div className={cn("flex flex-col space-y-1", isMobile ? "max-w-[85%]" : "max-w-[80%]", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2",
            isMobile ? "text-base leading-relaxed" : "text-sm",
            isUser ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md",
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
          
          {/* Display details if they exist */}
          {message.details && message.details.length > 0 && (
            <div className="mt-2 text-muted-foreground">
              <ul className="list-disc pl-4 space-y-1">
                {message.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex items-center space-x-2 text-xs text-muted-foreground px-1",
            isUser && "flex-row-reverse space-x-reverse",
          )}
        >
          <span>{format(message.timestamp, "HH:mm")}</span>
          {!isUser && (
            <Button
              variant="ghost"
              size="icon"
              className={cn("hover:bg-transparent", isMobile ? "h-6 w-6 p-0" : "h-4 w-4 p-0")}
              onClick={handlePlayAudio}
            >
              <Volume2 className={cn(isMobile ? "h-4 w-4" : "h-3 w-3")} />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}