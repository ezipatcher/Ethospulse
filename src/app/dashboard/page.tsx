
'use client';

import { useMemo, useState, useEffect } from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { MetricsChart } from "@/components/dashboard/MetricsChart";
import { EarthVisualization } from "@/components/dashboard/EarthVisualization";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirestore, useCollection, useDoc } from "@/firebase";
import { collection, query, where, orderBy, limit, doc } from "firebase/firestore";
import { 
  TrendingDown, 
  Award,
  Loader2,
  Flame,
  Globe,
  Wind
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Link from "next/link";
import { Button } from "@/components/ui/button";

const GUEST_ID = "guest_user_123"

export default function DashboardPage() {
  const db = useFirestore();
  const [localHistory, setLocalHistory] = useState<any[]>([]);

  // Real-time Firestore query
  const historyQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "footprints"), 
      where("userId", "==", GUEST_ID), 
      orderBy("timestamp", "desc"),
      limit(10)
    );
  }, [db]);

  const profileRef = useMemo(() => db ? doc(db, "userProfiles", GUEST_ID) : null, [db]);
  const { data: profile } = useDoc(profileRef);
  const { data: footprintHistory, loading: dataLoading } = useCollection(historyQuery);

  // Load localStorage fallback if db is missing
  useEffect(() => {
    if (!db) {
      const history = JSON.parse(localStorage.getItem('footprints') || '[]');
      setLocalHistory(history);
    }
  }, [db]);

  const stats = useMemo(() => {
    const history = footprintHistory || localHistory;
    if (!history || history.length === 0) return null;
    
    const latest = history[0];
    const prev = history[1];
    
    const totalKg = latest.totalKg;
    const reduction = prev ? ((prev.totalKg - latest.totalKg) / prev.totalKg) * 100 : 12.5;
    
    const breakdown = latest.breakdown || { transport: 0, energy: 0, diet: 0, travel: 0 };
    
    const chartData = [...history].reverse().map(fp => {
      let dateLabel = 'Recent';
      if (fp.timestamp?.toDate) {
        dateLabel = fp.timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (typeof fp.timestamp === 'string') {
        dateLabel = new Date(fp.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      return {
        date: dateLabel,
        footprint: fp.totalKg
      }
    });

    const annualTons = totalKg / 1000;
    const health = Math.max(10, Math.min(100, (10 - annualTons + 5) * 10));

    return {
      totalKg: Math.round(totalKg),
      reduction: reduction.toFixed(1),
      points: profile?.xp || 850, 
      level: profile?.level || 1,
      streak: profile?.streak || 5,
      renewable: 64,
      health,
      chartData,
      categories: [
        { name: 'Transport', value: Math.round((breakdown.transport / latest.totalKg) * 100), color: 'hsl(var(--primary))' },
        { name: 'Home Energy', value: Math.round((breakdown.energy / latest.totalKg) * 100), color: 'hsl(var(--accent))' },
        { name: 'Diet', value: Math.round((breakdown.diet / latest.totalKg) * 100), color: 'hsl(var(--chart-3))' },
        { name: 'Other', value: Math.max(5, 100 - (Math.round((breakdown.transport / latest.totalKg) * 100) + Math.round((breakdown.energy / latest.totalKg) * 100) + Math.round((breakdown.diet / latest.totalKg) * 100))), color: 'hsl(var(--muted-foreground))' }
      ]
    };
  }, [footprintHistory, localHistory, profile]);

  if (dataLoading && db) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <SidebarInset className="p-6 md:p-10">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold font-headline tracking-tighter">Impact Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, Explorer. Your footprint is {stats ? `down ${stats.reduction}% this month.` : 'ready for assessment.'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/twin">Simulate Twin</Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground font-bold rounded-full">
              <Link href="/calculator">New Assessment</Link>
            </Button>
          </div>
        </header>

        {stats ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="bento-card bg-secondary/20">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Footprint</CardTitle>
                  <TrendingDown className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalKg.toLocaleString()} kg</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-primary font-bold">-{stats.reduction}%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bento-card bg-secondary/20">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Eco Points</CardTitle>
                  <Award className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.points}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Rank #24 in Community
                  </p>
                </CardContent>
              </Card>

              <Card className="bento-card bg-secondary/20">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Challenges</CardTitle>
                  <Flame className="h-4 w-4 text-chart-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    2 expiring soon
                  </p>
                </CardContent>
              </Card>

              <Card className="bento-card bg-secondary/20">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Renewable Usage</CardTitle>
                  <Wind className="h-4 w-4 text-chart-3" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.renewable}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-chart-3 font-bold">+5%</span> from last week
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-12 mb-8">
              <Card className="lg:col-span-8 bento-card flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Emission Trends</CardTitle>
                  <CardDescription>Daily carbon footprint tracking (kg CO2e)</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pt-4">
                  <MetricsChart data={stats.chartData} />
                </CardContent>
              </Card>

              <Card className="lg:col-span-4 bento-card flex flex-col items-center justify-center text-center">
                <CardHeader className="w-full text-left">
                  <CardTitle className="text-xl font-bold">Planet Health</CardTitle>
                  <CardDescription>Your current impact status</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-6 py-6">
                  <EarthVisualization health={stats.health} />
                  <div className="space-y-1">
                    <p className="text-2xl font-bold font-headline">{stats.health}% Healthy</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Global Sustainability Index</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-12 bento-card flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                   <CardHeader className="px-0">
                    <CardTitle className="text-xl font-bold">Category Breakdown</CardTitle>
                    <CardDescription>Major impact sources from your lifestyle</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 h-[250px]">
                     <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.categories}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stats.categories.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </div>
                <div className="w-full md:w-64 flex flex-col justify-center gap-4">
                  {stats.categories.map((cat: any) => (
                    <div key={cat.name} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20">
                      <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">{cat.name}</span>
                        <span className="text-lg font-bold">{cat.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        ) : (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center p-12 glass-panel border-dashed border-2 border-primary/20">
            <Globe className="h-16 w-16 text-muted-foreground mb-6 opacity-50" />
            <h2 className="text-2xl font-bold mb-2">Initialize Your Impact</h2>
            <p className="text-muted-foreground max-w-sm mb-8">
              Calculate your footprint to unlock the dashboard and start your journey as an Explorer.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 rounded-full px-8">
              <Link href="/calculator">Calculate Footprint</Link>
            </Button>
          </div>
        )}
      </SidebarInset>
    </div>
  );
}
