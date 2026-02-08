'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { BarChart3, Users, Building2, MessageSquare, Settings, LogOut } from 'lucide-react'

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isActive = (path: string) => pathname === path

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/dashboard/leads', label: 'Leads', icon: Users },
    { href: '/dashboard/companies', label: 'Companies', icon: Building2 },
    { href: '/dashboard/replies', label: 'Replies', icon: MessageSquare },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings }
  ]

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold">O</span>
          </div>
          <div>
            <div className="text-sm font-bold text-sidebar-foreground">OreeAI</div>
            <div className="text-xs text-sidebar-accent-foreground">Outreach</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="px-4 py-2 bg-sidebar-accent rounded-lg">
          <div className="text-xs text-sidebar-accent-foreground opacity-70">Logged in as</div>
          <div className="text-sm font-medium text-sidebar-foreground truncate">{user?.email}</div>
        </div>
        <div className="flex gap-2">
          <ThemeToggle />
          <Button
            onClick={logout}
            variant="outline"
            className="flex-1 justify-start border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent bg-transparent"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
