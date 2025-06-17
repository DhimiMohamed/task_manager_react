import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIAssistantApi } from "@/api/apis/aiassistant-api";
import customAxios from "@/lib/customAxios";

interface VoiceInputProps {
  onResponse: (response: any) => void; // Changed from onTranscript to onResponse
  isMobile?: boolean;
}

export default function VoiceInput({
  onResponse, // Changed from onTranscript to onResponse
  isMobile = false,
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Check if MediaRecorder is supported
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        console.warn('audio/webm not supported, falling back to default');
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : undefined
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType || 'audio/webm' 
        });
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsSupported(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Convert blob to File
      const audioFile = new File([audioBlob], 'recording.webm', { 
        type: audioBlob.type 
      });

      const aiAssistantApi = new AIAssistantApi(undefined, undefined, customAxios);
      const response = await aiAssistantApi.voiceToText(audioFile);
      
      // Since voiceToText returns the complete AI response, pass it directly
      onResponse(response.data);
    } catch (error) {
      console.error('Error processing audio:', error);
      // Create error response in the same format as the API
      onResponse({
        response: {
          user_message: 'Error processing audio. Please try again.',
          details: [],
          tool_results: []
        }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (!isSupported) {
    return null;
  }

  const isActive = isRecording || isProcessing;

  return (
    <div className={cn("absolute top-1/2 transform -translate-y-1/2", isMobile ? "right-3" : "right-2")}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          isRecording && "text-red-500 animate-pulse",
          isProcessing && "text-blue-500",
          isMobile ? "h-10 w-10" : "h-8 w-8"
        )}
        onClick={toggleRecording}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Loader2 className={cn("animate-spin", isMobile ? "h-5 w-5" : "h-4 w-4")} />
        ) : isRecording ? (
          <MicOff className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
        ) : (
          <Mic className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
        )}
      </Button>
      
      {isActive && (
        <div
          className={cn(
            "absolute bottom-full mb-2 bg-background border rounded-md p-2 text-xs shadow-lg z-10",
            isMobile ? "right-0 max-w-64" : "right-0 max-w-48",
          )}
        >
          {isRecording ? "Recording..." : "Processing..."}
        </div>
      )}
    </div>
  );
}