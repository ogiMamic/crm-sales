"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  FileText, 
  MessageSquare, 
  Bell, 
  Briefcase,
  ClipboardList,
  Mail,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    label: 'Kunden',
    icon: Users,
    href: '/customers',
  },
  {
    label: 'Projekte',
    icon: FolderKanban,
    href: '/projekte',
  },
  {
    label: 'Angebote',
    icon: FileText,
    href: '/offers',
  },
  {
    label: 'Rechnungen',
    icon: FileText,
    href: '/invoices',
  },
  {
    label: 'Nachrichten',
    icon: MessageSquare,
    href: '/messages',
  },
  {
    label: 'Erinnerungen',
    icon: Bell,
    href: '/reminders',
  },
  {
    label: 'Mitarbeiter Zuweisung',
    icon: Briefcase,
    href: '/employee-allocation',
  },
  {
    label: 'Aufgaben',
    icon: ClipboardList,
    href: '/tasks',
  },
  {
    label: 'E-Mail',
    icon: Mail,
    href: '/email',
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={cn(
      "relative flex flex-col h-full bg-[#111827] text-white transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="px-3 py-4 flex justify-between items-center">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center">
            <h1 className="text-2xl font-bold">
              CRM Sales
            </h1>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-4">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400",
                isCollapsed && "justify-center"
              )}
            >
              <div className={cn("flex items-center flex-1", isCollapsed && "justify-center")}>
                <route.icon className={cn("h-5 w-5 text-white", isCollapsed ? "mr-0" : "mr-3")} />
                {!isCollapsed && route.label}
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}