"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  UserPlus,
  Building2,
  PieChart,
  FolderKanban,
  CheckSquare,
  HeadphonesIcon,
  Code2,
  BookOpen,
  Wrench,
  BarChart4,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { cn } from "@/lib/utils"

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Interessent', href: '/interessent' },
  { 
    icon: UserPlus, 
    label: 'Führender Manager', 
    href: '/fuhrende-manager',
    subItems: [
      { label: 'Übersicht', href: '/fuhrende-manager' },
      { label: 'Leads', href: '/fuhrende-manager/leads' },
      { label: 'Kampagnen', href: '/fuhrende-manager/kampagnen' },
    ]
  },
  { icon: Building2, label: 'Kunden', href: '/customers' },
  { 
    icon: PieChart, 
    label: 'Vertrieb', 
    href: '/vertrieb',
    subItems: [
      { label: 'Übersicht', href: '/vertrieb' },
      { label: 'Angebote', href: '/vertrieb/angebote' },
      { label: 'Verträge', href: '/vertrieb/vertrage' },
    ]
  },
  { icon: FolderKanban, label: 'Projekte', href: '/projekte' },
  { icon: CheckSquare, label: 'Aufgaben', href: '/aufgaben' },
  { icon: HeadphonesIcon, label: 'Support', href: '/support' },
  { 
    icon: Code2, 
    label: 'REST API', 
    href: '/rest-api',
    subItems: [
      { label: 'Dokumentation', href: '/rest-api/docs' },
      { label: 'Integrationen', href: '/rest-api/integrations' },
      { label: 'Entwicklung', href: '/rest-api/development' },
    ]
  },
  { icon: BookOpen, label: 'Knowledgebase', href: '/knowledgebase' },
  { icon: Wrench, label: 'Tools', href: '/tools' },
  { 
    icon: BarChart4, 
    label: 'Auswertungen', 
    href: '/auswertungen',
    subItems: [
      { label: 'Finanzberichte', href: '/auswertungen/finanz' },
      { label: 'Leistungsberichte', href: '/auswertungen/leistung' },
      { label: 'Kundenanalyse', href: '/auswertungen/kunden' },
    ]
  },
  { icon: Settings, label: 'Setup', href: '/setup' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([])

  const toggleSubmenu = (href: string) => {
    setOpenSubmenus(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  return (
    <div className="flex flex-col w-64 bg-gray-800 text-white h-screen overflow-y-auto transition-all duration-300 ease-in-out lg:w-64 lg:translate-x-0 -translate-x-full fixed lg:relative z-50">
      <div className="flex items-center justify-center h-20 shadow-md">
        <h1 className="text-3xl uppercase text-indigo-500">CRM</h1>
      </div>
      <nav className="flex-1">
        <ul className="py-4">
          {sidebarItems.map((item) => (
            <li key={item.href} className="px-4 py-2">
              {item.subItems ? (
                <div>
                  <div 
                    className={cn(
                      "flex items-center cursor-pointer rounded-lg px-3 py-2 transition-colors",
                      pathname.startsWith(item.href) ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"
                    )}
                    onClick={() => toggleSubmenu(item.href)}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span className="flex-1">{item.label}</span>
                    {openSubmenus.includes(item.href) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                  {openSubmenus.includes(item.href) && (
                    <ul className="pl-6 mt-2 space-y-2">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.href}>
                          <Link 
                            href={subItem.href}
                            className={cn(
                              "block rounded-lg px-3 py-2 transition-colors",
                              pathname === subItem.href ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"
                            )}
                          >
                            {subItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link 
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 transition-colors",
                    pathname === item.href ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}