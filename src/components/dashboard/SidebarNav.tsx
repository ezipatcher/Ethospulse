
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Calculator, 
  BrainCircuit, 
  Trophy, 
  Users, 
  Leaf,
  Dna,
  Mic
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Dna, label: "Carbon Twin", href: "/twin" },
  { icon: Calculator, label: "Calculator", href: "/calculator" },
  { icon: Mic, label: "Voice Mentor", href: "/voice" },
  { icon: BrainCircuit, label: "Strategy AI", href: "/coach" },
  { icon: Trophy, label: "Challenges", href: "/challenges" },
  { icon: Users, label: "Arena", href: "/leaderboard" },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="py-6 px-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="font-headline text-xl font-bold tracking-tight group-data-[collapsible=icon]:hidden">
            EthosPulse
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
