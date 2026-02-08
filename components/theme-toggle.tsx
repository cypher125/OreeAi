'use client'

import { useTheme } from '@/lib/theme-context'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-lg hover:bg-sidebar-accent"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon size={20} className="text-sidebar-foreground" />
      ) : (
        <Sun size={20} className="text-sidebar-foreground" />
      )}
    </Button>
  )
}
