
'use client';

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Leaf, BrainCircuit, BarChart3, Users, ChevronRight, Globe, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()

  const handleAction = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="font-headline text-xl font-bold">EthosPulse</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleAction} className="text-sm font-medium">
              Explore Demo
            </Button>
            <Button onClick={handleAction} className="bg-primary hover:bg-primary/90 rounded-full px-6">
              Launch App
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full opacity-50"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full opacity-50"></div>
        </div>

        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-8">
            <Globe className="h-4 w-4 animate-spin-slow" />
            Public Access Enabled • No Login Required
          </div>
          
          <h1 className="text-6xl md:text-8xl font-headline font-bold mb-8 leading-[1] tracking-tighter">
            Your Impact. <br/>
            <span className="text-primary italic">Decoded by AI.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            EthosPulse is an intelligent sustainability platform. Calculate your footprint, simulate your future carbon twin, and compete in global eco-challenges instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleAction} className="h-16 px-10 text-xl bg-primary hover:bg-primary/90 rounded-full group shadow-2xl shadow-primary/20">
              Get Started Now
              <ChevronRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-10 text-xl rounded-full border-white/10 hover:bg-white/5" onClick={handleAction}>
              View Live Demo
            </Button>
          </div>

          <div className="mt-16 flex items-center justify-center gap-8 grayscale opacity-50">
            <div className="flex items-center gap-2"><Zap className="h-5 w-5" /> <span className="text-sm font-bold uppercase tracking-widest">Real-time Analysis</span></div>
            <div className="flex items-center gap-2"><BrainCircuit className="h-5 w-5" /> <span className="text-sm font-bold uppercase tracking-widest">Gemini Powered</span></div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-secondary/20 border-y border-white/5">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bento-card">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-6">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-4 font-headline">Eco-Metrics Dashboard</h3>
              <p className="text-muted-foreground">Real-time visualization of your carbon trends and reduction milestones. No setup needed.</p>
            </div>
            <div className="bento-card">
              <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent mb-6">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-4 font-headline">AI Carbon Twin</h3>
              <p className="text-muted-foreground">Simulate future lifestyle decisions and predict your footprint months in advance with Gemini.</p>
            </div>
            <div className="bento-card">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-4 font-headline">Arena Mode</h3>
              <p className="text-muted-foreground">Join a global community and compete in sustainability challenges to rank on the leaderboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="container mx-auto px-6 text-center text-muted-foreground text-sm flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
             <Leaf className="h-4 w-4 text-primary" />
             <span className="font-bold">EthosPulse</span>
          </div>
          <p>© 2024 EthosPulse • Open Access Sustainability Platform</p>
        </div>
      </footer>
    </div>
  )
}
