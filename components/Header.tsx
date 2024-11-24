"use client"

import { UserButton } from "@clerk/nextjs";
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  const getPageTitle = () => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard'
      case '/customers':
        return 'Customers'
      case '/projects':
        return 'Projects'
      case '/reports':
        return 'Reports'
      case '/settings':
        return 'Settings'
      default:
        return 'CRM Application'
    }
  }

  return (
    <header className="bg-white shadow-md">
      <div className="w-full mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
        <UserButton afterSignOutUrl="/"/>
      </div>
    </header>
  )
}