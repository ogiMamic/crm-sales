"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  FileText, 
  MessageSquare, 
  Bell, 
  Briefcase,
  ClipboardList,
  Mail
} from 'lucide-react'

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: "text-sky-500"
  },
  {
    label: 'Kunden',
    icon: Users,
    href: '/customers',
    color: "text-violet-500",
  },
  {
    label: 'Projekte',
    icon: FolderKanban,
    color: "text-pink-700",
    href: '/projekte',
  },
  {
    label: 'Angebote',
    icon: FileText,
    color: "text-orange-700",
    href: '/offers',
  },
  {
    label: 'Rechnungen',
    icon: FileText,
    color: "text-yellow-700",
    href: '/invoices',
  },
  {
    label: 'Nachrichten',
    icon: MessageSquare,
    color: "text-emerald-500",
    href: '/messages',
  },
  {
    label: 'Erinnerungen',
    icon: Bell,
    color: "text-green-700",
    href: '/reminders',
  },
  {
    label: 'Mitarbeiter Zuweisung',
    icon: Briefcase,
    color: "text-blue-700",
    href: '/employee-allocation',
  },
  {
    label: 'Aufgaben',
    icon: ClipboardList,
    color: "text-indigo-700",
    href: '/tasks',
  },
  {
    label: 'E-Mail',
    icon: Mail,
    color: "text-red-700",
    href: '/email',
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">
            CRM Sales
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400",
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}