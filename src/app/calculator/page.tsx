
"use client"

import { useState, useMemo } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { SidebarNav } from "@/components/dashboard/SidebarNav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { 
  Car, 
  Home, 
  Utensils, 
  Plane,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Upload,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { extractBillData } from "@/ai/flows/bill-ocr-flow"
import { useFirestore } from "@/firebase"
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"

const steps = [
  { id: 'transport', icon: Car, title: 'Transport', description: 'Weekly car usage and commuting habits.' },
  { id: 'energy', icon: Home, title: 'Energy', description: 'Electricity and heating consumption.' },
  { id: 'diet', icon: Utensils, title: 'Diet', description: 'Food sourcing and dietary preferences.' },
  { id: 'travel', icon: Plane, title: 'Air Travel', description: 'Annual flights and long-distance travel.' },
]

const FACTORS = {
  TRANSPORT: 0.17, 
  ENERGY: 0.4,    
  DIET_MEAT: 7.0,  
  FLIGHT: 500,     
}

const GUEST_ID = "guest_user_123"

export default function CalculatorPage() {
  const db = useFirestore()
  const { toast } = useToast()
  const router = useRouter()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  
  const [weeklyKm, setWeeklyKm] = useState(150)
  const [monthlyKwh, setMonthlyKwh] = useState(300)
  const [meatServings, setMeatServings] = useState(4)
  const [flightsPerYear, setFlightsPerYear] = useState(1)
  
  const [isUploading, setIsUploading] = useState(false)

  const calculations = useMemo(() => {
    const transport = (weeklyKm * 52 * FACTORS.TRANSPORT) / 1000;
    const energy = (monthlyKwh * 12 * FACTORS.ENERGY) / 1000;
    const diet = (meatServings * 52 * FACTORS.DIET_MEAT) / 1000;
    const travel = (flightsPerYear * FACTORS.FLIGHT) / 1000;
    
    return {
      transport: Number(transport.toFixed(2)),
      energy: Number(energy.toFixed(2)),
      diet: Number(diet.toFixed(2)),
      travel: Number(travel.toFixed(2)),
      total: Number((transport + energy + diet + travel).toFixed(2))
    }
  }, [weeklyKm, monthlyKwh, meatServings, flightsPerYear])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const result = await extractBillData({ imageData: base64 });
        setMonthlyKwh(result.consumptionKwh);
        toast({
          title: "Bill Analyzed!",
          description: `Extracted ${result.consumptionKwh} kWh from your ${result.provider} bill.`,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: "Could not read the bill. Please enter manually.",
        });
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAssessment = async () => {
    setIsSaving(true)
    const assessmentData = {
      userId: GUEST_ID,
      timestamp: new Date().toISOString(),
      totalKg: calculations.total * 1000,
      breakdown: {
        transport: calculations.transport * 1000,
        energy: calculations.energy * 1000,
        diet: calculations.diet * 1000,
        travel: calculations.travel * 1000,
      },
      inputs: {
        weeklyKm,
        monthlyKwh,
        meatServings,
        flightsPerYear
      }
    }

    try {
      if (db) {
        await addDoc(collection(db, "footprints"), {
          ...assessmentData,
          timestamp: serverTimestamp(),
        })

        await setDoc(doc(db, "userProfiles", GUEST_ID), {
          userId: GUEST_ID,
          displayName: "Guest Hero",
          photoURL: "",
          lastCalculated: serverTimestamp(),
          currentFootprint: calculations.total,
        }, { merge: true })
      } else {
        // Fallback for Demo Mode
        const history = JSON.parse(localStorage.getItem('footprints') || '[]')
        localStorage.setItem('footprints', JSON.stringify([assessmentData, ...history]))
        localStorage.setItem('userProfile', JSON.stringify({
          userId: GUEST_ID,
          displayName: "Guest Hero",
          currentFootprint: calculations.total,
        }))
      }

      toast({
        title: "Footprint Saved!",
        description: db ? "Assessment synced to cloud." : "Assessment saved locally (Guest Mode).",
      })
      router.push('/dashboard')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error saving data",
        description: "Could not save your results.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleSaveAssessment()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const ActiveIcon = steps[currentStep].icon

  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <SidebarInset className="p-6 md:p-10 flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8">
            <div className="flex justify-between items-center mb-8 px-2">
              {steps.map((step, idx) => (
                <div key={step.id} className="flex flex-col items-center gap-2">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                    idx === currentStep ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 
                    idx < currentStep ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'
                  }`}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest hidden sm:block ${
                    idx === currentStep ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>

            <Card className="bento-card">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <ActiveIcon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-2xl">{steps[currentStep].title}</CardTitle>
                </div>
                <CardDescription>{steps[currentStep].description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 py-6">
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Weekly Driving Distance (km)</Label>
                        <span className="text-primary font-bold">{weeklyKm} km</span>
                      </div>
                      <Slider 
                        value={[weeklyKm]} 
                        onValueChange={(val) => setWeeklyKm(val[0])}
                        max={1000} 
                        step={10} 
                        className="py-4" 
                      />
                    </div>
                  </div>
                )}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="p-6 border-2 border-dashed border-primary/20 rounded-xl bg-primary/5 text-center group transition-colors hover:border-primary/40">
                      <input type="file" id="bill-upload" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                      <label htmlFor="bill-upload" className="cursor-pointer flex flex-col items-center gap-2">
                        {isUploading ? <Loader2 className="h-10 w-10 animate-spin text-primary" /> : <Upload className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />}
                        <span className="font-bold">Scan Energy Bill</span>
                        <span className="text-xs text-muted-foreground">AI will extract consumption automatically</span>
                      </label>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Monthly Electricity (kWh)</Label>
                        <span className="text-primary font-bold">{monthlyKwh} kWh</span>
                      </div>
                      <Slider 
                        value={[monthlyKwh]} 
                        onValueChange={(val) => setMonthlyKwh(val[0])}
                        max={2000} 
                        step={10} 
                        className="py-4" 
                      />
                    </div>
                  </div>
                )}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Meat Servings per Week</Label>
                        <span className="text-primary font-bold">{meatServings} servings</span>
                      </div>
                      <Slider 
                        value={[meatServings]} 
                        onValueChange={(val) => setMeatServings(val[0])}
                        max={21} 
                        step={1} 
                        className="py-4" 
                      />
                    </div>
                  </div>
                )}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Annual Flights (Return Trips)</Label>
                        <span className="text-primary font-bold">{flightsPerYear} flights</span>
                      </div>
                      <Slider 
                        value={[flightsPerYear]} 
                        onValueChange={(val) => setFlightsPerYear(val[0])}
                        max={20} 
                        step={1} 
                        className="py-4" 
                      />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t border-border/50 pt-6">
                <Button variant="ghost" onClick={handleBack} disabled={currentStep === 0}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button onClick={handleNext} disabled={isSaving} className="bg-primary hover:bg-primary/90 min-w-[140px]">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                    currentStep === steps.length - 1 ? 'Save Assessment' : 'Continue'
                  )}
                  {!isSaving && <ChevronRight className="ml-2 h-4 w-4" />}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <Card className="bento-card border-accent/20 sticky top-10">
              <CardHeader>
                <CardTitle className="text-lg">Real-time Impact</CardTitle>
                <CardDescription>Projected annual emissions</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-5xl font-headline font-bold text-accent mb-2 tracking-tighter">
                  {calculations.total}
                </div>
                <div className="text-sm text-muted-foreground mb-6 uppercase tracking-widest font-bold">Tons CO2e / Year</div>
                
                <div className="space-y-6 text-left">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground">
                      <span>Transport</span>
                      <span>{calculations.transport} t</span>
                    </div>
                    <Progress value={(calculations.transport / calculations.total) * 100} className="h-1" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground">
                      <span>Home Energy</span>
                      <span>{calculations.energy} t</span>
                    </div>
                    <Progress value={(calculations.energy / calculations.total) * 100} className="h-1" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground">
                      <span>Diet & Lifestyle</span>
                      <span>{calculations.diet} t</span>
                    </div>
                    <Progress value={(calculations.diet / calculations.total) * 100} className="h-1" />
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-xs font-bold">Offset: {Math.ceil(calculations.total * 45)} trees / yr</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </SidebarInset>
    </div>
  )
}
