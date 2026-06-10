
"use client"

import { SidebarInset } from "@/components/ui/sidebar"
import { SidebarNav } from "@/components/dashboard/SidebarNav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Zap, Utensils, Car, TreePine, Timer } from "lucide-react"

const challenges = [
  {
    id: 1,
    title: "Commute Clean",
    description: "Bike or walk to work for 3 consecutive days.",
    points: 150,
    progress: 66,
    icon: Car,
    daysLeft: 2,
    category: "Transport"
  },
  {
    id: 2,
    title: "Green Chef",
    description: "Prepare 5 meat-free meals this week.",
    points: 200,
    progress: 40,
    icon: Utensils,
    daysLeft: 4,
    category: "Diet"
  },
  {
    id: 3,
    title: "Phantom Power Hunt",
    description: "Unplug all electronics not in use for 24 hours.",
    points: 100,
    progress: 0,
    icon: Zap,
    daysLeft: 1,
    category: "Home Energy"
  },
  {
    id: 4,
    title: "Reforest Your World",
    description: "Plant a native tree or support a local reforestation project.",
    points: 500,
    progress: 0,
    icon: TreePine,
    daysLeft: 14,
    category: "Environment"
  }
]

export default function ChallengesPage() {
  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <SidebarInset className="p-6 md:p-10">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold mb-2">Eco Challenges</h1>
            <p className="text-muted-foreground">Complete tasks to earn points and climb the community leaderboard.</p>
          </div>
          <div className="hidden md:block">
            <Card className="bg-primary/10 border-primary/20 p-4">
              <p className="text-xs text-primary font-bold uppercase tracking-widest mb-1">Current Points</p>
              <p className="text-3xl font-headline font-bold text-primary">850</p>
            </Card>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="bento-card flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center text-primary">
                    <challenge.icon className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className="text-primary border-primary/30">
                      +{challenge.points} Points
                    </Badge>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      <Timer className="h-3 w-3" />
                      {challenge.daysLeft}d remaining
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <CardTitle className="font-headline text-xl mb-1">{challenge.title}</CardTitle>
                  <CardDescription className="text-sm">{challenge.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Progress</span>
                    <span>{challenge.progress}%</span>
                  </div>
                  <Progress value={challenge.progress} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t border-border/50">
                <Button className="w-full bg-secondary hover:bg-secondary/80 text-foreground border border-border">
                  {challenge.progress === 100 ? (
                    <><CheckCircle2 className="mr-2 h-4 w-4 text-accent" /> Completed</>
                  ) : (
                    'Log Progress'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </SidebarInset>
    </div>
  )
}
