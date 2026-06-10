
"use client"

import { useState, useMemo } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { SidebarNav } from "@/components/dashboard/SidebarNav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { BrainCircuit, Send, Sparkles, AlertCircle, RefreshCcw, Landmark } from "lucide-react"
import { aiSustainabilityCoach, AISustainabilityCoachOutput } from "@/ai/flows/ai-sustainability-coach-flow"
import { useFirestore, useCollection } from "@/firebase"
import { collection, query, where, orderBy, limit } from "firebase/firestore"

const GUEST_ID = "guest_user_123"

export default function CoachPage() {
  const db = useFirestore()
  const [loading, setLoading] = useState(false)
  const [userInput, setUserInput] = useState("")
  const [results, setResults] = useState<AISustainabilityCoachOutput | null>(null)

  const footprintQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "footprints"), 
      where("userId", "==", GUEST_ID), 
      orderBy("timestamp", "desc"),
      limit(1)
    );
  }, [db]);

  const { data: footprintDocs } = useCollection(footprintQuery);

  const footprintContext = useMemo(() => {
    if (!footprintDocs || footprintDocs.length === 0) return "No footprint data available.";
    const fp = footprintDocs[0];
    return `User total footprint is ${(fp.totalKg / 1000).toFixed(1)} tons CO2e per year. 
    Breakdown: Transport: ${fp.breakdown.transport}kg, Energy: ${fp.breakdown.energy}kg, Diet: ${fp.breakdown.diet}kg, Travel: ${fp.breakdown.travel}kg.
    Inputs: ${fp.inputs.weeklyKm}km/week driving, ${fp.inputs.monthlyKwh}kWh/month electricity, ${fp.inputs.meatServings} meat servings/week.`;
  }, [footprintDocs]);

  const handleAskCoach = async () => {
    if (!userInput.trim()) return
    setLoading(true)
    try {
      const response = await aiSustainabilityCoach({
        carbonFootprintSummary: footprintContext,
        recentActivities: [userInput]
      })
      setResults(response)
    } catch (error) {
      console.error('Coach Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <SidebarInset className="p-6 md:p-10">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-bold font-headline tracking-tighter">AI Strategy Coach</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Personalized reduction strategies based on your actual emission sources and habit updates.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-6">
            <Card className="bento-card">
              <CardHeader>
                <CardTitle className="text-lg">Recent Progress</CardTitle>
                <CardDescription>Tell the coach about recent changes or challenges you're facing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea 
                  placeholder="e.g., I've switched to LED bulbs but I'm still driving a lot to visit family..."
                  className="min-h-[150px] bg-secondary/30 resize-none border-none focus-visible:ring-primary"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 font-bold" 
                  disabled={loading || !userInput.trim()}
                  onClick={handleAskCoach}
                >
                  {loading ? <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Get AI Strategy
                </Button>
              </CardContent>
            </Card>

            <Card className="bento-card border-accent/20 bg-accent/5">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <AlertCircle className="h-5 w-5 text-accent" />
                <CardTitle className="text-sm font-bold uppercase tracking-widest">Active Footprint</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-headline font-bold text-accent mb-1">
                  {footprintDocs && footprintDocs[0] ? (footprintDocs[0].totalKg / 1000).toFixed(1) : '0.0'} t
                </div>
                <p className="text-[10px] text-muted-foreground font-medium">
                  {footprintDocs && footprintDocs[0] ? 'Based on latest assessment' : 'No data available'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8">
            {!results && !loading ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 glass-panel border-dashed border-2 border-primary/10">
                <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-6">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">Awaiting your input...</h3>
                <p className="text-muted-foreground max-w-sm">
                  Gemini will analyze your actual carbon sources and provide specific, high-impact recommendations.
                </p>
              </div>
            ) : loading ? (
              <div className="h-full flex flex-col items-center justify-center p-12 glass-panel">
                <div className="flex gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
                </div>
                <p className="text-sm font-bold text-muted-foreground animate-pulse uppercase tracking-widest">Synthesizing personalized strategy...</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="bento-card border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-2xl tracking-tight">
                      <Sparkles className="h-6 w-6 text-primary" />
                      Gemini Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="leading-relaxed text-foreground/90 text-lg">
                      {results?.analysis}
                    </p>
                  </CardContent>
                </Card>

                <div className="grid gap-4">
                  <h3 className="text-xs font-bold font-headline uppercase tracking-widest text-muted-foreground px-1">Actionable Recommendations</h3>
                  {results?.recommendations.map((rec, idx) => (
                    <Card key={idx} className="bento-card p-5 hover:translate-x-1 transition-transform cursor-pointer border-l-4 border-l-primary/40">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-3 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="bg-secondary/50 text-[10px] uppercase tracking-wider">{rec.category}</Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-[10px] uppercase font-bold ${
                                rec.impactLevel === 'high' ? 'text-accent border-accent/30 bg-accent/5' : 
                                rec.impactLevel === 'medium' ? 'text-primary border-primary/30 bg-primary/5' : 'text-muted-foreground border-border'
                              }`}
                            >
                              {rec.impactLevel} Impact
                            </Badge>
                          </div>
                          <p className="font-bold text-xl leading-tight font-headline">{rec.action}</p>
                        </div>
                        {rec.estimatedSavings && (
                          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg border border-primary/20 min-w-[120px]">
                            <Landmark className="h-4 w-4 text-primary" />
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold uppercase text-muted-foreground leading-none">Saving Est.</span>
                              <span className="text-primary font-bold text-sm">{rec.estimatedSavings}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </div>
  )
}
