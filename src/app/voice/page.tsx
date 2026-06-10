
"use client"

import { useState, useRef } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { SidebarNav } from "@/components/dashboard/SidebarNav"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Volume2, Sparkles, Loader2 } from "lucide-react"
import { speakSustainabilityStrategy } from "@/ai/flows/voice-coach-flow"

export default function VoiceCoachPage() {
  const [isListening, setIsListening] = useState(false)
  const [loading, setLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleStartConversation = async () => {
    setLoading(true)
    try {
      const response = await speakSustainabilityStrategy(
        "Give me a 15-second summary of why reducing air travel is the highest impact action for my personal footprint."
      );
      setAudioUrl(response.media);
      setIsListening(true);
      if (audioRef.current) {
        audioRef.current.src = response.media;
        audioRef.current.play();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false)
    }
  }

  const handleStop = () => {
    setIsListening(false);
    if (audioRef.current) audioRef.current.pause();
  }

  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <SidebarInset className="p-6 md:p-10 flex flex-col items-center justify-center">
        <div className="max-w-md w-full text-center space-y-12">
           <div className="relative inline-block">
              <div className={`absolute inset-0 rounded-full bg-primary/20 blur-3xl animate-pulse ${isListening ? 'scale-150' : 'scale-0'}`}></div>
              <div className="relative h-48 w-48 rounded-full bg-secondary border-4 border-primary/20 flex items-center justify-center overflow-hidden">
                 {isListening ? (
                   <div className="flex gap-1 items-end h-16">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-2 bg-primary animate-bounce" style={{ animationDelay: `${i * 0.1}s`, height: `${20 + Math.random() * 60}%` }}></div>
                      ))}
                   </div>
                 ) : (
                    <Volume2 className="h-20 w-20 text-muted-foreground opacity-20" />
                 )}
              </div>
           </div>

           <div>
              <h1 className="text-4xl font-bold font-headline mb-4 tracking-tighter">Voice Mentor</h1>
              <p className="text-muted-foreground">
                Ask Gemini to verbally explain your environmental strategy. Supporting 15+ languages.
              </p>
           </div>

           <div className="flex justify-center gap-4">
              {!isListening ? (
                <Button 
                  size="lg" 
                  onClick={handleStartConversation} 
                  disabled={loading}
                  className="h-16 px-10 rounded-full bg-primary hover:bg-primary/90 text-xl font-bold"
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <Mic className="h-6 w-6 mr-3" />}
                  {loading ? 'Synthesizing...' : 'Start Briefing'}
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  variant="destructive"
                  onClick={handleStop} 
                  className="h-16 px-10 rounded-full text-xl font-bold"
                >
                  <MicOff className="h-6 w-6 mr-3" />
                  Stop Briefing
                </Button>
              )}
           </div>

           <Card className="bento-card border-primary/20 bg-primary/5">
              <CardContent className="py-6 flex items-center gap-4">
                 <Sparkles className="h-6 w-6 text-primary shrink-0" />
                 <p className="text-sm text-left">
                    "EthosPulse Voice Mentor uses high-fidelity neural synthesis to provide conversational reduction strategy."
                 </p>
              </CardContent>
           </Card>

           <audio ref={audioRef} className="hidden" onEnded={() => setIsListening(false)} />
        </div>
      </SidebarInset>
    </div>
  )
}
