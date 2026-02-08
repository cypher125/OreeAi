import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend
}: StatCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-card-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-accent" />}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          <div className="text-2xl font-bold text-card-foreground">{value}</div>
          {description && (
            <div className="text-xs text-muted-foreground">{description}</div>
          )}
          {trend && (
            <div
              className={`text-xs font-medium ${
                trend.direction === 'up' ? 'text-accent' : 'text-destructive'
              }`}
            >
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
