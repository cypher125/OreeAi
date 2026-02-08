'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  BarChart3, 
  Users, 
  Building2, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ChevronsUpDown, 
  Sparkles,
  Moon,
  Sun
} from 'lucide-react'

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const isActive = (path: string) => pathname === path

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/dashboard/leads', label: 'Leads', icon: Users },
    { href: '/dashboard/companies', label: 'Companies', icon: Building2 },
    { href: '/dashboard/replies', label: 'Replies', icon: MessageSquare },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings }
  ]

  // Get user initials
  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'U'

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col fixed left-0 top-0 transition-all duration-300">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-sidebar-primary/20 transition-transform group-hover:scale-105">
            <span className="text-sidebar-primary-foreground font-bold text-xl">O</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-sidebar-foreground tracking-tight">OreeAI</span>
            <span className="text-[10px] font-medium text-sidebar-muted-foreground uppercase tracking-wider flex items-center gap-1">
              Outreach <Sparkles size={8} className="text-sidebar-primary" />
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        <div className="px-3 mb-2 text-xs font-semibold text-sidebar-muted-foreground uppercase tracking-wider">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href} className="block">
              <button
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/10'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <Icon
                  size={20}
                  className={`transition-colors ${
                    active ? 'text-sidebar-primary-foreground' : 'text-sidebar-muted-foreground group-hover:text-sidebar-accent-foreground'
                  }`}
                />
                <span className="text-sm font-medium">{item.label}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary-foreground/30" />
                )}
              </button>
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full h-auto p-2 flex items-center justify-between hover:bg-sidebar-accent rounded-xl group"
            >
              <div className="flex items-center gap-3 text-left">
                <Avatar className="h-9 w-9 border border-sidebar-border">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-sidebar-primary/10 text-sidebar-primary font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-sidebar-foreground truncate max-w-[120px]">
                    {user?.email?.split('@')[0]}
                  </span>
                  <span className="text-xs text-sidebar-muted-foreground truncate max-w-[120px]">
                    {user?.email}
                  </span>
                </div>
              </div>
              <ChevronsUpDown size={16} className="text-sidebar-muted-foreground group-hover:text-sidebar-foreground transition-colors" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" side="right" sideOffset={10}>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
              {theme === 'light' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
