import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bot, Mic, MicOff } from "lucide-react"
import { cn } from "@/lib/utils"
// import { TasksApi } from "@/api/apis/tasks-api"
import customAxios from "@/lib/customAxios"

interface VoiceUIProps {
  isMobile: boolean
}

export default function VoiceUI({ isMobile }: VoiceUIProps) {
  const [isVoiceTalking, setIsVoiceTalking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      cleanupMediaResources()
    }
  }, [])

  const cleanupMediaResources = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
  }

  const startRecording = async () => {
    try {
      console.log("Requesting microphone access...")
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        console.log("Data available:", e.data.size)
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        console.log("Recording stopped")
        if (audioChunksRef.current.length === 0) {
          console.warn("No audio data recorded")
          setIsVoiceTalking(false)
          return
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await processAudio(audioBlob)
      }

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event)
        setIsVoiceTalking(false)
        cleanupMediaResources()
      }

      console.log("Starting recording...")
      mediaRecorder.start(1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setIsVoiceTalking(false)
      cleanupMediaResources()
    }
  }

  const stopRecording = () => {
    console.log("Stopping recording...")
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    setIsVoiceTalking(false)
    cleanupMediaResources()
  }

  const playAudioResponse = (audioBlob: Blob) => {
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    audio.onerror = () => console.error("Error playing audio")
    audio.onended = () => URL.revokeObjectURL(audioUrl) // Clean up
    audio.play()
  }

  const processAudio = async (audioBlob: Blob) => {
    if (isProcessing) {
      console.warn("Already processing audio")
      return
    }

    console.log("Processing audio...")
    setIsProcessing(true)

    try {
      // Use axios directly to bypass the typed API and get proper response handling
      const formData = new FormData()
      const audioFile = new File([audioBlob], "recording.wav", { type: 'audio/wav' })
      formData.append('file', audioFile)

      console.log("Sending audio to API...")
      
      // Make direct axios call with proper response handling
      const response = await customAxios.post('/tasks/chat-agent/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'arraybuffer', // This ensures we get binary data properly
      })

      console.log("API response received", response)

      // Check the content type to determine if it's audio or JSON
      const contentType = response.headers['content-type'] || ''
      
      if (contentType.includes('audio')) {
        // Response is audio - create blob and play it
        console.log("Playing audio response...")
        const audioResponseBlob = new Blob([response.data], { type: contentType })
        playAudioResponse(audioResponseBlob)
      } else {
        // Response might be JSON but received as arraybuffer
        try {
          // Convert arraybuffer to string for JSON parsing
          const textDecoder = new TextDecoder()
          const jsonString = textDecoder.decode(response.data)
          const responseData = JSON.parse(jsonString)
          
          if (responseData.response) {
            console.log("Text response received:", responseData.response)
            // Convert text to speech using Web Speech API
            speakText(responseData.response)
          }
        } catch (parseError) {
          console.error("Error parsing response:", parseError)
          // If it's not JSON, treat as text
          const textDecoder = new TextDecoder()
          const textResponse = textDecoder.decode(response.data)
          console.log("Text response:", textResponse)
          speakText(textResponse)
        }
      }
    } catch (error: any) {
      console.error("Error processing audio:", error)
      
      // Handle axios response errors
      if (error.response) {
        const contentType = error.response.headers?.['content-type'] || ''
        
        if (contentType.includes('audio')) {
          // Even error responses might contain audio
          console.log("Playing error audio response...")
          const audioResponseBlob = new Blob([error.response.data], { type: contentType })
          playAudioResponse(audioResponseBlob)
        } else {
          console.error("API Error:", error.response.data)
        }
      }
    } finally {
      setIsProcessing(false)
      cleanupMediaResources()
    }
  }

  // Add text-to-speech functionality
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US' // or your preferred language
      utterance.rate = 0.9 // Slightly slower for clarity
      utterance.pitch = 1
      utterance.volume = 0.8
      
      utterance.onend = () => {
        console.log("Speech synthesis completed")
      }
      
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event)
      }
      
      console.log("Speaking text:", text)
      speechSynthesis.speak(utterance)
    } else {
      console.warn("Speech synthesis not supported in this browser")
    }
  }

  const toggleVoiceTalking = async () => {
    console.log("Toggle voice talking clicked")
    if (isProcessing) {
      console.warn("Processing in progress, ignoring click")
      return
    }

    if (isVoiceTalking) {
      stopRecording()
    } else {
      setIsVoiceTalking(true)
      await startRecording()
    }
  }

  return (
    <div className={cn("flex-1 flex flex-col items-center justify-center", isMobile ? "p-8" : "p-6")}>
      <div className="text-center space-y-6">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
          <Bot className="h-12 w-12 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Voice Assistant</h3>
          <p className="text-muted-foreground text-sm">
            {isProcessing 
              ? "Processing your request..." 
              : isVoiceTalking 
                ? "Listening..." 
                : "Click the button below to start talking"
            }
          </p>
        </div>
        <Button
          size="lg"
          className={cn(
            "h-16 px-8 rounded-full text-lg font-medium transition-all",
            isVoiceTalking && "bg-red-500 hover:bg-red-600 animate-pulse",
          )}
          onClick={toggleVoiceTalking}
          disabled={isProcessing}
        >
          {isVoiceTalking ? (
            <>
              <MicOff className="h-6 w-6 mr-2" />
              Stop Talking
            </>
          ) : (
            <>
              <Mic className="h-6 w-6 mr-2" />
              Start Talking
            </>
          )}
        </Button>
        {(isVoiceTalking || isProcessing) && (
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        )}
      </div>
    </div>
  )
}