import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  isListening: boolean;
  onListeningChange: (listening: boolean) => void;
  isMobile?: boolean;
}

export default function VoiceInput({
  onTranscript,
  isListening,
  onListeningChange,
  isMobile = false,
}: VoiceInputProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setIsSupported(true);

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          onListeningChange(true);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = "";
          let interimTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          setTranscript(interimTranscript);

          if (finalTranscript) {
            onTranscript(finalTranscript);
            setTranscript("");
          }
        };

        recognition.onend = () => {
          onListeningChange(false);
          setTranscript("");
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error:", event.error);
          onListeningChange(false);
          setTranscript("");
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript, onListeningChange]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className={cn("absolute top-1/2 transform -translate-y-1/2", isMobile ? "right-3" : "right-2")}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(isListening && "text-red-500 animate-pulse", isMobile ? "h-10 w-10" : "h-8 w-8")}
        onClick={toggleListening}
      >
        {isListening ? (
          <MicOff className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
        ) : (
          <Mic className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
        )}
      </Button>
      {transcript && (
        <div
          className={cn(
            "absolute bottom-full mb-2 bg-background border rounded-md p-2 text-xs shadow-lg z-10",
            isMobile ? "right-0 max-w-64" : "right-0 max-w-48",
          )}
        >
          {transcript}
        </div>
      )}
    </div>
  );
}