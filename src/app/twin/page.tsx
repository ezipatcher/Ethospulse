
"use client"

import { useState, useMemo } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { SidebarNav } from "@/components/dashboard/SidebarNav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { generateCarbonTwinForecast, PredictionOutput } from "@/ai/flows/prediction-flow"
import { useFirestore, useCollection } from "@/firebase"
import { collection, query, where, orderBy, limit } from "firebase/firestore"
import { 
  Dna, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  AlertTriangle,
  Zap,
  Car,
  Utensils,
  History,
  Loader2
} from "lucide-react"

const GUEST_ID = "guest_user_123"

export default function CarbonTwinPage() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<PredictionOutput | null>(null)
  
  // Simulation Inputs
  const [carKm, setCarKm] = useState(150)
  const [dietMeat, setDietMeat] = useState(4)
  const [scenario, setScenario] = useState("Standard Progress")

  // Fetch current data for context using GUEST_ID
  const historyQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "footprints"), 
      where("userId", "==", GUEST_ID), 
      orderBy("timestamp", "desc"),
      limit(1)
    );
  }, [db]);

  const { data: latestAssessment } = useCollection(historyQuery);
  const currentTotal = latestAssessment?.[0]?.totalKg / 1000 || 0;

  const handleRunSimulation = async () => {
    setLoading(true)
    try {
      const forecast = await generateCarbonTwinForecast({
        currentFootprint: currentTotal,
        transportHabits: `${carKm} km/week driving`,
        energyHabits: "Standard home energy",
        dietHabits: `${dietMeat} meat servings/week`,
        simulationScenario: scenario
      });
      setResults(forecast);
      toast({ title: "Simulation Complete", description: "Your AI Carbon Twin has been updated." });
    } catch (e) {
      toast({ variant: "destructive", title: "Simulation Failed", description: "Check your connection and try again." });
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
            <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-accent-foreground shadow-lg shadow-accent/20">
              <Dna className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-bold font-headline tracking-tighter">AI Carbon Twin</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Simulate your environmental future. Adjust your digital twin's habits to visualize impact milestones.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-6">
             <Card className="bento-card">
                <CardHeader>
                   <CardTitle className="text-lg">Habit Simulation</CardTitle>
                   <CardDescription>Adjust the sliders to see future impact.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                   <div className="space-y-4">
                      <div className="flex justify-between">
                         <label className="text-xs font-bold uppercase flex items-center gap-2">
                            <Car className="h-4 w-4 text-primary" /> Transport (km/wk)
                         </label>
                         <span className="text-primary font-bold">{carKm}</span>
                      </div>
                      <Slider value={[carKm]} onValueChange={(v) => setCarKm(v[0])} max={1000} step={10} />
                   </div>
                   <div className="space-y-4">
                      <div className="flex justify-between">
                         <label className="text-xs font-bold uppercase flex items-center gap-2">
                            <Utensils className="h-4 w-4 text-accent" /> Meat Servings (wk)
                         </label>
                         <span className="text-accent font-bold">{dietMeat}</span>
                      </div>
                      <Slider value={[dietMeat]} onValueChange={(v) => setDietMeat(v[0])} max={21} step={1} />
                   </div>
                   <div className="pt-4 space-y-2">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">Scenario Mode</p>
                      <div className="flex flex-wrap gap-2">
                         {["Switch to EV", "Solar Installation", "Vegan Transition", "Standard Progress"].map(s => (
                            <Badge 
                              key={s} 
                              variant={scenario === s ? "default" : "outline"} 
                              className="cursor-pointer px-3 py-1"
                              onClick={() => setScenario(s)}
                            >
                              {s}
                            </Badge>
                         ))}
                      </div>
                   </div>
                </CardContent>
                <CardFooter>
                   <Button onClick={handleRunSimulation} className="w-full bg-accent hover:bg-accent/90 font-bold" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                      Sync Carbon Twin
                   </Button>
                </CardFooter>
             </Card>

             <Card className="bento-card bg-primary/5 border-primary/20">
                <CardHeader>
                   <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Status Quo</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="text-4xl font-headline font-bold mb-1">{currentTotal} t</div>
                   <p className="text-xs text-muted-foreground">Current annual carbon baseline.</p>
                </CardContent>
             </Card>
          </div>

          {/* Forecast Results */}
          <div className="lg:col-span-7">
             {!results && !loading ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-muted-foreground/20 rounded-2xl">
                   <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-6">
                      <History className="h-8 w-8 text-muted-foreground" />
                   </div>
                   <h3 className="text-xl font-bold mb-2">Simulation Ready</h3>
                   <p className="text-muted-foreground max-w-sm">
                      Sync your digital twin to visualize your footprint in 1 month, 6 months, and 1 year based on your simulated choices.
                   </p>
                </div>
             ) : loading ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 glass-panel">
                   <div className="flex gap-2 mb-4">
                      <div className="h-2 w-2 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 rounded-full bg-accent animate-bounce"></div>
                   </div>
                   <p className="text-sm font-bold text-muted-foreground animate-pulse uppercase tracking-widest">Processing environmental quantum state...</p>
                </div>
             ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                   {/* Forecast Grid */}
                   <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: '1 Month', val: results.forecasts.oneMonth },
                        { label: '6 Months', val: results.forecasts.sixMonths },
                        { label: '1 Year', val: results.forecasts.oneYear }
                      ].map((f, i) => (
                        <Card key={i} className="bento-card text-center p-4 border-accent/20">
                           <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">{f.label}</p>
                           <div className="text-2xl font-bold font-headline text-accent">{f.val} t</div>
                        </Card>
                      ))}
                   </div>

                   {/* Risk Assessment */}
                   <Card className="bento-card border-l-4 border-l-red-500 bg-red-500/5">
                      <CardHeader className="pb-2">
                         <div className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="h-5 w-5" />
                            <CardTitle className="text-sm font-bold uppercase tracking-widest">Climate Risk Score</CardTitle>
                         </div>
                      </CardHeader>
                      <CardContent>
                         <div className="flex items-end gap-4">
                            <div className="text-5xl font-bold font-headline">{results.riskScore}</div>
                            <div className="flex-1 pb-2">
                               <Progress value={results.riskScore} className="h-2 bg-red-950" />
                            </div>
                         </div>
                         <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                            {results.simulationAnalysis}
                         </p>
                      </CardContent>
                   </Card>

                   {/* Insight Cards */}
                   <div className="grid gap-4">
                      <Card className="bento-card p-6 flex items-center justify-between group hover:border-accent transition-colors">
                         <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                               <Zap className="h-6 w-6" />
                            </div>
                            <div>
                               <p className="font-bold text-lg">Optimization Insight</p>
                               <p className="text-xs text-muted-foreground">AI suggest reducing diet by 2 more meat servings.</p>
                            </div>
                         </div>
                         <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-transform group-hover:translate-x-1" />
                      </Card>
                   </div>
                </div>
             )}
          </div>
        </div>
      </SidebarInset>
    </div>
  )
}
