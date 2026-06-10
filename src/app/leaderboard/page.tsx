
"use client"

import { useMemo } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { SidebarNav } from "@/components/dashboard/SidebarNav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, TrendingDown, Medal, User, Loader2, TreePine } from "lucide-react"
import { useFirestore, useCollection, useUser } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"

export default function LeaderboardPage() {
  const { user: currentUser } = useUser()
  const db = useFirestore()

  const leaderboardQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "userProfiles"),
      orderBy("totalPoints", "desc"),
      limit(20)
    );
  }, [db]);

  const { data: topUsers, loading } = useCollection(leaderboardQuery);

  const communityStats = useMemo(() => {
    if (!topUsers) return { totalSaved: 0, trees: 0 };
    const total = topUsers.reduce((acc, u) => acc + (u.totalCO2SavedKg || 0), 0);
    return {
      totalSaved: (total / 1000).toFixed(1),
      trees: Math.ceil(total / 22) // ~22kg CO2 per tree per year
    };
  }, [topUsers]);

  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <SidebarInset className="p-6 md:p-10">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2 font-headline tracking-tighter">Community Impact</h1>
          <p className="text-muted-foreground">Collaborative efforts are driving global change. See our collective impact.</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Card className="bento-card p-0 overflow-hidden">
              {loading ? (
                <div className="p-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <Table>
                  <TableHeader className="bg-secondary/20">
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead className="w-[100px] text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rank</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">User</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Saved</TableHead>
                      <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(topUsers || []).map((user, idx) => (
                      <TableRow 
                        key={user.userId} 
                        className={`border-border/50 hover:bg-secondary/30 transition-colors ${user.userId === currentUser?.uid ? 'bg-primary/5' : ''}`}
                      >
                        <TableCell className="font-headline font-bold text-lg">
                          {idx === 0 ? <Medal className="h-6 w-6 text-accent" /> : 
                           idx === 1 ? <Medal className="h-6 w-6 text-primary" /> : 
                           idx === 2 ? <Medal className="h-6 w-6 text-muted-foreground" /> : 
                           `#${idx + 1}`}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-primary/20">
                              <AvatarImage src={user.photoURL} />
                              <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className={`font-medium ${user.userId === currentUser?.uid ? 'text-primary font-bold' : ''}`}>
                              {user.displayName} {user.userId === currentUser?.uid && "(You)"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-accent font-bold">
                            <TrendingDown className="h-3 w-3" />
                            {(user.totalCO2SavedKg / 1000 || 0).toFixed(1)} t
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className="font-mono bg-secondary/50">{user.totalPoints || 0}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="bento-card border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Global Savings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-6 border-b border-border/50">
                  <div className="text-5xl font-headline font-bold text-primary mb-2 tracking-tighter">
                    {communityStats.totalSaved} <span className="text-xl font-normal opacity-70">tons</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">CO₂e removed by this community</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-accent/10 rounded-xl border border-accent/20">
                  <div className="flex items-center gap-3">
                    <TreePine className="h-8 w-8 text-accent" />
                    <div>
                      <p className="text-xl font-bold font-headline leading-none text-accent">{communityStats.trees}</p>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">Tree Equivalent</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bento-card border-border/40">
              <CardHeader>
                <CardTitle className="text-xs font-bold uppercase tracking-widest">Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">Refer Network</p>
                    <p className="text-[10px] text-muted-foreground font-medium">+500 pts per activation</p>
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
