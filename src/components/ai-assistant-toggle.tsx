import { useState } from "react"
import AIAssistantPanel from "./ai-assistant/ai-assistant-panel"

export default function AIAssistantToggle() {
  const [isOpen, setIsOpen] = useState(false)

  return <AIAssistantPanel isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
}
